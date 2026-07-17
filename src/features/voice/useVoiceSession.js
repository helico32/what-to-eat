import { useRef, useState } from 'react'

// Constructeur avec préfixe webkit : Chrome expose les deux, Safari uniquement
// le préfixé, Firefox aucun. Si absent → `supported: false` → le bouton mic
// est masqué (même traitement que le radio "Alertes" quand Notification
// est 'unsupported').
const Recognition =
  typeof window !== 'undefined' &&
  (window.SpeechRecognition || window.webkitSpeechRecognition)

// Fin de session automatique après N ms de silence SUIVANT le premier mot dicté.
// "Terminer" reste le chemin principal — ce timer est le secours.
// Ne pas redescendre à 2 000 "pour la réactivité" : 2 s était un bug TDAH.
// La spec d'origine disait à la fois "pause = séparateur d'items" et "2 s = fin
// de session" — ces deux phrases ne cohabitent pas. Le persona fait des pauses
// pour chercher le prochain produit dans son sac ; couper à 2 s ferme la session
// pendant qu'elle réfléchit. 8 s est le bon compromis : assez long pour une pause
// naturelle, assez court pour ne pas laisser une session zombie ouverte.
// Pas de timer "elle n'a jamais parlé" : l'API déclenche onerror no-speech
// (~8 s sur Chrome) elle-même — en ajouter un serait de la complexité défensive.
const SESSION_END_MS = 8000

/**
 * Cycle de vie complet de SpeechRecognition dans un seul hook.
 * Tout le côté capricieux de l'API (préfixes, restart, erreurs) vit ici —
 * les composants ne voient qu'une interface neutre. Le jour de Capacitor,
 * @capacitor-community/speech-recognition se branche derrière la même
 * interface (même pattern que pickImage() pour la caméra).
 *
 * Retourne :
 *   supported   bool               — false → masquer le bouton mic
 *   status      'idle' | 'listening' | 'done' | 'blocked'
 *   interim     string             — transcription en cours, affichée en
 *                                    direct sous la waveform (le signal
 *                                    "je t'entends" pour le persona)
 *   utterances  string[]           — résultats finalisés, dans l'ordre.
 *                                    Le parsing est fait par l'appelant via
 *                                    parseUtterance (fonction pure) — le
 *                                    hook ne connaît pas la notion de produit.
 *   start()     démarre l'écoute (à appeler dans le geste utilisateur :
 *               la demande de permission micro doit venir d'un tap)
 *   stop()      bouton "Terminer" — secours si la détection de silence rate
 */
export function useVoiceSession() {
  const [status, setStatus] = useState('idle')
  const [interim, setInterim] = useState('')
  const [utterances, setUtterances] = useState([])

  // Refs et non state : la reco et le timer ne pilotent aucun rendu.
  const recRef = useRef(null)
  const silenceTimer = useRef(null)

  function armSilenceTimer() {
    clearTimeout(silenceTimer.current)
    silenceTimer.current = setTimeout(stop, SESSION_END_MS)
  }

  function start() {
    if (!Recognition || status === 'listening') return
    setUtterances([])
    setInterim('')

    const rec = new Recognition()
    recRef.current = rec
    rec.lang = 'fr-FR' // constante aujourd'hui, paramètre de la locale i18n demain
    rec.continuous = true // ⚠ spike : mal supporté sur Safari iOS — à valider
    rec.interimResults = true

    rec.onresult = (e) => {
      // Timer armé ici, pas dans start() : elle peut prendre plusieurs secondes
      // avant de commencer à parler — armer avant le premier mot fermerait
      // la session pendant qu'elle rassemble ses pensées.
      armSilenceTimer()
      let interimText = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const text = e.results[i][0].transcript.trim()
        if (e.results[i].isFinal) {
          // ⚠ spike : sur Safari iOS les finals peuvent arriver en un seul
          // bloc à l'arrêt (toute la dictée dans une utterance). C'est
          // parseUtterance qui gère ce cas — pas le hook.
          if (text) setUtterances((prev) => [...prev, text])
        } else {
          interimText += text
        }
      }
      setInterim(interimText)
    }

    rec.onerror = (e) => {
      // Permission refusée → état "micro bloqué", même langage visuel que
      // "× Alertes bloquées". Toute autre erreur (réseau, no-speech) :
      // on termine en GARDANT ce qui a été dicté — une session interrompue
      // à 4 produits affiche 4 cartes, jamais un retour à l'accueil.
      if (e.error === 'not-allowed') setStatus('blocked')
      stop()
    }

    // Safari coupe la reco de lui-même après un silence, avant notre timer.
    // ⚠ spike : décider ici si on redémarre (rec.start() si status encore
    // 'listening') ou si on accepte la fin. Squelette : on accepte la fin.
    rec.onend = () => {
      if (recRef.current) stop()
    }

    setStatus('listening')
    rec.start()
    // Pas d'armSilenceTimer() ici — voir commentaire dans onresult.
  }

  function stop() {
    clearTimeout(silenceTimer.current)
    const rec = recRef.current
    recRef.current = null // avant .stop() : évite que onend ne rappelle stop()
    if (rec) rec.stop()
    setInterim('')
    // 'blocked' est terminal pour la session — on ne l'écrase pas par 'done'
    setStatus((s) => (s === 'blocked' ? 'blocked' : 'done'))
  }

  return { supported: Boolean(Recognition), status, interim, utterances, start, stop }
}
