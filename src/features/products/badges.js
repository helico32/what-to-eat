const computeDaysLeft = (expiryDate) => {
  if (!expiryDate) return null
  const diff = new Date(expiryDate) - new Date(new Date().toISOString().split('T')[0])
  return Math.ceil(diff / 86400000)
}

// Returns { cls: '...', label: '...' } for product urgency badges
export function getBadge(expiryDate, location) {
  if (location === 'congel')  return { cls: 'bg-transparent text-ink-primary border border-ink-primary/50', label: '❄️', labelFull: '❄️' }
  if (location === 'placard') return { cls: 'bg-transparent text-ink-primary border border-ink-primary/50', label: '📦', labelFull: '📦' }
  const daysLeft = computeDaysLeft(expiryDate)
  if (daysLeft === null)      return { cls: 'bg-canvas-border text-ink-primary border border-ink-primary', label: '', labelFull: '' }
  if (daysLeft < 0)   return { cls: 'bg-ink-primary/30 text-ink-primary border border-ink-primary',   label: `${daysLeft} j`, labelFull: `${daysLeft} jour${Math.abs(daysLeft) !== 1 ? 's' : ''}` }
  if (daysLeft === 0) return { cls: 'bg-urgent/30 text-ink-primary border border-ink-primary',  label: '0 j',          labelFull: '0 jour' }
  if (daysLeft === 1) return { cls: 'bg-urgent/30 text-ink-primary border border-ink-primary',  label: '1 j',          labelFull: '1 jour' }
  if (daysLeft <= 4)  return { cls: 'bg-caution/30 text-ink-primary border border-ink-primary', label: `${daysLeft} j`, labelFull: `${daysLeft} jours` }
  return                     { cls: 'bg-fresh/30 text-ink-primary border border-ink-primary',   label: `${daysLeft} j`, labelFull: `${daysLeft} jours` }
}

// For ingredient chips — returns only the background class (text stays ink-primary)
export function getIngredientChipBg(expiryDate) {
  const daysLeft = computeDaysLeft(expiryDate)
  if (daysLeft === null) return 'bg-canvas border border-ink-primary'
  if (daysLeft <= 1)     return 'bg-urgent/30 border border-ink-primary'
  if (daysLeft <= 4)     return 'bg-caution/30 border border-ink-primary'
  return 'bg-fresh/30 border border-ink-primary'
}

export function sortByUrgency(list) {
  return [...list].sort((a, b) => {
    if (!a.expiryDate && !b.expiryDate) return 0
    if (!a.expiryDate) return 1
    if (!b.expiryDate) return -1
    return new Date(a.expiryDate) - new Date(b.expiryDate)
  })
}
