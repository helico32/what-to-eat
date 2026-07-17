// parseUtterance — fonction PURE : string in, items[] out. Zéro DOM, zéro
// dépendance. C'est le seul endroit de l'app où des tests automatisés paient
// vraiment (impossible de re-dicter 30 phrases à chaque modif) : les fixtures
// viendront des transcriptions réelles du spike iPhone.
//
// Philosophie : le parser est bête, c'est l'écran de revue qui est intelligent.
// Son vocabulaire = celui des pills d'AddModal (demain / 3 jours / 1 semaine /
// 1 mois) + dates absolues + frigo/congel/placard + nombres. Tout le reste est
// un nom de produit. En cas de doute : champ vide (badge "sans date" connu)
// plutôt que devinette — une date fausse qu'elle ne remarque pas est pire
// qu'un tap pour la saisir.

// ---------- Vocabulaire (tables fermées, rien d'autre n'est reconnu) --------

const LOCATIONS = {
  frigo: 'frigo', frigidaire: 'frigo',
  congel: 'congel', congélateur: 'congel', congelateur: 'congel', congélo: 'congel',
  placard: 'placard', placards: 'placard',
}

// L'API transcrit tantôt "2" tantôt "deux" selon la plateforme → les deux.
const NUMBER_WORDS = {
  un: 1, une: 1, deux: 2, trois: 3, quatre: 4, cinq: 5,
  six: 6, sept: 7, huit: 8, neuf: 9, dix: 10, onze: 11, douze: 12,
}

const MONTHS = {
  janvier: 0, février: 1, fevrier: 1, mars: 2, avril: 3, mai: 4, juin: 5,
  juillet: 6, août: 7, aout: 7, septembre: 8, octobre: 9, novembre: 10, décembre: 11, decembre: 11,
}

// Mots qui appartiennent aux expressions de date/quantité — jamais au nom.
const FILLER = new Set(['périme', 'perime', 'expire', 'le', 'la', 'les', 'dans', 'pour'])

// ---------- Helpers dates ---------------------------------------------------

function addDays(base, n) {
  const d = new Date(base)
  d.setDate(d.getDate() + n)
  return d
}

// "le 10 juillet" → prochaine occurrence, jamais dans le passé : on gère de
// la nourriture, une date d'expiration est toujours devant nous. Si le
// 10 juillet est passé cette année → 10 juillet de l'année prochaine.
function resolveAbsoluteDate(day, monthIndex, today) {
  const d = new Date(today.getFullYear(), monthIndex, day)
  if (d < today) d.setFullYear(d.getFullYear() + 1)
  return d
}

function toISO(date) {
  // Même format que le champ expiryDate existant (input type="date")
  return date.toISOString().slice(0, 10)
}

// ---------- Parser ----------------------------------------------------------

/**
 * @param {string} text  une utterance brute (peut contenir PLUSIEURS produits
 *                       si Safari a livré toute la dictée en un bloc)
 * @param {Date}   today injectable pour les tests (défaut : maintenant)
 * @returns {Array<{ name: string, qty: number, expiryDate: string|null, location: string }>}
 *
 * Jamais de rejet silencieux : une utterance moche ("euh attends") devient
 * une carte avec ce texte en nom — elle a dicté, elle doit retrouver quelque
 * chose, la croix de suppression coûte un tap. 10 prises de parole = au
 * moins 10 cartes candidates.
 */
export function parseUtterance(text, today = new Date()) {
  const items = []
  // État de l'item en cours de construction
  let current = null
  const openItem = () => { current = { name: [], qty: 1, expiryDate: null, location: 'frigo' } }
  const closeItem = () => {
    if (current && current.name.length) {
      items.push({ ...current, name: current.name.join(' ') })
    }
    current = null
  }

  // Chrome ponctue parfois ("framboises, lait 2.") — les virgules/points sont
  // alors des séparateurs fiables. Sur Safari il n'y en a aucun : la boucle
  // ci-dessous doit segmenter seule (voir heuristique de frontière).
  const tokens = text
    .toLowerCase()
    .replace(/[.,]/g, ' , ') // la ponctuation devient un token-frontière
    .split(/\s+/)
    .filter(Boolean)

  for (let i = 0; i < tokens.length; i++) {
    const tok = tokens[i]

    // -- Frontières explicites : ponctuation et conjonction ------------------
    if (tok === ',') { closeItem(); continue }
    // "lait et beurre" → 2 items. Trade-off assumé : "sel et poivre" sort aussi
    // en 2 cartes — l'écran de revue rattrape (supprimer une carte = 1 tap).
    if (tok === 'et') { closeItem(); continue }

    if (!current) openItem()

    // -- Emplacement : mot-clé fermé + FRONTIÈRE implicite -------------------
    // Heuristique : quantité/date/emplacement SUIVENT le nom à l'oral
    // ("pâtes placard", "framboises 1 périme le 10 juillet"). Un emplacement
    // ou une date termine donc l'item courant. ⚠ à valider sur les fixtures
    // du spike — c'est LA décision que les vraies dictées doivent trancher.
    if (LOCATIONS[tok]) { current.location = LOCATIONS[tok]; closeItem(); continue }

    // -- Dates relatives : le vocabulaire des pills --------------------------
    if (tok === 'demain') { current.expiryDate = toISO(addDays(today, 1)); closeItem(); continue }
    // "3 jours" / "trois jours", "1 semaine" / "une semaine", "1 mois" / "un mois"
    const nextTok = tokens[i + 1]
    const asNumber = NUMBER_WORDS[tok] ?? (/^\d{1,2}$/.test(tok) ? Number(tok) : null)
    if (asNumber !== null && nextTok) {
      if (nextTok.startsWith('jour')) { current.expiryDate = toISO(addDays(today, asNumber)); i++; closeItem(); continue }
      if (nextTok.startsWith('semaine')) { current.expiryDate = toISO(addDays(today, asNumber * 7)); i++; closeItem(); continue }
      if (nextTok === 'mois') { current.expiryDate = toISO(addDays(today, asNumber * 30)); i++; closeItem(); continue }
      // -- Date absolue : "10 juillet" ---------------------------------------
      if (MONTHS[nextTok] !== undefined) {
        current.expiryDate = toISO(resolveAbsoluteDate(asNumber, MONTHS[nextTok], today))
        i++; closeItem(); continue
      }
    }

    // -- Quantité : nombre isolé après le nom --------------------------------
    if (asNumber !== null && current.name.length) { current.qty = asNumber; continue }

    // -- Mots de liaison des expressions de date : ignorés -------------------
    if (FILLER.has(tok)) continue

    // -- Frontière implicite : un mot "normal" alors que l'item courant a
    //    déjà reçu sa quantité → nouveau produit ("lait 2 pâtes…")
    if (current.name.length && current.qty !== 1 && asNumber === null) {
      closeItem()
      openItem()
    }

    // -- Défaut : le token fait partie du nom --------------------------------
    current.name.push(tok)
  }
  closeItem() // dernier item de l'utterance

  return items
}
