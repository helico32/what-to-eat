import { initializeApp } from 'firebase/app'
import { getAuth }        from 'firebase/auth'
import { getFirestore }   from 'firebase/firestore'
import { getMessaging }   from 'firebase/messaging'

// Ces valeurs sont publiques — la sécurité est assurée par les règles Firestore,
// pas par le secret de la config. Safe à committer.
const firebaseConfig = {
  apiKey:            'AIzaSyBd_VdU7Lnaqoc29z88hctCyoml-UpcYPI',
  authDomain:        'what-to-eat-angelab.firebaseapp.com',
  projectId:         'what-to-eat-angelab',
  storageBucket:     'what-to-eat-angelab.firebasestorage.app',
  messagingSenderId: '135887887805',
  appId:             '1:135887887805:web:b52ff2886497f81eca46d4',
}

const app = initializeApp(firebaseConfig)

export const auth      = getAuth(app)
export const db        = getFirestore(app)
export const messaging = getMessaging(app)
