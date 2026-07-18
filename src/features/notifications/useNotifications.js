import { useEffect, useState } from 'react'
import { doc, setDoc }        from 'firebase/firestore'
import { auth, db, app }      from '../../firebase'

// VAPID key — Project Settings → Cloud Messaging → Web Push certificates
const VAPID_KEY = 'BFSLKtUDETGyxCH_e9k4MzrBSu0q6BpYQO9STjemrJS61nab-qwOwq4S6GCATswnkzvyLyamRQLkDz-J2FTr9iI'

// Certains navigateurs mobiles n'exposent pas l'API Notification du tout.
const notifSupported = typeof Notification !== 'undefined'

// Récupère le token FCM et l'enregistre sous /users/{uid}.
// Appelé au clic sur le bouton ET au chargement quand la permission est déjà
// accordée — rattrape une sauvegarde échouée ou un token FCM qui a tourné.
// Pas de state ni de prop : fonction module stable, pas besoin de useCallback.
async function saveToken() {
  try {
    await auth.authStateReady() // attend que l'auth anonyme soit prête
    const registration = await navigator.serviceWorker.ready
    // Import dynamique : firebase/messaging ne charge que si l'utilisatrice
    // a accordé la permission — pas au démarrage de l'app.
    const { getMessaging, getToken } = await import('firebase/messaging')
    const messaging = getMessaging(app)
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

export function useNotifications() {
  const [permission, setPermission] = useState(notifSupported ? Notification.permission : 'unsupported')

  // L'auth anonyme est gérée par useAuth — useNotifications ne s'en occupe plus.

  const requestPermission = async () => {
    if (!notifSupported) return
    const result = await Notification.requestPermission()
    setPermission(result)
    if (result === 'granted') await saveToken()
  }

  useEffect(() => {
    if (permission === 'granted') saveToken()
  }, [permission])

  // Appelée depuis App.jsx après un sign-in Google pour re-sauvegarder le token
  // sous le bon uid (le cas signInWithCredential change l'uid — le token sauvegardé
  // sous l'ancien uid anonyme ne serait jamais lu par la Cloud Function).
  const refreshToken = () => {
    if (permission === 'granted') saveToken()
  }

  return { permission, requestPermission, refreshToken }
}
