import { useState } from 'react'
import { getIngredientChipBg } from '../utils/badges'

function ClockIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  )
}

function ShuffleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 3 21 3 21 8"/>
      <line x1="4" y1="20" x2="21" y2="3"/>
      <polyline points="21 16 21 21 16 21"/>
      <line x1="4" y1="4" x2="21" y2="21"/>
    </svg>
  )
}

export default function RecipeCard({ recipes, products, onViewRecipe }) {
  const [idx, setIdx] = useState(0)

  if (!recipes.length) {
    return (
      <div className="bg-canvas-surface rounded-xl border border-canvas-border p-5 mb-4 text-center">
        <p className="font-body text-[14px] text-ink-secondary">Aucune recette — ajoute-en une via Recettes.</p>
      </div>
    )
  }

  const productNames = new Set(products.map(p => p.name))

  // Only propose recipes that have at least one ingredient in stock
  const eligible = recipes.filter(r => r.ingredients.some(ing => productNames.has(ing)))
  const pool = eligible.length > 0 ? eligible : recipes
  const recipe = pool[idx % pool.length]
  const canShuffle = pool.length > 1

  const getDays = (name) => {
    const p = products.find(x => x.name === name)
    return (p && p.daysLeft !== null) ? p.daysLeft : null
  }

  return (
    <div className="bg-canvas-surface rounded-xl border border-canvas-border mb-4 overflow-hidden">
      <div className="flex">
        {/* Left: image area */}
        <div className="w-[130px] flex-shrink-0 bg-canvas flex items-center justify-center text-[56px]">
          {recipe.emoji}
        </div>

        {/* Right: content */}
        <div className="flex-1 p-4 min-w-0">
          {/* Recipe name */}
          <h2 className="font-display font-bold text-[18px] leading-[24px] text-ink-primary mb-1.5">
            {recipe.name}
          </h2>

          {/* Time */}
          <p className="flex items-center gap-1 font-body text-[12px] text-ink-secondary mb-3">
            <ClockIcon /> {recipe.time}
          </p>

          {/* Ingredient chips */}
          {recipe.ingredients.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {recipe.ingredients.map(name => {
                const days = getDays(name)
                const chipBg = getIngredientChipBg(days)
                return (
                  <span
                    key={name}
                    className={`inline-flex items-center px-2 py-1 rounded-pill font-body text-[11px] text-ink-secondary ${chipBg}`}
                  >
                    {name}
                  </span>
                )
              })}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => onViewRecipe(recipe)}
              className="flex-1 py-2.5 bg-forest text-white rounded-lg font-body font-semibold text-[13px] hover:opacity-90 active:scale-[.98] transition-all"
            >
              Voir la recette
            </button>
            {canShuffle && (
              <button
                onClick={() => setIdx(i => i + 1)}
                title="Recette aléatoire"
                className="w-10 h-10 flex-shrink-0 bg-brand text-ink-primary rounded-lg flex items-center justify-center hover:opacity-90 active:scale-[.98] transition-all"
              >
                <ShuffleIcon />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
