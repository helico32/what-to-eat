import { useState } from 'react'
import { getBadge } from '../utils/badges'

function CartIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
    </svg>
  )
}

function XIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  )
}

function ConfirmPage({ product, type, onConfirm, onCancel }) {
  const isCart = type === 'cart'
  return (
    <div className="fixed inset-0 z-40 bg-canvas overflow-y-auto">
      <div className="max-w-[430px] mx-auto min-h-full flex flex-col">

        <header className="sticky top-0 bg-canvas/90 backdrop-blur-md pt-10 px-4 pb-0 border-b border-canvas-border z-10">
          <div className="flex items-center py-3">
            <button onClick={onCancel} className="text-ink-secondary text-lg w-10">←</button>
            <h1 className="font-display font-bold text-[20px] text-ink-primary flex-1 text-center">
              {isCart ? 'Ajouter à la liste' : 'Supprimer'}
            </h1>
            <div className="w-10" />
          </div>
        </header>

        <div className="flex-1 px-4 pt-10 pb-10 flex flex-col items-center gap-6">
          <div className="w-24 h-24 bg-canvas-surface rounded-xl border border-canvas-border flex items-center justify-center text-5xl">
            {product.emoji}
          </div>

          <p className="font-body text-[16px] text-ink-primary text-center leading-relaxed">
            {isCart
              ? <>Ajouter <span className="font-semibold">{product.name}</span> à la liste de courses ?</>
              : <>Supprimer <span className="font-semibold">{product.name}</span> de ton frigo ?</>
            }
          </p>

          <div className="w-full flex flex-col gap-3 mt-4">
            <button
              onClick={onConfirm}
              className={`w-full py-3.5 rounded-xl font-body font-semibold text-[16px] hover:opacity-90 active:scale-[.98] transition-all ${
                isCart ? 'bg-forest text-white' : 'bg-urgent/20 text-urgent'
              }`}
            >
              {isCart ? 'Ajouter' : 'Supprimer'}
            </button>
            <button
              onClick={onCancel}
              className="w-full py-3.5 border border-canvas-border rounded-xl font-body font-semibold text-[16px] text-ink-secondary hover:bg-canvas-surface transition-colors"
            >
              Annuler
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}

export default function ProductRow({ product, onDelete, onAddToCart }) {
  const badge = getBadge(product.daysLeft, product.location)
  const [confirm, setConfirm] = useState(null)

  const subtitle = `${product.qty} restant${product.qty > 1 ? 's' : ''}`

  return (
    <>
      <div className="flex items-center gap-3 py-3">
        {/* Thumbnail */}
        {product.image
          ? <img src={product.image} alt={product.name} className="w-[75px] h-[60px] rounded-lg object-cover flex-shrink-0" />
          : <div className="w-[75px] h-[60px] bg-canvas rounded-lg flex items-center justify-center text-2xl flex-shrink-0">
              {product.emoji ?? '📦'}
            </div>
        }

        {/* Name + subtitle */}
        <div className="flex-1 min-w-0">
          <p className="font-body font-semibold text-[14px] text-ink-primary truncate">{product.name}</p>
          <p className="font-body text-[12px] text-ink-secondary mt-0.5">{subtitle}</p>
        </div>

        {/* Badge */}
        <span className={`flex-shrink-0 px-2.5 py-1 rounded-pill font-body font-medium text-[12px] ${badge.cls}`}>
          {badge.label}
        </span>

        {/* Cart button */}
        <button
          onClick={() => setConfirm('cart')}
          className="w-8 h-8 flex-shrink-0 flex items-center justify-center border border-canvas-border rounded-lg text-ink-secondary hover:text-brand hover:border-brand transition-colors"
          title="Ajouter à la liste"
        >
          <CartIcon />
        </button>

        {/* Delete button */}
        <button
          onClick={() => setConfirm('delete')}
          className="w-8 h-8 flex-shrink-0 flex items-center justify-center border border-canvas-border rounded-lg text-ink-secondary hover:text-urgent hover:border-urgent/40 transition-colors"
          title="Supprimer"
        >
          <XIcon />
        </button>
      </div>

      {confirm && (
        <ConfirmPage
          product={product}
          type={confirm}
          onConfirm={() => { confirm === 'cart' ? onAddToCart() : onDelete(); setConfirm(null) }}
          onCancel={() => setConfirm(null)}
        />
      )}
    </>
  )
}
