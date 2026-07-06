import { useEffect, useState } from 'react'
import { doc, setDoc }        from 'firebase/firestore'
import { getToken }           from 'firebase/messaging'
import { auth, db, messaging } from '../../firebase'

// VAPID key — Project Settings → Cloud Messaging → Web Push certificates
const VAPID_KEY = 'BFSLKtUDETGyxCH_e9k4MzrBSu0q6BpYQO9STjemrJS61nab-qwOwq4S6GCATswnkzvyLyamRQLkDz-J2FTr9iI'

// Certains navigateurs mobiles n'exposent pas l'API Notification du tout.
const notifSupported = typeof Notification !== 'undefined'

export function useNotifications() {
  const [permission, setPermission] = useState(notifSupported ? Notification.permission : 'unsupported')

  // L'auth anonyme est gérée par useAuth — useNotifications ne s'en occupe plus.

  // Demande la permission push + enregistre le token FCM dans Firestore.
  // Appelé par un bouton explicite dans l'UI — pas de demande automatique au chargement.
  const requestPermission = async () => {
    if (!notifSupported) return
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
    } catch (err) {
      if (import.meta.env.DEV) console.error('[notifications]', err)
      // Pas de crash — les notifications sont optionnelles.
    }
  }

  return { permission, requestPermission }
}
