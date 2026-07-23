import { useEffect, useState } from 'react'
import {
  onAuthStateChanged,
  signInAnonymously,
  signInWithPopup,
  signInWithCredential,
  linkWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
} from 'firebase/auth'
import { doc, updateDoc, deleteField } from 'firebase/firestore'
import { auth, db } from '../../firebase'

// Magic Link retiré : Firebase Dynamic Links est abandonné — le lien ne rouvrirait
// pas la PWA sur mobile. Google Sign-In est l'unique méthode de connexion.
const googleProvider = new GoogleAuthProvider()

export function useAuth() {
  // undefined = chargement initial Firebase | null = déconnecté | User = connecté
  const [user, setUser] = useState(undefined)

  // Écoute Firebase Auth — met à jour user à chaque changement (connexion, déconnexion, expiration)
  useEffect(() => {
    return onAuthStateChanged(auth, u => setUser(u ?? null))
  }, [])

  // Auth anonyme silencieuse — crée un uid par appareil, uniquement si personne n'est
  // déjà connecté. authStateReady() attend que Firebase ait restauré la session existante
  // avant de décider : évite d'écraser une session Google au rechargement de la page.
  useEffect(() => {
    auth.authStateReady().then(() => {
      if (!auth.currentUser) signInAnonymously(auth).catch(() => {})
    })
  }, [])

  // Google Sign-In
  // Si le compte est anonyme : linkWithPopup préserve l'UID et toutes les données Firestore
  // Si Google est déjà connu de Firebase : signInWithPopup retrouve l'UID existant
  const signInWithGoogle = async () => {
    try {
      if (auth.currentUser?.isAnonymous) {
        await linkWithPopup(auth.currentUser, googleProvider)
      } else {
        await signInWithPopup(auth, googleProvider)
      }
      return true
    } catch (err) {
      // Elle a fermé la popup elle-même — pas une erreur, pas de message à afficher
      if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
        return null
      }
      // Le compte Google existe déjà — réutilise le credential du premier popup (déjà accordé
      // par Google) plutôt qu'ouvrir une deuxième popup (qui serait bloquée par les navigateurs
      // mobiles car hors geste utilisateur).
      if (err.code === 'auth/credential-already-in-use') {
        try {
          const credential = GoogleAuthProvider.credentialFromError(err)
          if (credential) {
            await signInWithCredential(auth, credential)
            return true
          }
        } catch (err2) {
          if (import.meta.env.DEV) console.error('[auth] signInWithCredential fallback', err2)
        }
      } else {
        if (import.meta.env.DEV) console.error('[auth] signInWithGoogle', err)
      }
      return false
    }
  }

  const signOut = async () => {
    const uid = auth.currentUser?.uid
    if (uid) {
      // Fire and forget — hors ligne, Firestore met l'écriture en file d'attente et la
      // Promise ne se résout jamais. Sans await, firebaseSignOut est toujours atteint.
      updateDoc(doc(db, 'users', uid), { fcmToken: deleteField() }).catch(() => {})
    }
    await firebaseSignOut(auth)
  }

  return {
    user,
    isAnonymous: user === undefined ? true : (user?.isAnonymous ?? true),
    authEmail:   user?.email ?? null,
    authName:    user?.displayName || user?.providerData?.[0]?.displayName || user?.email?.split('@')[0] || null,
    authLoading: user === undefined,
    signInWithGoogle,
    signOut,
  }
}
