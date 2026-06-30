import { useEffect, useState } from 'react'
import { signInAnonymously }  from 'firebase/auth'
import { doc, setDoc }        from 'firebase/firestore'
import { getToken }           from 'firebase/messaging'
import { auth, db, messaging } from '../firebase'

// VAPID key — Project Settings → Cloud Messaging → Web Push certificates
// À remplacer par ta clé une fois générée dans la console Firebase.
const VAPID_KEY = 'REMPLACER_PAR_VAPID_KEY'

export function useNotifications() {
  const [permission, setPermission] = useState(Notification.permission)

  // Authentification anonyme silencieuse dès le montage.
  // Crée un uid persistant par appareil sans demander d'email ni de mot de passe.
  useEffect(() => {
    signInAnonymously(auth).catch(() => {
      // Pas de console.error — l'app fonctionne sans auth.
    })
  }, [])

  // Demande la permission push + enregistre le token FCM dans Firestore.
  // Appelé par un bouton explicite dans l'UI — pas de demande automatique au chargement.
  const requestPermission = async () => {
    try {
      const result = await Notification.requestPermission()
      setPermission(result)
      if (result !== 'granted') return

      const token = await getToken(messaging, { vapidKey: VAPID_KEY })
      const uid   = auth.currentUser?.uid
      if (!uid || !token) return

      // Stocke le token FCM dans Firestore sous /users/{uid}.
      // La Cloud Function lira cette collection pour envoyer les notifications.
      await setDoc(
        doc(db, 'users', uid),
        { fcmToken: token, updatedAt: new Date().toISOString() },
        { merge: true },
      )
    } catch {
      // Pas de crash — les notifications sont optionnelles.
    }
  }

  return { permission, requestPermission }
}
