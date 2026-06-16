import { useState } from 'react'
import { recipes as defaultRecipes } from '../data/recipes'

const KEY = 'wte-recipes'

function load() {
  try {
    const stored = localStorage.getItem(KEY)
    return stored ? JSON.parse(stored) : defaultRecipes
  } catch {
    return defaultRecipes
  }
}

function persist(data) {
  try { localStorage.setItem(KEY, JSON.stringify(data)) } catch {}
}

export function useRecipes() {
  const [recipes, setRecipes] = useState(load)

  const update = (next) => { setRecipes(next); persist(next) }

  const addRecipe = (recipe) => {
    update([...recipes, { ...recipe, id: Date.now(), favorite: false }])
  }

  const deleteRecipe = (id) => {
    update(recipes.filter(r => r.id !== id))
  }

  const editRecipe = (id, changes) => {
    update(recipes.map(r => r.id === id ? { ...r, ...changes } : r))
  }

  const toggleFavorite = (id) => {
    update(recipes.map(r => r.id === id ? { ...r, favorite: !r.favorite } : r))
  }

  const reorderRecipes = (newList) => {
    update(newList)
  }

  return { recipes, addRecipe, deleteRecipe, editRecipe, toggleFavorite, reorderRecipes }
}
