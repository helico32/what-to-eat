import { useState, useCallback } from 'react'

const KEY = 'wte-meals'

function load(key, fallback) {
  try {
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : fallback
  } catch {
    return fallback
  }
}

function persist(key, data) {
  try { localStorage.setItem(key, JSON.stringify(data)) } catch {}
}

export function useMeals({ onDecreaseQty, onIncreaseQty, onRemoveIfZero }) {
  const [meals, setMeals] = useState(() => load(KEY, []))

  const setAndPersist = (updater) => {
    setMeals(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      persist(KEY, next)
      return next
    })
  }

  // Add a meal for a given date — immediately decreases fridge qty
  const addMeal = useCallback((product, qty, date) => {
    setAndPersist(prev => [...prev, {
      id: Date.now(),
      productId: product.id,
      productSnapshot: {
        name: product.name,
        emoji: product.emoji ?? null,
        image: product.image ?? null,
      },
      qty,
      date,
    }])
    onDecreaseQty(product.id, qty)
  }, [onDecreaseQty])

  // Confirm a meal was eaten — optionally return some qty to fridge
  // If returnQty = 0 and product is at 0 in fridge, removes the row
  const confirmMeal = useCallback((mealId, returnQty) => {
    setMeals(prev => {
      const meal = prev.find(m => m.id === mealId)
      if (!meal) return prev
      if (returnQty > 0) {
        onIncreaseQty(meal.productId, returnQty)
      } else {
        onRemoveIfZero(meal.productId)
      }
      const next = prev.filter(m => m.id !== mealId)
      persist(KEY, next)
      return next
    })
  }, [onIncreaseQty, onRemoveIfZero])

  // Cancel a planned meal — restores the full qty to fridge
  const cancelMeal = useCallback((mealId) => {
    setMeals(prev => {
      const meal = prev.find(m => m.id === mealId)
      if (!meal) return prev
      onIncreaseQty(meal.productId, meal.qty)
      const next = prev.filter(m => m.id !== mealId)
      persist(KEY, next)
      return next
    })
  }, [onIncreaseQty])

  return { meals, addMeal, confirmMeal, cancelMeal }
}
