import { precacheAndRoute } from 'workbox-precaching'
import { initializeApp }    from 'firebase/app'
import { getMessaging, onBackgroundMessage } from 'firebase/messaging/sw'

// Workbox injecte automatiquement la liste des fichiers à précacher ici.
// Ne pas modifier cette ligne — elle est remplacée au build.
precacheAndRoute(self.__WB_MANIFEST)

// ── FCM background messages ───────────────────────────────────────────────
// Reçoit les notifications quand l'app est fermée ou en arrière-plan.
const firebaseApp = initializeApp({
  apiKey:            'AIzaSyBd_VdU7Lnaqoc29z88hctCyoml-UpcYPI',
  authDomain:        'what-to-eat-angelab.firebaseapp.com',
  projectId:         'what-to-eat-angelab',
  storageBucket:     'what-to-eat-angelab.firebasestorage.app',
  messagingSenderId: '135887887805',
  appId:             '1:135887887805:web:b52ff2886497f81eca46d4',
})

const messaging = getMessaging(firebaseApp)

onBackgroundMessage(messaging, (payload) => {
  const { title, body } = payload.notification ?? {}
  if (!title) return
  self.registration.showNotification(title, {
    body,
    icon: '/icon-192.png',
    badge: '/icon-192.png',
  })
})
