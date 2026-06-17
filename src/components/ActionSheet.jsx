import { useEffect } from 'react'

export default function ActionSheet({ product, onClose, onDelete, onAddToCart }) {
  useEffect(() => {
    const handler = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-40 flex items-end bg-ink-primary/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[430px] mx-auto bg-canvas-surface rounded-t-3xl pb-10 shadow-lg"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-9 h-1 bg-canvas-border rounded-full mx-auto mt-3 mb-5" />

        <div className="flex items-center gap-3 px-5 mb-6">
          <div className="w-12 h-12 flex items-center justify-center bg-canvas rounded-xl text-2xl">
            {product.emoji}
          </div>
          <div>
            <p className="font-body font-semibold text-[14px] text-ink-primary">{product.name}</p>
            <p className="font-body text-[12px] text-ink-secondary">{product.qty} restant{product.qty > 1 ? 's' : ''}</p>
          </div>
        </div>

        <div className="px-5 flex flex-col gap-3">
          <button
            onClick={onAddToCart}
            className="w-full flex items-center gap-3 px-4 py-4 bg-canvas border border-ink-primary rounded-xl text-left active:scale-[.98] transition-all"
          >
            <span className="text-xl">🛒</span>
            <div>
              <p className="font-body font-semibold text-[14px] text-ink-primary">Ajouter à la liste de courses</p>
              <p className="font-body text-[12px] text-ink-secondary mt-0.5">Pour ne pas oublier de racheter</p>
            </div>
          </button>

          <button
            onClick={onDelete}
            className="w-full flex items-center gap-3 px-4 py-4 bg-urgent/10 border border-urgent/20 rounded-xl text-left active:scale-[.98] transition-all"
          >
            <span className="text-xl">🗑️</span>
            <div>
              <p className="font-body font-semibold text-[14px] text-urgent">Supprimer du frigo</p>
              <p className="font-body text-[12px] text-urgent/60 mt-0.5">Consommé ou jeté</p>
            </div>
          </button>

          <button
            onClick={onClose}
            className="w-full py-3.5 font-body text-[14px] text-ink-secondary transition-colors"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  )
}
