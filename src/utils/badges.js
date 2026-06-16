// Returns { cls: '...', label: '...' } for product urgency badges
export function getBadge(daysLeft, location) {
  if (location === 'congel')  return { cls: 'bg-cold-light text-cold',     label: '❄️ Congélé' }
  if (location === 'placard') return { cls: 'bg-pantry-light text-pantry', label: '📦 Placard' }
  if (daysLeft === null)      return { cls: 'bg-canvas-border text-ink-secondary', label: '—' }
  if (daysLeft <= 0)  return { cls: 'bg-urgent/30 text-urgent', label: "Auj." }
  if (daysLeft === 1) return { cls: 'bg-urgent/30 text-urgent', label: '1 jour' }
  if (daysLeft <= 4)  return { cls: 'bg-days-light text-days',   label: `${daysLeft} jours` }
  return                     { cls: 'bg-fresh-light text-fresh', label: `${daysLeft} jours` }
}

// For ingredient chips in RecipeCard
export function getIngredientBadgeCls(daysLeft) {
  if (daysLeft === null || daysLeft > 4) return null // no badge if no urgency
  if (daysLeft <= 1) return 'bg-urgent/30 text-urgent'
  if (daysLeft <= 4) return 'bg-days-light text-days'
  return null
}

export function sortByUrgency(list) {
  return [...list].sort((a, b) => {
    if (a.daysLeft === null && b.daysLeft === null) return 0
    if (a.daysLeft === null) return 1
    if (b.daysLeft === null) return -1
    return a.daysLeft - b.daysLeft
  })
}
