import { useState } from 'react'
import AddRecipeModal from './AddRecipeModal'
import RecipeModal    from './RecipeModal'

function ClockIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  )
}

function RecipeItem({ recipe, onDelete, onView }) {
  const [showMenu, setShowMenu] = useState(false)
  const [confirm,  setConfirm]  = useState(false)

  return (
    <div className="bg-canvas-surface rounded-xl border border-canvas-border shadow-sm overflow-hidden">
      <div
        className="flex items-center gap-4 p-4 cursor-pointer"
        onClick={() => onView(recipe)}
      >
        {/* Emoji thumbnail */}
        <div className="w-16 h-16 bg-canvas rounded-md flex items-center justify-center text-3xl flex-shrink-0">
          {recipe.emoji}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-display font-semibold text-[16px] leading-[22px] text-ink-primary mb-1 truncate">
            {recipe.name}
          </h3>
          <p className="flex items-center gap-1 font-body text-[12px] text-ink-secondary mb-2">
            <ClockIcon /> {recipe.time}
          </p>
          <div className="flex flex-wrap gap-1">
            {recipe.ingredients.slice(0, 3).map((ing, i) => (
              <span key={i} className="px-2 py-0.5 bg-canvas text-ink-secondary rounded-pill font-body text-[11px]">
                {ing}
              </span>
            ))}
            {recipe.ingredients.length > 3 && (
              <span className="px-2 py-0.5 bg-canvas text-ink-secondary rounded-pill font-body text-[11px]">
                +{recipe.ingredients.length - 3}
              </span>
            )}
          </div>
        </div>

        {/* Menu */}
        <div className="relative flex-shrink-0">
          <button
            onClick={e => { e.stopPropagation(); setShowMenu(m => !m) }}
            className="w-8 h-8 flex items-center justify-center text-ink-secondary hover:bg-canvas rounded-md font-bold tracking-widest"
          >
            ···
          </button>
          {showMenu && (
            <div
              className="absolute right-0 top-9 bg-canvas-surface border border-canvas-border rounded-xl shadow-md z-10 min-w-[130px] overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() => { onView(recipe); setShowMenu(false) }}
                className="w-full px-4 py-2.5 font-body text-[14px] text-ink-primary hover:bg-canvas text-left"
              >
                Voir
              </button>
              <div className="h-px bg-canvas-border" />
              <button
                onClick={() => { setConfirm(true); setShowMenu(false) }}
                className="w-full px-4 py-2.5 font-body text-[14px] text-red-500 hover:bg-red-50 text-left"
              >
                Supprimer
              </button>
            </div>
          )}
        </div>
      </div>

      {confirm && (
        <div className="mx-4 mb-4 p-4 bg-canvas rounded-xl border border-canvas-border">
          <p className="font-body font-semibold text-[14px] text-ink-primary mb-3">
            Supprimer cette recette ?
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setConfirm(false)}
              className="flex-1 py-2 border border-canvas-border rounded-lg font-body font-semibold text-[14px] text-ink-secondary hover:bg-canvas-surface"
            >
              Annuler
            </button>
            <button
              onClick={() => onDelete(recipe.id)}
              className="flex-1 py-2 bg-brand text-ink-primary rounded-lg font-body font-semibold text-[14px] hover:opacity-90"
            >
              Supprimer
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function RecipesPage({ recipes, onAddRecipe, onDeleteRecipe, onClose }) {
  const [showAdd,    setShowAdd]    = useState(false)
  const [viewRecipe, setViewRecipe] = useState(null)

  return (
    <div className="fixed inset-0 z-30 bg-canvas overflow-y-auto">
      <div className="max-w-[430px] mx-auto">

        <header className="sticky top-0 bg-canvas/90 backdrop-blur-md pt-10 px-4 pb-0 border-b border-canvas-border z-10">
          <div className="flex items-center py-3">
            <button onClick={onClose} className="text-ink-secondary text-lg w-10">←</button>
            <h1 className="font-display font-bold text-[20px] text-ink-primary flex-1 text-center">
              Recettes
            </h1>
            <button
              onClick={() => setShowAdd(true)}
              className="w-10 h-10 bg-brand text-ink-primary rounded-full flex items-center justify-center text-xl font-light hover:opacity-90 active:scale-95 transition-all shadow-sm"
            >
              +
            </button>
          </div>
        </header>

        <main className="px-4 pt-4 pb-32">
          {recipes.length === 0 ? (
            <div className="text-center py-20">
              <span className="text-4xl block mb-3">🍳</span>
              <h3 className="font-display font-semibold text-[18px] text-ink-primary mb-2">Aucune recette</h3>
              <p className="font-body text-[14px] text-ink-secondary">
                Ajoute tes recettes favorites pour les retrouver chaque soir.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {recipes.map(r => (
                <RecipeItem key={r.id} recipe={r} onDelete={onDeleteRecipe} onView={setViewRecipe} />
              ))}
            </div>
          )}
        </main>

      </div>

      {showAdd && (
        <AddRecipeModal
          onClose={() => setShowAdd(false)}
          onAdd={(r) => { onAddRecipe(r); setShowAdd(false) }}
        />
      )}

      {viewRecipe && (
        <RecipeModal recipe={viewRecipe} products={[]} onClose={() => setViewRecipe(null)} />
      )}
    </div>
  )
}
