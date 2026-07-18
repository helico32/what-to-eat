import { useState, useEffect } from 'react'
import { dbPromise } from '../../db'
import { recipes as defaultRecipes } from './data'
import { auth, db as firestore } from '../../firebase'
import { doc, setDoc, deleteDoc, collection, getDocs } from 'firebase/firestore'

function googleUid() {
  const u = auth.currentUser
  return u && !u.isAnonymous ? u.uid : null
}

// Écrit une recette dans Firestore — sans l'image (trop lourde, reste dans IndexedDB).
function pushRecipe(uid, recipe) {
  const { image: _image, ...fields } = recipe
  setDoc(doc(firestore, 'users', uid, 'recipes', String(recipe.id)), {
    ...fields,
    updatedAt: new Date().toISOString(),
  }).catch(() => {})
}

function removeRecipe(uid, id) {
  deleteDoc(doc(firestore, 'users', uid, 'recipes', String(id))).catch(() => {})
}

export function useRecipes() {
  const [recipes, setRecipes] = useState([])

  useEffect(() => {
    async function load() {
      const idb = await dbPromise
      await auth.authStateReady()
      const uid = googleUid()

      // Utilisatrice Google : si Firestore a des recettes, on restaure depuis Firestore.
      // Couvre le cas réinstall PWA + reconnexion Google, et multi-appareils.
      if (uid) {
        const snap = await getDocs(collection(firestore, 'users', uid, 'recipes'))
        if (!snap.empty) {
          const firestoreRecipes = snap.docs.map(d => d.data())
          const tx = idb.transaction('recipes', 'readwrite')
          await tx.store.clear()
          for (const r of firestoreRecipes) tx.store.put(r)
          await tx.done
          setRecipes([...firestoreRecipes].sort((a, b) => (a.position ?? Infinity) - (b.position ?? Infinity)))
          return
        }
      }

      // Chargement normal depuis IndexedDB
      // (utilisatrice anonyme, ou Google dont Firestore est encore vide)
      const stored = await idb.getAll('recipes')
      let finalRecipes
      if (stored.length === 0) {
        const seeded = defaultRecipes.map((r, i) => ({ ...r, position: i }))
        const tx = idb.transaction('recipes', 'readwrite')
        for (const r of seeded) tx.store.put(r)
        await tx.done
        finalRecipes = seeded
      } else {
        finalRecipes = [...stored].sort((a, b) => (a.position ?? Infinity) - (b.position ?? Infinity))
      }
      setRecipes(finalRecipes)

      // Google avec Firestore vide → sync initiale (premier sign-in depuis cet appareil)
      if (uid) {
        for (const r of finalRecipes) pushRecipe(uid, r)
      }
    }
    load()
  }, [])

  const addRecipe = async (recipe) => {
    const newRecipe = { ...recipe, id: Date.now(), favorite: false, position: recipes.length }
    setRecipes(prev => [...prev, newRecipe])
    const idb = await dbPromise
    await idb.put('recipes', newRecipe)
    const uid = googleUid()
    if (uid) pushRecipe(uid, newRecipe)
  }

  const deleteRecipe = async (id) => {
    setRecipes(prev => prev.filter(r => r.id !== id))
    const idb = await dbPromise
    await idb.delete('recipes', id)
    const uid = googleUid()
    if (uid) removeRecipe(uid, id)
  }

  const editRecipe = async (id, changes) => {
    const updated = { ...recipes.find(r => r.id === id), ...changes }
    setRecipes(prev => prev.map(r => r.id === id ? updated : r))
    const idb = await dbPromise
    await idb.put('recipes', updated)
    const uid = googleUid()
    if (uid) pushRecipe(uid, updated)
  }

  const toggleFavorite = async (id) => {
    const current = recipes.find(r => r.id === id)
    const updated = { ...current, favorite: !current.favorite }
    setRecipes(prev => prev.map(r => r.id === id ? updated : r))
    const idb = await dbPromise
    await idb.put('recipes', updated)
    const uid = googleUid()
    if (uid) pushRecipe(uid, updated)
  }

  const reorderRecipes = async (newList) => {
    const withPositions = newList.map((r, i) => ({ ...r, position: i }))
    setRecipes(withPositions)
    const idb = await dbPromise
    const tx = idb.transaction('recipes', 'readwrite')
    for (const r of withPositions) tx.store.put(r)
    await tx.done
    const uid = googleUid()
    if (uid) {
      for (const r of withPositions) pushRecipe(uid, r)
    }
  }

  // Appelée depuis App.jsx après un sign-in Google pour restaurer les recettes
  // depuis Firestore sous le bon uid (même pattern que useStore.syncAfterGoogleSignIn).
  const syncAfterGoogleSignIn = async () => {
    const uid = googleUid()
    if (!uid) return

    const snap = await getDocs(collection(firestore, 'users', uid, 'recipes'))
    if (!snap.empty) {
      const firestoreRecipes = snap.docs.map(d => d.data())
      const idb = await dbPromise
      const tx = idb.transaction('recipes', 'readwrite')
      await tx.store.clear()
      for (const r of firestoreRecipes) tx.store.put(r)
      await tx.done
      setRecipes([...firestoreRecipes].sort((a, b) => (a.position ?? Infinity) - (b.position ?? Infinity)))
    } else {
      const idb = await dbPromise
      const localRecipes = await idb.getAll('recipes')
      for (const r of localRecipes) pushRecipe(uid, r)
    }
  }

  return { recipes, addRecipe, deleteRecipe, editRecipe, toggleFavorite, reorderRecipes, syncAfterGoogleSignIn }
}
