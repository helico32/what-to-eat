import { useEffect } from 'react'

function ClockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  )
}

export default function RecipeModal({ recipe, products, onClose }) {
  useEffect(() => {
    const h = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-ink-primary/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-[430px] mx-auto bg-canvas-surface rounded-t-[20px] pb-10 max-h-[90dvh] overflow-y-auto shadow-lg"
        onClick={e => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="w-9 h-1 bg-canvas-border rounded-full mx-auto mt-3 mb-0" />

        {/* Image / emoji header */}
        <div className="w-full h-40 bg-canvas flex items-center justify-center text-[64px] mb-5">
          {recipe.emoji}
        </div>

        <div className="px-5">
          {/* Title */}
          <h2 className="font-display font-bold text-[24px] leading-[32px] text-ink-primary mb-1">
            {recipe.name}
          </h2>
          <p className="flex items-center gap-1 font-body text-[13px] text-ink-secondary mb-5">
            <ClockIcon /> {recipe.time}
          </p>

          {/* Ingredients */}
          {recipe.ingredients.length > 0 && (
            <>
              <p className="font-body font-semibold text-[11px] uppercase tracking-widest text-ink-secondary mb-3">
                Ingrédients
              </p>
              <div className="flex flex-wrap gap-2 mb-5">
                {recipe.ingredients.map((name, i) => {
                  const p = products.find(x => x.name === name)
                  return (
                    <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-canvas text-ink-primary rounded-pill font-body text-[13px]">
                      {p?.emoji} {name}
                    </span>
                  )
                })}
              </div>
            </>
          )}

          {/* Steps */}
          {recipe.steps.length > 0 && (
            <>
              <p className="font-body font-semibold text-[11px] uppercase tracking-widest text-ink-secondary mb-4">
                Préparation
              </p>
              <div className="flex flex-col gap-3 mb-6">
                {recipe.steps.map((step, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-canvas font-display font-bold text-[11px] text-ink-secondary flex items-center justify-center flex-shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    <p className="font-body text-[14px] text-ink-primary leading-relaxed">{step}</p>
                  </div>
                ))}
              </div>
            </>
          )}

          <button
            onClick={onClose}
            className="w-full py-3.5 bg-forest text-white rounded-xl font-body font-semibold text-[16px] hover:opacity-90 active:scale-[.98] transition-all"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  )
}
