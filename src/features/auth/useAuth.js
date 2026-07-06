import { useEffect, useState } from 'react'
import {
  onAuthStateChanged,
  signInAnonymously,
  signInWithPopup,
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

  // Auth anonyme silencieuse — crée un uid persistant par appareil sans aucune friction
  useEffect(() => {
    signInAnonymously(auth).catch(() => {})
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
      // Le compte Google existe déjà en tant que compte réel — connexion directe
      if (err.code === 'auth/credential-already-in-use') {
        try {
          await signInWithPopup(auth, googleProvider)
          return true
        } catch (err2) {
          if (import.meta.env.DEV) console.error('[auth] signInWithPopup fallback', err2)
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
      await updateDoc(doc(db, 'users', uid), { fcmToken: deleteField() }).catch(() => {})
    }
    await firebaseSignOut(auth)
  }

  return {
    user,
    isAnonymous: user === undefined ? true : (user?.isAnonymous ?? true),
    authEmail:   user?.email ?? null,
    authLoading: user === undefined,
    signInWithGoogle,
    signOut,
  }
}
