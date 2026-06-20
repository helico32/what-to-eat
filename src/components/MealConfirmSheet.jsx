import { useState } from 'react'
import { btnActive, btnDefault } from '../utils/styles'

export default function MealConfirmSheet({ meal, onConfirm, onClose }) {
  const [returnQty, setReturnQty] = useState(0)

  return (
    <div className="fixed inset-0 z-50" onClick={onClose}>
      {/* Overlay */}
      <div className="absolute inset-0 bg-ink-primary/30" />

      {/* Sheet */}
      <div
        className="absolute bottom-0 left-0 right-0 max-w-[430px] mx-auto bg-canvas rounded-t-[20px] border-t border-x border-ink-primary p-5 pb-10 shadow-lg"
        onClick={e => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="w-9 h-1 bg-canvas-border rounded-full mx-auto mb-5" />

        {/* Product info */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 bg-canvas-border rounded-xl flex items-center justify-center text-2xl overflow-hidden flex-shrink-0">
            {meal.productSnapshot.image
              ? <img src={meal.productSnapshot.image} alt="" className="w-full h-full object-cover rounded-xl" />
              : <span>{meal.productSnapshot.emoji ?? '🍽️'}</span>
            }
          </div>
          <div>
            <p className="font-display font-semibold text-[16px] text-ink-primary">{meal.productSnapshot.name}</p>
            <p className="font-body text-[14px] text-ink-secondary">
              {meal.qty} prévu{meal.qty > 1 ? 's' : ''} · {formatDate(meal.date)}
            </p>
          </div>
        </div>

        {/* Return qty */}
        <p className="font-body font-semibold text-[15px] text-ink-primary mb-3">Remettre dans le garde-manger ?</p>
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => setReturnQty(q => Math.max(0, q - 1))}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-canvas-border text-ink-secondary font-bold text-[16px] border border-ink-primary hover:bg-brand active:scale-90 transition-all"
          >−</button>
          <span className="font-body text-[20px] text-ink-primary font-semibold min-w-[32px] text-center">{returnQty}</span>
          <button
            onClick={() => setReturnQty(q => Math.min(meal.qty, q + 1))}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-canvas-border text-ink-secondary font-bold text-[16px] border border-ink-primary hover:bg-brand active:scale-90 transition-all"
          >+</button>
          <span className="font-body text-[13px] text-ink-secondary">/ {meal.qty} max</span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className={`flex-1 py-3 rounded-[10px] font-body font-semibold text-[16px] ${btnDefault}`}
          >
            Annuler
          </button>
          <button
            onClick={() => onConfirm(returnQty)}
            className={`flex-1 py-3 rounded-[10px] font-body font-semibold text-[16px] ${btnActive}`}
          >
            Confirmer
          </button>
        </div>
      </div>
    </div>
  )
}

function formatDate(dateStr) {
  const today = new Date().toISOString().split('T')[0]
  if (dateStr === today) return "Aujourd'hui"
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })
}
