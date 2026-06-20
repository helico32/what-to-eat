import { useState } from 'react'
import MealConfirmSheet from './MealConfirmSheet'

function getDayLabel(dateStr) {
  const today = new Date().toISOString().split('T')[0]
  const tomorrow = (() => {
    const d = new Date()
    d.setDate(d.getDate() + 1)
    return d.toISOString().split('T')[0]
  })()
  if (dateStr === today) return "Aujourd'hui"
  if (dateStr === tomorrow) return 'Demain'
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric' })
}

export default function PlannedMealsSection({ meals, onConfirmMeal }) {
  const [selectedMeal, setSelectedMeal] = useState(null)

  const today = new Date().toISOString().split('T')[0]
  const todayMeals = meals.filter(m => m.date === today)

  if (todayMeals.length === 0) return null

  return (
    <>
      <div className="mb-4">
        <p className="font-display font-semibold text-[15px] text-ink-primary mb-3">Repas prévus aujourd'hui</p>

        <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4" style={{ scrollbarWidth: 'none' }}>
          {todayMeals.map(meal => (
            <button
              key={meal.id}
              onClick={() => setSelectedMeal(meal)}
              className="flex items-center gap-2.5 bg-canvas-card border border-ink-primary rounded-xl px-3 py-2.5 flex-shrink-0 w-[160px] text-left active:scale-95 transition-all shadow-sm"
            >
              <div className="w-9 h-9 bg-canvas rounded-lg flex items-center justify-center text-xl flex-shrink-0 overflow-hidden">
                {meal.productSnapshot.image
                  ? <img src={meal.productSnapshot.image} alt="" className="w-full h-full object-cover" />
                  : <span>{meal.productSnapshot.emoji ?? '🍽️'}</span>
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-body font-semibold text-[13px] text-ink-primary truncate">{meal.productSnapshot.name}</p>
                <p className="font-body text-[12px] text-ink-secondary">x {meal.qty}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {selectedMeal && (
        <MealConfirmSheet
          meal={selectedMeal}
          onConfirm={(returnQty) => {
            onConfirmMeal(selectedMeal.id, returnQty)
            setSelectedMeal(null)
          }}
          onClose={() => setSelectedMeal(null)}
        />
      )}
    </>
  )
}
