// Returns { cls: '...', label: '...' } for product urgency badges
export function getBadge(daysLeft, location) {
  if (location === 'congel')  return { cls: 'bg-cold-light text-cold',     label: '❄️' }
  if (location === 'placard') return { cls: 'bg-pantry-light text-pantry', label: '📦' }
  if (daysLeft === null)      return { cls: '', label: '' }
  if (daysLeft <= 0)  return { cls: 'bg-urgent/30 text-ink-secondary', label: "Auj." }
  if (daysLeft === 1) return { cls: 'bg-urgent/30 text-ink-secondary', label: '1 jour' }
  if (daysLeft <= 4)  return { cls: 'bg-days-light text-ink-secondary', label: `${daysLeft} jours` }
  return                     { cls: 'bg-fresh-light text-ink-secondary', label: `${daysLeft} jours` }
}

// For ingredient chips — returns only the background class (text stays ink-secondary)
export function getIngredientChipBg(daysLeft) {
  if (daysLeft === null) return 'bg-canvas'
  if (daysLeft <= 1)     return 'bg-urgent/30'
  if (daysLeft <= 4)     return 'bg-days-light'
  return 'bg-fresh-light'
}

export function sortByUrgency(list) {
  return [...list].sort((a, b) => {
    if (a.daysLeft === null && b.daysLeft === null) return 0
    if (a.daysLeft === null) return 1
    if (b.daysLeft === null) return -1
    return a.daysLeft - b.daysLeft
  })
}
