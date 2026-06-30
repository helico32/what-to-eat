import { useState, useEffect } from 'react'
import { dbPromise } from '../../db'
import { recipes as defaultRecipes } from './data'

export function useRecipes() {
  const [recipes, setRecipes] = useState([])

  // Chargement initial depuis IndexedDB.
  // Si le store est vide (premier lancement), on insère les recettes par défaut avec leur position.
  // On trie par `position` pour respecter l'ordre du drag-and-drop entre les sessions.
  useEffect(() => {
    async function load() {
      const db = await dbPromise
      const stored = await db.getAll('recipes')
      if (stored.length === 0) {
        const seeded = defaultRecipes.map((r, i) => ({ ...r, position: i }))
        const tx = db.transaction('recipes', 'readwrite')
        for (const r of seeded) tx.store.put(r)
        await tx.done
        setRecipes(seeded)
        return
      }
      // Les recettes migrées depuis localStorage n'ont pas de `position` —
      // on les met en fin de liste via Infinity, elles garderont l'ordre de leur id.
      setRecipes([...stored].sort((a, b) => (a.position ?? Infinity) - (b.position ?? Infinity)))
    }
    load()
  }, [])

  // Pattern commun à editRecipe et toggleFavorite :
  // on calcule l'objet mis à jour depuis le state courant,
  // on met à jour React immédiatement (optimistic), puis on écrit en DB.
  const addRecipe = async (recipe) => {
    const newRecipe = { ...recipe, id: Date.now(), favorite: false, position: recipes.length }
    setRecipes(prev => [...prev, newRecipe])
    const db = await dbPromise
    await db.put('recipes', newRecipe)
  }

  const deleteRecipe = async (id) => {
    setRecipes(prev => prev.filter(r => r.id !== id))
    const db = await dbPromise
    await db.delete('recipes', id)
  }

  const editRecipe = async (id, changes) => {
    const updated = { ...recipes.find(r => r.id === id), ...changes }
    setRecipes(prev => prev.map(r => r.id === id ? updated : r))
    const db = await dbPromise
    await db.put('recipes', updated)
  }

  const toggleFavorite = async (id) => {
    const current = recipes.find(r => r.id === id)
    const updated = { ...current, favorite: !current.favorite }
    setRecipes(prev => prev.map(r => r.id === id ? updated : r))
    const db = await dbPromise
    await db.put('recipes', updated)
  }

  const reorderRecipes = async (newList) => {
    // On écrit la position de chaque recette selon son index dans la nouvelle liste.
    // C'est ce champ qui permettra de retrouver l'ordre au prochain chargement.
    const withPositions = newList.map((r, i) => ({ ...r, position: i }))
    setRecipes(withPositions)
    const db = await dbPromise
    const tx = db.transaction('recipes', 'readwrite')
    for (const r of withPositions) tx.store.put(r)
    await tx.done
  }

  return { recipes, addRecipe, deleteRecipe, editRecipe, toggleFavorite, reorderRecipes }
}
