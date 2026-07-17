import { useState, useEffect, useRef } from 'react'
import { getBadge } from './badges'
import { btnActive, btnDefault } from '../../utils/styles'

function SnowflakeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m10 20-1.25-2.5L6 18"/><path d="M10 4 8.75 6.5 6 6"/><path d="m14 20 1.25-2.5L18 18"/>
      <path d="m14 4 1.25 2.5L18 6"/><path d="m17 21-3-6h-4"/><path d="m17 3-3 6 1.5 3"/>
      <path d="M2 12h6.5L10 9"/><path d="m20 10-1.5 2 1.5 2"/><path d="M22 12h-6.5L14 15"/>
      <path d="m4 10 1.5 2L4 14"/><path d="m7 21 3-6-1.5-3"/><path d="m7 3 3 6h4"/>
    </svg>
  )
}

function PackageIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"/>
      <path d="M12 22V12"/><polyline points="3.29 7 12 12 20.71 7"/><path d="m7.5 4.27 9 5.15"/>
    </svg>
  )
}

function PositionInput({ position, total, onMoveTo }) {
  const [val, setVal] = useState(String(position))
  // eslint-disable-next-line react-hooks/set-state-in-effect
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
      className="w-8 h-8 flex-shrink-0 rounded-full bg-[#F9EDDC] text-ink-primary font-body font-bold text-[14px] text-center outline-none border border-ink-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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


function CutleryIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/>
      <path d="M7 2v20"/>
      <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>
    </svg>
  )
}

// actionMode : 'meal' | 'cart' — contrôlé par le toggle global dans SectionLabel
// editMode   : boolean         — contrôlé par le toggle global dans SectionLabel
// canDrag    : true sur les tabs non-urgent hors recherche
export default function ProductRow({
  product, onDelete, onDecrement, onIncrement, onAddToCart, onAddToMeal, onUpdateExpiry,
  actionMode, editMode,
  canDrag, isDragging, rowProps, handleProps, sortIndex, sortTotal, onMoveTo,
}) {
  const badge = getBadge(product.expiryDate, product.location)
  const [confirm,    setConfirm]    = useState(null) // null | 'cart' | 'meal' | 'delete' | 'decrement'
  const [done,       setDone]       = useState(null) // null | 'cart' | 'meal' | 'delete'
  const [isDateEdit, setIsDateEdit] = useState(false)
  const timerRef = useRef()

  const handleConfirm = (type) => {
    if (type === 'cart')      onAddToCart()
    else if (type === 'delete')    onDelete()
    else if (type === 'decrement') onDecrement()
    else if (type === 'meal')      onAddToMeal(product.qty)
    setConfirm(null)
    if (type === 'cart' || type === 'delete' || type === 'meal') {
      setDone(type)
      clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => setDone(null), 1500)
    }
  }

  return (
    <div
      {...rowProps}
      {...(editMode && canDrag ? handleProps : {})}
      className={`transition-opacity ${isDragging ? 'opacity-40' : ''}`}
    >
      {/* Ligne principale */}
      <div className="flex items-center gap-3 py-3">

        {/* PositionInput — desktop uniquement, tout à gauche de la row */}
        {editMode && canDrag && (
          <div className="hidden md:flex flex-shrink-0">
            <PositionInput position={sortIndex + 1} total={sortTotal} onMoveTo={onMoveTo} />
          </div>
        )}

        {/* Thumbnail */}
        {product.image
          ? <img src={product.image} alt={product.name} className="w-[75px] h-[60px] rounded-lg object-cover flex-shrink-0" />
          : <div className="w-[75px] h-[60px] bg-canvas rounded-lg flex items-center justify-center text-2xl flex-shrink-0">
              {product.emoji ?? '📦'}
            </div>
        }

        {/* Nom + contrôles quantité */}
        <div className="flex-1 min-w-0">
          <p className="font-body font-semibold text-[16px] text-ink-primary truncate">{product.name}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <button
              disabled={product.qty === 0}
              onClick={() => product.qty <= 1
                ? setConfirm(confirm === 'decrement' ? null : 'decrement')
                : onDecrement()
              }
              className="w-7 h-7 flex items-center justify-center rounded-full bg-canvas-border text-ink-primary font-bold text-[14px] leading-none active:scale-90 transition-all border border-ink-primary hover:bg-brand hover:text-ink-primary disabled:opacity-30 disabled:pointer-events-none"
              aria-label="Diminuer"
            >
              −
            </button>
            <span className="font-body text-[14px] text-ink-primary min-w-[20px] text-center">
              {product.qty}
            </span>
            <button
              disabled={product.qty === 0}
              onClick={onIncrement}
              className="w-7 h-7 flex items-center justify-center rounded-full bg-canvas-border text-ink-primary font-bold text-[14px] leading-none active:scale-90 transition-all border border-ink-primary hover:bg-brand hover:text-ink-primary disabled:opacity-30 disabled:pointer-events-none"
              aria-label="Augmenter"
            >
              +
            </button>
          </div>
        </div>

        {/* Badge date — toujours visible */}
        {product.location === 'frigo' && !product.expiryDate ? (
          <button
            onClick={() => { setConfirm(null); setIsDateEdit(e => !e) }}
            aria-label="Ajouter une date de péremption"
            className={`flex-shrink-0 px-2.5 py-1 rounded-pill font-body font-medium text-[13px] border transition-all ${
              isDateEdit
                ? 'bg-brand border-ink-primary text-ink-primary'
                : 'bg-canvas-border border-ink-primary text-ink-primary'
            }`}
          >
            <span className="md:hidden">⚠</span>
            <span className="hidden md:inline">⚠ sans date</span>
          </button>
        ) : product.location === 'congel' ? (
          <span className={`flex-shrink-0 px-2.5 py-1 rounded-pill text-ink-primary ${badge.cls}`}>
            <SnowflakeIcon />
          </span>
        ) : product.location === 'placard' ? (
          <span className={`flex-shrink-0 px-2.5 py-1 rounded-pill text-ink-primary ${badge.cls}`}>
            <PackageIcon />
          </span>
        ) : badge.label ? (
          <span className={`flex-shrink-0 px-2.5 py-1 rounded-pill font-body font-medium text-[14px] ${badge.cls}`}>
            <span className="md:hidden">{badge.label}</span>
            <span className="hidden md:inline">{badge.labelFull}</span>
          </span>
        ) : null}

        {/* Bouton unique — poubelle en editMode, action (repas/courses) sinon */}
        {editMode ? (
          <>
            <button
              onClick={() => setConfirm(confirm === 'delete' ? null : 'delete')}
              className={`flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-[10px] transition-all ${confirm === 'delete' ? btnActive : btnDefault}`}
              aria-label="Supprimer"
            >
              <TrashIcon />
            </button>
          </>
        ) : (
          <button
            disabled={actionMode === 'meal' && product.qty === 0}
            onClick={() => setConfirm(confirm === actionMode ? null : actionMode)}
            className={`flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-[10px] font-body font-semibold transition-all ${confirm === actionMode ? btnActive : btnDefault}`}
            aria-label={actionMode === 'meal' ? 'Ajouter au repas' : 'Ajouter à la liste de courses'}
          >
            {actionMode === 'meal' ? <CutleryIcon /> : <CartIcon />}
          </button>
        )}
      </div>

      {/* Feedback succès */}
      {done && (
        <div className="pb-3 flex items-center gap-2">
          <p className="font-body text-[16px] text-forest font-semibold">
            {done === 'cart' ? '✓ Ajouté au panier' : done === 'meal' ? '✓ Ajouté au repas' : '✓ Supprimé'}
          </p>
        </div>
      )}

      {/* Picker de date inline */}
      {isDateEdit && (
        <div className="pb-3 flex items-center gap-2">
          <input
            // eslint-disable-next-line jsx-a11y/no-autofocus -- focus automatique sur le picker de date ouvert par l'utilisateur
            autoFocus
            type="date"
            min={new Date().toISOString().split('T')[0]}
            onChange={e => {
              if (e.target.value) {
                onUpdateExpiry(product.id, e.target.value)
                setIsDateEdit(false)
              }
            }}
            className="flex-1 px-3 py-1.5 bg-canvas border border-ink-primary rounded-xl font-body text-[16px] outline-none focus:border-forest transition-colors"
          />
          <button
            onClick={() => setIsDateEdit(false)}
            className={`px-3 py-1.5 rounded-[10px] font-body font-semibold text-[16px] ${btnDefault}`}
          >
            Annuler
          </button>
        </div>
      )}

      {/* Confirmation inline */}
      {confirm && (
        <div className="pb-3 flex items-center gap-2">
          <p className="flex-1 font-body text-[16px] text-ink-primary truncate">
            {confirm === 'cart' ? (
              <>
                <span className="md:hidden">Ajouter au panier ?</span>
                <span className="hidden md:inline">Ajouter "{product.name}" au panier ?</span>
              </>
            ) : confirm === 'meal' ? (
              `Ajouter ${product.name} au repas ?`
            ) : confirm === 'decrement' ? (
              `Effacer l'item ?`
            ) : (
              `Supprimer "${product.name}" ?`
            )}
          </p>
          <button
            onClick={() => handleConfirm(confirm)}
            className={`px-3 py-1.5 rounded-[10px] font-body font-semibold text-[16px] ${confirm === 'cart' || confirm === 'meal' ? btnActive : btnDefault}`}
          >
            Oui
          </button>
          <button
            onClick={() => setConfirm(null)}
            className={`px-3 py-1.5 rounded-[10px] font-body font-semibold text-[16px] ${confirm === 'cart' || confirm === 'meal' ? btnDefault : btnActive}`}
          >
            Non
          </button>
        </div>
      )}
    </div>
  )
}
