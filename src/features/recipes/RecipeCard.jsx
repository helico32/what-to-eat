import { useState } from 'react'
import { getIngredientChipBg } from '../products/badges'

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
      <path d="m18 14 4 4-4 4"/>
      <path d="m18 2 4 4-4 4"/>
      <path d="M2 18h1.973a4 4 0 0 0 3.3-1.7l5.454-8.6a4 4 0 0 1 3.3-1.7H22"/>
      <path d="M2 6h1.972a4 4 0 0 1 3.6 2.2"/>
      <path d="M22 18h-6.041a4 4 0 0 1-3.3-1.8l-.359-.45"/>
    </svg>
  )
}

export default function RecipeCard({ recipes, products, onViewRecipe }) {
  const [idx, setIdx] = useState(0)

  if (!recipes.length) {
    return (
      <div className="bg-canvas-card rounded-xl border border-ink-primary p-5 mb-4 text-center">
        <p className="font-body text-[16px] text-ink-secondary">Aucune recette — ajoute-en une via Recettes.</p>
      </div>
    )
  }

  // Map nom → produit pour retrouver un produit par son nom en O(1) au lieu de O(n)
  const productMap = new Map(products.map(p => [p.name, p]))

  // Retourne le timestamp de péremption le plus proche parmi les ingrédients
  // d'une recette qui sont en stock. Infinity si aucun ingrédient n'a de date.
  // Sert à trier : une recette avec un ingrédient qui périme demain passe avant
  // une recette dont tous les ingrédients périment dans 10 jours.
  const getMinExpiry = (r) => {
    const dates = r.ingredients
      .map(ing => productMap.get(ing)?.expiryDate) // undefined si pas en stock
      .filter(Boolean)                              // retire les undefined et null
    if (!dates.length) return Infinity              // pas de date → on la met en dernier
    return Math.min(...dates.map(d => new Date(d).getTime()))
  }

  // On garde seulement les recettes avec au moins un ingrédient en stock,
  // triées par ingrédient le plus urgent à consommer (le plus proche de sa péremption).
  const eligible = recipes
    .filter(r => r.ingredients.some(ing => productMap.has(ing)))
    .sort((a, b) => getMinExpiry(a) - getMinExpiry(b))
  // Si aucune recette ne matche le stock, on affiche toutes les recettes sans filtre
  const pool = eligible.length > 0 ? eligible : recipes
  const recipe = pool[idx % pool.length]
  const canShuffle = pool.length > 1

  // Réutilise productMap (déjà construit au-dessus) pour éviter un find() en O(n) à chaque chip
  const getDays = (name) => productMap.get(name)?.expiryDate ?? null

  return (
    <div className="bg-canvas-card rounded-xl border border-ink-primary mb-4 overflow-hidden">
      <div className="flex">
        {/* Left: photo ou emoji */}
        <div className="w-[130px] flex-shrink-0 bg-canvas overflow-hidden flex items-center justify-center">
          {recipe.photo
            ? <img src={recipe.photo} alt="" className="w-full h-full object-cover" />
            : <span className="text-[56px]">{recipe.emoji}</span>
          }
        </div>

        {/* Right: content */}
        <div className="flex-1 p-4 min-w-0">
          {/* Recipe name */}
          <h2 className="font-display font-bold text-[18px] leading-[24px] text-ink-primary mb-1.5">
            {recipe.name}
          </h2>

          {/* Time */}
          <p className="flex items-center gap-1 font-body text-[16px] text-ink-secondary mb-3">
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
                    className={`inline-flex items-center px-2 py-1 rounded-pill font-body text-[14px] text-ink-secondary whitespace-nowrap ${chipBg}`}
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
              className="flex-1 py-2.5 bg-forest text-canvas rounded-lg font-body font-semibold text-[16px] active:scale-[.98] transition-all"
            >
              Voir la recette
            </button>
            {canShuffle && (
              <button
                onClick={() => setIdx(i => i + 1)}
                aria-label="Recette aléatoire"
                className="w-10 h-10 flex-shrink-0 bg-brand text-ink-primary rounded-lg flex items-center justify-center active:scale-[.98] transition-all"
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
