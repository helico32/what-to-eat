import { useState, useEffect } from 'react'
import { useSortable } from '../hooks/useSortable'
import { btnActive, btnDefault } from '../utils/styles'

function FridgeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2"/>
      <line x1="4" y1="10" x2="20" y2="10"/>
      <line x1="9" y1="6" x2="9" y2="8"/>
      <line x1="9" y1="14" x2="9" y2="18"/>
    </svg>
  )
}

function SnowflakeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="2" x2="12" y2="22"/>
      <path d="m4.93 4.93 14.14 14.14"/>
      <path d="m19.07 4.93-14.14 14.14"/>
      <path d="M2 12h20"/>
      <path d="m9 4-3 3 3 3"/><path d="m9 20-3-3 3-3"/>
      <path d="m15 4 3 3-3 3"/><path d="m15 20 3-3-3-3"/>
    </svg>
  )
}

function BoxIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
      <path d="m3.3 7 8.7 5 8.7-5"/>
      <line x1="12" y1="22" x2="12" y2="12"/>
    </svg>
  )
}

const LOCATIONS = [
  { id: 'frigo',   label: 'Frigo',        Icon: FridgeIcon    },
  { id: 'congel',  label: 'Congélateur',  Icon: SnowflakeIcon },
  { id: 'placard', label: 'Placard',       Icon: BoxIcon       },
]

const EXPIRY_PRESETS = [
  { label: 'Demain', days: 1  },
  { label: '1 sem.', days: 7  },
  { label: '1 mois', days: 30 },
]

const dateInDays = (n) => {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d.toISOString().split('T')[0]
}

const todayStr = () => new Date().toISOString().split('T')[0]

function RangerSheet({ checkedItems, onConfirm, onClose }) {
  const [step, setStep] = useState(1)
  const [loc,  setLoc]  = useState('frigo')
  const [expiry, setExpiry] = useState('')

  const handleNext = () => {
    if (loc === 'frigo') setStep(2)
    else onConfirm(loc, null)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-ink-primary/40" onClick={onClose}>
      <div
        className="w-full max-w-[430px] mx-auto bg-canvas-card rounded-t-[20px] px-5 pt-5 pb-10 shadow-lg"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-9 h-1 bg-canvas-border rounded-full mx-auto mb-5" />

        {step === 1 && (
          <>
            <p className="font-display font-bold text-[16px] text-ink-primary mb-1">Où ranger les courses ?</p>
            <p className="font-body text-[16px] text-ink-secondary mb-5">
              {checkedItems.length} article{checkedItems.length > 1 ? 's' : ''} sélectionné{checkedItems.length > 1 ? 's' : ''}
            </p>
            <div className="flex flex-col gap-y-3 mb-6">
              {LOCATIONS.map(l => {
                const isSelected = loc === l.id
                return (
                  <button
                    key={l.id}
                    onClick={() => setLoc(l.id)}
                    className={`flex items-center gap-4 p-4 rounded-[10px] border border-ink-primary text-left transition-all font-body font-semibold text-[16px] ${
                      isSelected ? 'bg-brand text-ink-primary' : 'bg-canvas-border text-ink-secondary'
                    }`}
                  >
                    <l.Icon />
                    <span>{l.label}</span>
                  </button>
                )
              })}
            </div>
            <button
              onClick={handleNext}
              className="w-full py-3.5 bg-forest text-canvas rounded-xl font-body font-semibold text-[16px] active:scale-[.98] transition-all"
            >
              {loc === 'frigo' ? 'Suivant' : 'Ranger'}
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <button onClick={() => setStep(1)} className="text-ink-secondary text-lg mb-3">←</button>
            <p className="font-display font-bold text-[16px] text-ink-primary mb-1">Date de péremption</p>
            <p className="font-body text-[16px] text-ink-secondary mb-5">Optionnel — s'applique à tous les articles</p>

            <div className="flex gap-2 mb-3">
              {EXPIRY_PRESETS.map(p => {
                const val = dateInDays(p.days)
                return (
                  <button
                    key={p.label}
                    onClick={() => setExpiry(val)}
                    className={`flex-1 py-2 rounded-pill font-body font-semibold text-[16px] border transition-all ${
                      expiry === val
                        ? 'bg-brand text-ink-primary border-brand'
                        : 'bg-canvas-surface text-ink-secondary border-ink-primary'
                    }`}
                  >
                    {p.label}
                  </button>
                )
              })}
            </div>

            <div className="relative mb-6">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-ink-secondary">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </div>
              <input
                type="date"
                value={expiry}
                min={todayStr()}
                onChange={e => setExpiry(e.target.value)}
                className="w-full pl-11 pr-4 py-5 bg-canvas-surface border-2 border-ink-primary rounded-xl font-body text-[15px] font-semibold outline-none focus:border-forest transition-colors"
              />
            </div>

            <button
              onClick={() => onConfirm(loc, expiry || null)}
              className="w-full py-3.5 bg-forest text-canvas rounded-xl font-body font-semibold text-[16px] active:scale-[.98] transition-all"
            >
              Ranger
            </button>
          </>
        )}
      </div>
    </div>
  )
}

function PositionInput({ position, total, onMoveTo }) {
  const [val, setVal] = useState(String(position))
  useEffect(() => setVal(String(position)), [position])

  const commit = () => {
    const n = parseInt(val)
    if (!isNaN(n) && n >= 1 && n <= total) onMoveTo(n - 1)
    else setVal(String(position))
  }

  return (
    <input
      type="number"
      min="1"
      max={total}
      value={val}
      onChange={e => setVal(e.target.value)}
      onBlur={commit}
      onKeyDown={e => e.key === 'Enter' && e.target.blur()}
      className="w-8 h-8 flex-shrink-0 rounded-full bg-[#F9EDDC] text-ink-secondary font-body font-bold text-[14px] text-center outline-none border-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
    />
  )
}

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="2 6 5 9 10 3"/>
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="6" x2="21" y2="6"/>
      <path d="M8 6V4h8v2"/>
      <path d="M19 6l-1 14H6L5 6"/>
    </svg>
  )
}

function DragHandle() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="4" y1="7"  x2="20" y2="7"/>
      <line x1="4" y1="12" x2="20" y2="12"/>
      <line x1="4" y1="17" x2="20" y2="17"/>
    </svg>
  )
}

export default function ShoppingList({ items, onToggle, onDelete, onDecrement, onIncrement, onClearChecked, onReorder, onAddCheckedToStock, canSort }) {
  const [showRangerSheet, setShowRangerSheet] = useState(false)
  const [confirmId, setConfirmId] = useState(null)
  const { activeIndex, rowProps, handleProps } = useSortable(canSort ? items : [], onReorder)

  const handleMoveTo = (fromIndex, toIndex) => {
    if (fromIndex === toIndex) return
    const next = [...items]
    const [moved] = next.splice(fromIndex, 1)
    next.splice(toIndex, 0, moved)
    onReorder(next)
  }

  const checked = items.filter(i => i.checked)

  if (items.length === 0) {
    return (
      <div className="text-center py-20">
        <span className="text-4xl block mb-3">🛒</span>
        <h3 className="font-display font-semibold text-[18px] text-ink-primary mb-2">Liste vide</h3>
        <p className="font-body text-[16px] text-ink-secondary">
          Appuie sur l'icône 🛒 à côté d'un produit.
        </p>
      </div>
    )
  }

  return (
    <div>
      <div className="bg-canvas-card rounded-xl border border-ink-primary shadow-sm mb-4 overflow-hidden">
        {items.map((item, index) => (
          <div
            key={item.id}
            {...rowProps(index)}
            className={`border-b border-ink-primary last:border-b-0 transition-opacity select-none ${
              activeIndex === index ? 'opacity-40' : ''
            }`}
          >
            <div className={`flex items-center gap-3 px-4 py-3.5 ${item.checked ? 'bg-canvas-border/40' : ''}`}>
              <button
                onClick={() => onToggle(item.id)}
                className={`w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                  item.checked
                    ? 'bg-forest border-forest text-canvas'
                    : 'border-ink-primary'
                }`}
              >
                {item.checked && <CheckIcon />}
              </button>

              <div className="w-10 h-10 bg-canvas rounded-lg flex items-center justify-center text-xl flex-shrink-0 overflow-hidden">
                {item.image
                  ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  : <span>{item.emoji ?? '🛒'}</span>
                }
              </div>

              <div className="flex-1 min-w-0">
                <p className={`font-body text-[16px] font-medium transition-colors ${
                  item.checked ? 'text-ink-secondary line-through' : 'text-ink-primary'
                }`}>
                  {item.name}
                </p>
                {!canSort && (
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <button
                      onClick={() => onDecrement(item.id)}
                      className="w-7 h-7 flex items-center justify-center rounded-full bg-canvas-border text-ink-secondary font-bold text-[14px] leading-none active:scale-90 transition-all border border-ink-primary hover:bg-brand hover:text-ink-primary"
                    >
                      −
                    </button>
                    <span className="font-body text-[14px] text-ink-secondary min-w-[20px] text-center">{item.qty}</span>
                    <button
                      onClick={() => onIncrement(item.id)}
                      className="w-7 h-7 flex items-center justify-center rounded-full bg-canvas-border text-ink-secondary font-bold text-[14px] leading-none active:scale-90 transition-all border border-ink-primary hover:bg-brand hover:text-ink-primary"
                    >
                      +
                    </button>
                  </div>
                )}
              </div>

              {canSort ? (
                <>
                  <div
                    {...handleProps(index)}
                    className="md:hidden text-ink-primary flex-shrink-0 cursor-grab active:cursor-grabbing p-1 touch-none"
                  >
                    <DragHandle />
                  </div>
                  <div className="hidden md:flex flex-shrink-0">
                    <PositionInput position={index + 1} total={items.length} onMoveTo={(to) => handleMoveTo(index, to)} />
                  </div>
                </>
              ) : (
                <button
                  onClick={() => setConfirmId(confirmId === item.id ? null : item.id)}
                  className={`flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-[10px] transition-all ${
                    confirmId === item.id ? btnActive : btnDefault
                  }`}
                >
                  <TrashIcon />
                </button>
              )}
            </div>

            {confirmId === item.id && (
              <div className="pb-3 px-4 flex items-center gap-2">
                <p className="flex-1 font-body text-[16px] text-ink-secondary truncate">
                  Supprimer "{item.name}" ?
                </p>
                <button
                  onClick={() => { onDelete(item.id); setConfirmId(null) }}
                  className={`px-3 py-1.5 rounded-[10px] font-body font-semibold text-[16px] ${btnDefault}`}
                >
                  Oui
                </button>
                <button
                  onClick={() => setConfirmId(null)}
                  className={`px-3 py-1.5 rounded-[10px] font-body font-semibold text-[16px] ${btnActive}`}
                >
                  Non
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {checked.length > 0 && (
        <div className="flex gap-2">
          <button
            onClick={() => setShowRangerSheet(true)}
            className="flex-1 py-3.5 bg-forest/10 border border-forest/20 rounded-xl font-body font-semibold text-[16px] text-forest transition-colors"
          >
            Ranger les courses ({checked.length})
          </button>
          <button
            onClick={onClearChecked}
            className="py-3.5 px-4 bg-urgent/10 border border-urgent/20 rounded-xl font-body font-semibold text-[16px] text-urgent transition-colors"
          >
            Effacer
          </button>
        </div>
      )}

      {showRangerSheet && (
        <RangerSheet
          checkedItems={checked}
          onConfirm={(loc, expiry) => { onAddCheckedToStock(loc, expiry); setShowRangerSheet(false) }}
          onClose={() => setShowRangerSheet(false)}
        />
      )}
    </div>
  )
}
