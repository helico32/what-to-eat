import { initializeApp }                           from 'firebase/app'
import { getAuth }                                 from 'firebase/auth'
import { getFirestore }                            from 'firebase/firestore'
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check'
import { getAnalytics }                            from 'firebase/analytics'

// Ces valeurs sont publiques — la sécurité est assurée par les règles Firestore,
// pas par le secret de la config. Safe à committer.
const firebaseConfig = {
  apiKey:            'AIzaSyBd_VdU7Lnaqoc29z88hctCyoml-UpcYPI',
  authDomain:        'what-to-eat-angelab.firebaseapp.com',
  projectId:         'what-to-eat-angelab',
  storageBucket:     'what-to-eat-angelab.firebasestorage.app',
  messagingSenderId: '135887887805',
  appId:             '1:135887887805:web:b52ff2886497f81eca46d4',
  measurementId:     'G-4K07VV24YY',
}

export const app = initializeApp(firebaseConfig)

// Analytics collecte en silence — page_view, session_start, user_engagement.
// Pas d'events custom, pas d'export nécessaire.
getAnalytics(app)

// En dev local, localhost n'est pas un vrai domaine — reCAPTCHA ne peut pas valider.
// Ce token de debug remplace le token reCAPTCHA uniquement en local.
// Doit être défini avant initializeAppCheck().
if (import.meta.env.DEV) {
  self.FIREBASE_APPCHECK_DEBUG_TOKEN = import.meta.env.VITE_APPCHECK_DEBUG_TOKEN
}

// App Check — joint automatiquement un token à chaque requête Firebase.
// Firebase refuse les requêtes sans token valide (scripts, curl, etc.).
initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider(import.meta.env.VITE_RECAPTCHA_SITE_KEY),
  isTokenAutoRefreshEnabled: true,
})

export const auth = getAuth(app)
export const db   = getFirestore(app)
// messaging n'est pas initialisé ici — chargé dynamiquement dans saveToken()
// uniquement après acceptation de la permission, pas au démarrage de l'app.
