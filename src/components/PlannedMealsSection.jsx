import MealGroupsList from './MealGroupsList'

export default function PlannedMealsSection({ meals, repas, onConfirmMeal, onCancelMeal, onRenameRepas, onNameNoneMeals }) {
  const today = new Date().toISOString().split('T')[0]
  const todayMeals = meals.filter(m => m.date === today)
  const todayRepas = repas.filter(r => r.date === today)

  if (todayMeals.length === 0 && todayRepas.length === 0) return null

  return (
    <div className="mb-4">
      <p className="font-display font-semibold text-[15px] text-ink-primary mb-3">Repas prévus aujourd'hui</p>
      <MealGroupsList
        meals={meals}
        repas={repas}
        date={today}
        onConfirmMeal={onConfirmMeal}
        onCancelMeal={onCancelMeal}
        onRenameRepas={onRenameRepas}
        onNameNoneMeals={onNameNoneMeals ? (name) => onNameNoneMeals(name, today) : undefined}
      />
    </div>
  )
}
