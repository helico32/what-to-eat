import { btnDefault } from '../../utils/styles'
import MealGroupsList from './MealGroupsList'

export default function PlannedMealsSection({
  meals, repas, onConfirmMeal, onCancelMeal, onRenameRepas, onNameNoneMeals,
  horizontal = false,
  onAddItem, onDeleteRepas, onCreateRepas,
}) {
  const today = new Date().toISOString().split('T')[0]
  const todayMeals = meals.filter(m => m.date === today)
  const todayRepas = repas.filter(r => r.date === today)

  if (todayMeals.length === 0 && todayRepas.length === 0) return null

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-3">
        <p className="font-display font-semibold text-[16px] text-ink-primary">Repas prévus aujourd'hui</p>
        {onCreateRepas && (
          <button
            onClick={onCreateRepas}
            className={`flex-shrink-0 px-3 py-2 rounded-[10px] font-body font-semibold text-[14px] leading-6 border transition-all ${btnDefault}`}
          >
            + Ajouter un repas
          </button>
        )}
      </div>
      <MealGroupsList
        meals={meals}
        repas={repas}
        date={today}
        onConfirmMeal={onConfirmMeal}
        onCancelMeal={onCancelMeal}
        onRenameRepas={onRenameRepas}
        onNameNoneMeals={onNameNoneMeals ? (name) => onNameNoneMeals(name, today) : undefined}
        onAddItem={onAddItem}
        onDeleteRepas={onDeleteRepas}
        horizontal={horizontal}
      />
    </div>
  )
}
