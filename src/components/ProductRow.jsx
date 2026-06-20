import { useState, useEffect, useRef } from 'react'
import { getBadge } from '../utils/badges'
import { btnActive, btnDefault } from '../utils/styles'

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

function TrashIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="6" x2="21" y2="6"/>
      <path d="M8 6V4h8v2"/>
      <path d="M19 6l-1 14H6L5 6"/>
    </svg>
  )
}

function CartIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
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

export default function ProductRow({ product, onDelete, onDecrement, onIncrement, onAddToCart, canDrag, isDragging, rowProps, handleProps, sortIndex, sortTotal, onMoveTo }) {
  const badge = getBadge(product.expiryDate, product.location)
  const [confirm, setConfirm] = useState(null) // null | 'cart' | 'delete'
  const [done,    setDone]    = useState(null) // null | 'cart' | 'delete'
  const timerRef = useRef()

  const handleConfirm = (type) => {
    type === 'cart' ? onAddToCart() : onDelete()
    setConfirm(null)
    setDone(type)
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setDone(null), 1500)
  }

  return (
    <div {...rowProps} className={`transition-opacity ${isDragging ? 'opacity-40' : ''}`}>
      {/* Ligne principale */}
      <div className="flex items-center gap-3 py-3">
        {/* Thumbnail */}
        {product.image
          ? <img src={product.image} alt={product.name} className="w-[75px] h-[60px] rounded-lg object-cover flex-shrink-0" />
          : <div className="w-[75px] h-[60px] bg-canvas rounded-lg flex items-center justify-center text-2xl flex-shrink-0">
              {product.emoji ?? '📦'}
            </div>
        }

        {/* Name + qty controls */}
        <div className="flex-1 min-w-0">
          <p className="font-body font-semibold text-[16px] text-ink-primary truncate">{product.name}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <button
              onClick={onDecrement}
              className="w-5 h-5 flex items-center justify-center rounded-full bg-canvas-border text-ink-secondary font-bold text-[14px] leading-none active:scale-90 transition-all border border-ink-primary hover:bg-brand hover:text-ink-primary"
              title="Diminuer"
            >
              −
            </button>
            <span className="font-body text-[14px] text-ink-secondary min-w-[20px] text-center">
              {product.qty}
            </span>
            <button
              onClick={onIncrement}
              className="w-5 h-5 flex items-center justify-center rounded-full bg-canvas-border text-ink-secondary font-bold text-[14px] leading-none active:scale-90 transition-all border border-ink-primary hover:bg-brand hover:text-ink-primary"
              title="Augmenter"
            >
              +
            </button>
          </div>
        </div>

        {/* Badge */}
        {badge.label && (
          <span className={`flex-shrink-0 px-2.5 py-1 rounded-pill font-body font-medium text-[14px] ${badge.cls}`}>
            <span className="md:hidden">{badge.label}</span>
            <span className="hidden md:inline">{badge.labelFull}</span>
          </span>
        )}

        {canDrag ? (
          <>
            <div
              {...handleProps}
              className="md:hidden flex-shrink-0 w-8 h-8 flex items-center justify-center text-ink-primary cursor-grab active:cursor-grabbing touch-none"
            >
              <DragHandle />
            </div>
            <div className="hidden md:flex flex-shrink-0">
              <PositionInput position={sortIndex + 1} total={sortTotal} onMoveTo={onMoveTo} />
            </div>
          </>
        ) : (
          <>
            <button
              onClick={() => setConfirm(confirm === 'cart' ? null : 'cart')}
              className={`flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-[10px] font-body font-semibold transition-all ${confirm === 'cart' ? btnActive : btnDefault}`}
              title="Ajouter à la liste"
            >
              <CartIcon />
            </button>
            <button
              onClick={() => setConfirm(confirm === 'delete' ? null : 'delete')}
              className={`flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-[10px] transition-all ${confirm === 'delete' ? btnActive : btnDefault}`}
              title="Supprimer"
            >
              <TrashIcon />
            </button>
          </>
        )}
      </div>

      {/* Done feedback */}
      {done && (
        <div className="pb-3 flex items-center gap-2">
          <p className="font-body text-[16px] text-forest font-semibold">
            {done === 'cart' ? `✓ Ajouté au panier` : `✓ Supprimé`}
          </p>
        </div>
      )}

      {/* Confirmation inline */}
      {confirm && (
        <div className="pb-3 flex items-center gap-2">
          <p className="flex-1 font-body text-[16px] text-ink-secondary truncate">
            {confirm === 'cart'
              ? `Ajouter "${product.name}" au panier ?`
              : `Supprimer "${product.name}" ?`
            }
          </p>
          <button
            onClick={() => handleConfirm(confirm)}
            className={`px-3 py-1.5 rounded-[10px] font-body font-semibold text-[16px] ${confirm === 'delete' ? btnDefault : btnActive}`}
          >
            Oui
          </button>
          <button
            onClick={() => setConfirm(null)}
            className={`px-3 py-1.5 rounded-[10px] font-body font-semibold text-[16px] ${confirm === 'delete' ? btnActive : btnDefault}`}
          >
            Non
          </button>
        </div>
      )}
    </div>
  )
}
