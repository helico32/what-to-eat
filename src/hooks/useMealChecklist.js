import { useState } from 'react'

/**
 * Gère l'état de la checklist de repas : quels meals sont cochés et
 * en quelle quantité. Utilisé par MealGroupsList pour les actions
 * "Mangé" et "Ranger".
 *
 * @param {Array}    dayMeals      - les meals du jour affiché
 * @param {Function} onConfirmMeal - callback(mealId, qtyToReturn) appelé à la confirmation
 */
export function useMealChecklist(dayMeals, onConfirmMeal) {
  // Set des ids de meals cochés par l'utilisatrice
  const [checked, setChecked] = useState(new Set())
  // Quantité ajustée par meal : { [mealId]: qty }
  // Permet de dire "j'avais prévu 3 mais j'en ai mangé 2"
  const [rowQtys, setRowQtys] = useState({})

  const toggleCheck = (meal) => {
    setChecked(prev => {
      const next = new Set(prev)
      if (next.has(meal.id)) {
        // Décoche : on supprime aussi la quantité ajustée pour ce meal
        next.delete(meal.id)
        setRowQtys(q => { const n = { ...q }; delete n[meal.id]; return n })
      } else {
        // Coche : on initialise la quantité ajustée à la quantité prévue
        next.add(meal.id)
        setRowQtys(q => ({ ...q, [meal.id]: meal.qty }))
      }
      return next
    })
  }

  const setRowQty = (meal, val) => {
    // On borne entre 0 et la quantité max prévue pour ce meal
    const clamped = Math.max(0, Math.min(meal.qty, val))
    if (clamped === 0) {
      // Si on descend à 0, on décoche le meal automatiquement
      setChecked(prev => { const n = new Set(prev); n.delete(meal.id); return n })
      setRowQtys(q => { const n = { ...q }; delete n[meal.id]; return n })
    } else {
      setRowQtys(q => ({ ...q, [meal.id]: clamped }))
    }
  }

  const reset = () => {
    setChecked(new Set())
    setRowQtys({})
  }

  const handleJeter = () => {
    dayMeals.forEach(meal => {
      if (!checked.has(meal.id)) return
      const qty = rowQtys[meal.id] ?? meal.qty
      // "Mangé" : on remet en stock ce qui n'a PAS été consommé
      // ex. prévu 3, mangé 2 → on remet 1 (3 - 2 = 1)
      onConfirmMeal(meal.id, meal.qty - qty)
    })
    reset()
  }

  const handleRemettre = () => {
    dayMeals.forEach(meal => {
      if (!checked.has(meal.id)) return
      const qty = rowQtys[meal.id] ?? meal.qty
      // "Ranger" : on remet toute la quantité ajustée en stock (on n'a pas mangé)
      onConfirmMeal(meal.id, qty)
    })
    reset()
  }

  return {
    checked,
    rowQtys,
    anyChecked: checked.size > 0,
    toggleCheck,
    setRowQty,
    handleJeter,
    handleRemettre,
  }
}
