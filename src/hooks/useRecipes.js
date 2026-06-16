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

  const addRecipe = (recipe) => {
    const next = [...recipes, { ...recipe, id: Date.now() }]
    setRecipes(next)
    persist(next)
  }

  const deleteRecipe = (id) => {
    const next = recipes.filter(r => r.id !== id)
    setRecipes(next)
    persist(next)
  }

  return { recipes, addRecipe, deleteRecipe }
}
