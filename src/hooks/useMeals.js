import { useState, useCallback } from 'react'

const KEY = 'wte-meals'
const KEY_REPAS = 'wte-repas'

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
  const [repas, setRepas] = useState(() => load(KEY_REPAS, []))

  // Helper : met à jour le state React ET écrit dans localStorage en même temps.
  // On passe par le setter fonctionnel de useState pour toujours travailler
  // sur la valeur la plus récente (évite les bugs de closure avec des appels rapprochés).
  const setAndPersist = (updater) => {
    setMeals(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      persist(KEY, next)
      return next
    })
  }

  const addRepas = useCallback((name, date) => {
    const id = Date.now()
    setRepas(prev => {
      const next = [...prev, { id, name, date }]
      persist(KEY_REPAS, next)
      return next
    })
    return id
  }, [])

  const renameRepas = useCallback((repasId, newName) => {
    setRepas(prev => {
      const next = prev.map(r => r.id === repasId ? { ...r, name: newName } : r)
      persist(KEY_REPAS, next)
      return next
    })
  }, [])

  const nameNoneMeals = useCallback((name, date) => {
    const id = Date.now()
    setRepas(prev => {
      const next = [...prev, { id, name, date }]
      persist(KEY_REPAS, next)
      return next
    })
    setMeals(prev => {
      const next = prev.map(m => m.date === date && !m.repasId ? { ...m, repasId: id } : m)
      persist(KEY, next)
      return next
    })
  }, [])

  const deleteRepas = useCallback((repasId) => {
    setMeals(prev => {
      const toCancel = prev.filter(m => m.repasId === repasId)
      toCancel.forEach(m => onIncreaseQty(m.productId, m.qty))
      const next = prev.filter(m => m.repasId !== repasId)
      persist(KEY, next)
      return next
    })
    setRepas(prev => {
      const next = prev.filter(r => r.id !== repasId)
      persist(KEY_REPAS, next)
      return next
    })
  }, [onIncreaseQty])

  const addMeal = useCallback((product, qty, date, repasId = null) => {
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
      repasId: repasId ?? null,
    }])
    onDecreaseQty(product.id, qty)
  }, [onDecreaseQty])

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

  return { meals, repas, addMeal, addRepas, renameRepas, nameNoneMeals, deleteRepas, confirmMeal, cancelMeal }
}
