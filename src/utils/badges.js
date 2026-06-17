const computeDaysLeft = (expiryDate) => {
  if (!expiryDate) return null
  const diff = new Date(expiryDate) - new Date(new Date().toISOString().split('T')[0])
  return Math.max(0, Math.ceil(diff / 86400000))
}

// Returns { cls: '...', label: '...' } for product urgency badges
export function getBadge(expiryDate, location) {
  if (location === 'congel')  return { cls: 'bg-cold-light text-ink-secondary',    label: '❄️' }
  if (location === 'placard') return { cls: 'bg-canvas-border text-ink-secondary', label: '📦' }
  const daysLeft = computeDaysLeft(expiryDate)
  if (daysLeft === null)      return { cls: '', label: '' }
  if (daysLeft <= 0)  return { cls: 'bg-urgent/30 text-ink-secondary', label: "Auj." }
  if (daysLeft === 1) return { cls: 'bg-urgent/30 text-ink-secondary', label: '1 jour' }
  if (daysLeft <= 4)  return { cls: 'bg-brand/30 text-ink-secondary',  label: `${daysLeft} jours` }
  return                     { cls: 'bg-canvas-border text-ink-secondary', label: `${daysLeft} jours` }
}

// For ingredient chips — returns only the background class (text stays ink-secondary)
export function getIngredientChipBg(expiryDate) {
  const daysLeft = computeDaysLeft(expiryDate)
  if (daysLeft === null) return 'bg-canvas'
  if (daysLeft <= 1)     return 'bg-urgent/30'
  if (daysLeft <= 4)     return 'bg-brand/30'
  return 'bg-canvas-border'
}

export function sortByUrgency(list) {
  return [...list].sort((a, b) => {
    if (!a.expiryDate && !b.expiryDate) return 0
    if (!a.expiryDate) return 1
    if (!b.expiryDate) return -1
    return new Date(a.expiryDate) - new Date(b.expiryDate)
  })
}
