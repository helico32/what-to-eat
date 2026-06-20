import { useState } from 'react'
import MealConfirmSheet from './MealConfirmSheet'
import Header from './Header'
import SearchBar from './SearchBar'
import { btnActive, btnDefault } from '../utils/styles'
import { sortByUrgency, getBadge } from '../utils/badges'

function CheckIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  )
}

// ── Helpers ─────────────────────────────────────────────────────────────
function get7Days() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() + i)
    return d.toISOString().split('T')[0]
  })
}

function getDayShortLabel(dateStr, index) {
  if (index === 0) return "Auj."
  if (index === 1) return "Dem."
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('fr-FR', { weekday: 'short' })
}

function getDayNumber(dateStr) {
  return new Date(dateStr + 'T12:00:00').getDate()
}

function getDayFullLabel(dateStr, index) {
  if (index === 0) return "Aujourd'hui"
  if (index === 1) return "Demain"
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
}

// ── Product picker sheet ────────────────────────────────────────────────
function ProductPickerSheet({ products, selectedDate, onAdd, onClose }) {
  const [step, setStep] = useState('pick') // 'pick' | 'qty'
  const [chosenProduct, setChosenProduct] = useState(null)
  const [qty, setQty] = useState(1)
  const [search, setSearch] = useState('')

  const q = search.trim().toLowerCase()
  const available = sortByUrgency(products.filter(p => (p.qty ?? 0) > 0))
    .filter(p => !q || p.name.toLowerCase().includes(q))

  const handlePick = (product) => {
    setChosenProduct(product)
    setQty(Math.min(1, product.qty))
    setStep('qty')
  }

  const handleConfirm = () => {
    onAdd(chosenProduct, qty, selectedDate)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50" onClick={onClose}>
      <div className="absolute inset-0 bg-ink-primary/30" />
      <div
        className="absolute bottom-0 left-0 right-0 max-w-[430px] mx-auto bg-canvas rounded-t-[20px] border-t border-x border-ink-primary shadow-lg"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-9 h-1 bg-canvas-border rounded-full mx-auto mt-4 mb-4" />

        {step === 'pick' ? (
          <>
            <p className="font-display font-semibold text-[16px] text-ink-primary px-5 mb-3">Choisir un ingrédient</p>
            <div className="px-5 mb-3">
              <SearchBar
                value={search}
                onChange={setSearch}
                placeholder="Rechercher un ingrédient…"
              />
            </div>
            {available.length === 0 ? (
              <p className="font-body text-[15px] text-ink-secondary px-5 pb-10">Aucun ingrédient trouvé.</p>
            ) : (
              <div className="overflow-y-auto max-h-[45vh] px-5 pb-10 flex flex-col gap-2">
                {available.map(p => {
                  const badge = getBadge(p.expiryDate, p.location)
                  return (
                    <button
                      key={p.id}
                      onClick={() => handlePick(p)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border border-ink-primary text-left active:scale-[0.98] transition-all ${btnDefault}`}
                    >
                      <div className="w-9 h-9 bg-canvas rounded-lg flex items-center justify-center text-xl flex-shrink-0 overflow-hidden">
                        {p.image
                          ? <img src={p.image} alt="" className="w-full h-full object-cover" />
                          : <span>{p.emoji ?? '📦'}</span>
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-body font-semibold text-[15px] text-ink-primary truncate">{p.name}</p>
                        <p className="font-body text-[13px] text-ink-secondary">x {p.qty}</p>
                      </div>
                      {badge.label && (
                        <span className={`flex-shrink-0 px-2.5 py-1 rounded-pill font-body font-medium text-[14px] ${badge.cls}`}>
                          {badge.label}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            )}
          </>
        ) : (
          <div className="px-5 pb-10">
            {/* Selected product */}
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 bg-canvas-border rounded-xl flex items-center justify-center text-2xl overflow-hidden flex-shrink-0">
                {chosenProduct.image
                  ? <img src={chosenProduct.image} alt="" className="w-full h-full object-cover rounded-xl" />
                  : <span>{chosenProduct.emoji ?? '📦'}</span>
                }
              </div>
              <div>
                <p className="font-display font-semibold text-[16px] text-ink-primary">{chosenProduct.name}</p>
                <p className="font-body text-[13px] text-ink-secondary">{chosenProduct.qty} disponible{chosenProduct.qty > 1 ? 's' : ''}</p>
              </div>
            </div>

            <p className="font-body font-semibold text-[15px] text-ink-primary mb-3">Quantité à utiliser</p>
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={() => setQty(q => Math.max(1, q - 1))}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-canvas-border text-ink-secondary font-bold text-[16px] border border-ink-primary hover:bg-brand active:scale-90 transition-all"
              >−</button>
              <span className="font-body text-[20px] text-ink-primary font-semibold min-w-[32px] text-center">{qty}</span>
              <button
                onClick={() => setQty(q => Math.min(chosenProduct.qty, q + 1))}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-canvas-border text-ink-secondary font-bold text-[16px] border border-ink-primary hover:bg-brand active:scale-90 transition-all"
              >+</button>
              <span className="font-body text-[13px] text-ink-secondary">/ {chosenProduct.qty} max</span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setStep('pick')}
                className={`flex-1 py-3 rounded-[10px] font-body font-semibold text-[16px] ${btnDefault}`}
              >
                Retour
              </button>
              <button
                onClick={handleConfirm}
                className={`flex-1 py-3 rounded-[10px] font-body font-semibold text-[16px] ${btnActive}`}
              >
                Ajouter au repas
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Main page ────────────────────────────────────────────────────────────
export default function MealPlanPage({ meals, products, onAddMeal, onConfirmMeal, onCancelMeal, onClose, onMenu, onCart, cartCount }) {
  const days = get7Days()
  const [selectedDay, setSelectedDay] = useState(days[0])
  const [showPicker, setShowPicker] = useState(false)

  // Checklist state — always visible, no toggle needed
  const [checked, setChecked] = useState(new Set())   // meal IDs that are checked
  const [rowQtys, setRowQtys] = useState({})          // mealId → qty to act on

  const dayIndex = days.indexOf(selectedDay)
  const dayMeals = meals.filter(m => m.date === selectedDay)
  const anyChecked = checked.size > 0

  const handleDayChange = (date) => {
    setSelectedDay(date)
    setChecked(new Set())
    setRowQtys({})
  }

  const toggleCheck = (meal) => {
    setChecked(prev => {
      const next = new Set(prev)
      if (next.has(meal.id)) {
        next.delete(meal.id)
        setRowQtys(q => { const n = { ...q }; delete n[meal.id]; return n })
      } else {
        next.add(meal.id)
        setRowQtys(q => ({ ...q, [meal.id]: meal.qty }))
      }
      return next
    })
  }

  const setRowQty = (meal, val) => {
    const clamped = Math.max(0, Math.min(meal.qty, val))
    if (clamped === 0) {
      setChecked(prev => { const n = new Set(prev); n.delete(meal.id); return n })
      setRowQtys(q => { const n = { ...q }; delete n[meal.id]; return n })
    } else {
      setRowQtys(q => ({ ...q, [meal.id]: clamped }))
    }
  }

  const handleJeter = () => {
    dayMeals.forEach(meal => {
      if (!checked.has(meal.id)) return
      const qty = rowQtys[meal.id] ?? meal.qty
      // throw qty items → return the rest
      onConfirmMeal(meal.id, meal.qty - qty)
    })
    setChecked(new Set())
    setRowQtys({})
  }

  const handleRemettre = () => {
    dayMeals.forEach(meal => {
      if (!checked.has(meal.id)) return
      const qty = rowQtys[meal.id] ?? meal.qty
      // put qty items back
      onConfirmMeal(meal.id, qty)
    })
    setChecked(new Set())
    setRowQtys({})
  }

  return (
    <div className="min-h-dvh bg-canvas font-body text-ink-primary">
      <Header
        onTitleClick={onClose}
        onMenu={onMenu}
        onAdd={() => setShowPicker(true)}
        onCart={onCart}
        cartCount={cartCount}
      />

      {/* 7-day selector */}
      <div className="flex gap-2 overflow-x-auto px-4 py-3 border-b border-ink-primary" style={{ scrollbarWidth: 'none' }}>
        {days.map((date, i) => {
          const active = date === selectedDay
          return (
            <button
              key={date}
              onClick={() => handleDayChange(date)}
              className={`flex-shrink-0 flex flex-col items-center px-3 py-2 rounded-xl border border-ink-primary transition-all min-w-[52px] ${active ? 'bg-brand text-ink-primary' : 'bg-canvas-border text-ink-secondary hover:bg-brand/50'}`}
            >
              <span className="font-body text-[11px] font-semibold uppercase">{getDayShortLabel(date, i)}</span>
              <span className="font-display font-bold text-[18px] leading-tight">{getDayNumber(date)}</span>
              {meals.some(m => m.date === date) && (
                <span className={`w-1.5 h-1.5 rounded-full mt-0.5 ${active ? 'bg-ink-primary' : 'bg-brand'}`} />
              )}
            </button>
          )
        })}
      </div>

      {/* Day content */}
      <main className={`px-4 pt-4 ${anyChecked ? 'pb-32' : 'pb-16'}`}>
        <p className="font-display font-semibold text-[15px] text-ink-primary mb-3 capitalize">
          {getDayFullLabel(selectedDay, dayIndex)}
        </p>

        {dayMeals.length === 0 ? (
          <div className="text-center py-10">
            <span className="text-4xl block mb-3">🍽️</span>
            <p className="font-body text-[15px] text-ink-secondary">Aucun repas prévu ce jour</p>
          </div>
        ) : (
          <div className="bg-canvas-card rounded-xl border border-ink-primary divide-y divide-ink-primary px-4 mb-4">
            {dayMeals.map(meal => {
              const isChecked = checked.has(meal.id)
              const rowQty = rowQtys[meal.id] ?? meal.qty
              return (
                <div key={meal.id} className="py-3">
                  <div className="flex items-center gap-3">
                    {/* Checkbox circle */}
                    <button
                      onClick={() => toggleCheck(meal)}
                      className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        isChecked ? 'bg-brand border-ink-primary' : 'border-ink-primary'
                      }`}
                    >
                      {isChecked && <CheckIcon />}
                    </button>

                    {/* Thumbnail */}
                    <div className="w-10 h-10 bg-canvas rounded-lg flex items-center justify-center text-xl flex-shrink-0 overflow-hidden">
                      {meal.productSnapshot.image
                        ? <img src={meal.productSnapshot.image} alt="" className="w-full h-full object-cover" />
                        : <span>{meal.productSnapshot.emoji ?? '🍽️'}</span>
                      }
                    </div>

                    {/* Name */}
                    <div className="flex-1 min-w-0">
                      <p className="font-body font-semibold text-[15px] text-ink-primary truncate">{meal.productSnapshot.name}</p>
                      <p className="font-body text-[13px] text-ink-secondary">x {meal.qty} prévu{meal.qty > 1 ? 's' : ''}</p>
                    </div>

                    {/* Qty selector — only when checked */}
                    {isChecked && (
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                          onClick={() => setRowQty(meal, rowQty - 1)}
                          className="w-7 h-7 flex items-center justify-center rounded-full bg-canvas-border text-ink-secondary font-bold text-[14px] border border-ink-primary hover:bg-brand active:scale-90 transition-all"
                        >−</button>
                        <span className="font-body text-[14px] text-ink-primary font-semibold min-w-[16px] text-center">{rowQty}</span>
                        <button
                          onClick={() => setRowQty(meal, rowQty + 1)}
                          className="w-7 h-7 flex items-center justify-center rounded-full bg-canvas-border text-ink-secondary font-bold text-[14px] border border-ink-primary hover:bg-brand active:scale-90 transition-all"
                        >+</button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

      </main>

      {/* Action bar — appears when at least one item is checked */}
      {anyChecked && (
        <div className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto bg-canvas border-t border-ink-primary px-4 py-4 flex gap-2">
          <button
            onClick={handleJeter}
            className={`flex-1 py-3 rounded-[10px] font-body font-semibold text-[16px] border border-ink-primary transition-all ${btnDefault}`}
          >
            Mangé
          </button>
          <button
            onClick={handleRemettre}
            className={`flex-1 py-3 rounded-[10px] font-body font-semibold text-[16px] transition-all ${btnActive}`}
          >
            Remettre
          </button>
        </div>
      )}

      {/* Product picker */}
      {showPicker && (
        <ProductPickerSheet
          products={products}
          selectedDate={selectedDay}
          onAdd={onAddMeal}
          onClose={() => setShowPicker(false)}
        />
      )}
    </div>
  )
}
