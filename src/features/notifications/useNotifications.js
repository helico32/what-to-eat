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

  // Récupère le token FCM et l'enregistre sous /users/{uid}.
  // Appelé au clic sur le bouton ET au chargement quand la permission est déjà
  // accordée — rattrape une sauvegarde échouée ou un token FCM qui a tourné.
  const saveToken = async () => {
    try {
      await auth.authStateReady() // attend que l'auth anonyme soit prête
      const registration = await navigator.serviceWorker.ready
      const token = await getToken(messaging, {
        vapidKey: VAPID_KEY,
        serviceWorkerRegistration: registration,
      })
      const uid = auth.currentUser?.uid
      if (!uid || !token) return
      await setDoc(
        doc(db, 'users', uid),
        { fcmToken: token, updatedAt: new Date().toISOString() },
        { merge: true },
      )
    } catch (err) {
      console.error('[notifications]', err)
    }
  }

  const requestPermission = async () => {
    if (!notifSupported) return
    const result = await Notification.requestPermission()
    setPermission(result)
    if (result === 'granted') await saveToken()
  }

  useEffect(() => {
    if (permission === 'granted') saveToken()
  }, [permission])

  return { permission, requestPermission }
}
