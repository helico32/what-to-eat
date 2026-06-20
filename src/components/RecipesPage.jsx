import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getIngredientChipBg } from '../utils/badges'
import { btnActive, btnDefault } from '../utils/styles'
import { useSortable } from '../hooks/useSortable'
import Header from './Header'
import SearchBar from './SearchBar'
import SearchEmpty from './SearchEmpty'

function ClockIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  )
}

function SortIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m21 16-4 4-4-4"/>
      <path d="M17 20V4"/>
      <path d="m3 8 4-4 4 4"/>
      <path d="M7 4v16"/>
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

function StarIcon({ filled }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
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

function RecipeItem({ recipe, products, onDelete, onView, onToggleFavorite, canSort, isDragging, rowProps, handleProps, sortIndex, sortTotal, onMoveTo }) {
  const getDays = (name) => {
    const p = products.find(x => x.name === name)
    return (p && p.daysLeft !== null) ? p.daysLeft : null
  }
  const [confirm, setConfirm] = useState(false)

  return (
    <div {...rowProps} className={`bg-canvas-card rounded-xl border border-ink-primary shadow-sm overflow-hidden transition-opacity ${isDragging ? 'opacity-40' : ''}`}>
      <div
        className="flex items-center gap-3 p-4 cursor-pointer"
        onClick={() => !canSort && onView(recipe)}
      >
        {/* Emoji thumbnail */}
        <div className="w-14 h-14 bg-canvas rounded-md flex items-center justify-center text-3xl flex-shrink-0">
          {recipe.emoji}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            {recipe.favorite && (
              <span className="text-brand text-[14px] leading-none">★</span>
            )}
            <h3 className="font-display font-semibold text-[15px] leading-[22px] text-ink-primary truncate">
              {recipe.name}
            </h3>
          </div>
          <p className="flex items-center gap-1 font-body text-[16px] text-ink-secondary mb-1.5">
            <ClockIcon /> {recipe.time}
          </p>
          <div className="flex flex-wrap gap-1">
            {recipe.ingredients.slice(0, 3).map((ing, i) => (
              <span key={i} className={`px-2 py-0.5 rounded-pill font-body text-[14px] text-ink-secondary whitespace-nowrap ${getIngredientChipBg(getDays(ing))}`}>
                {ing}
              </span>
            ))}
            {recipe.ingredients.length > 3 && (
              <span className="px-2 py-0.5 bg-canvas text-ink-secondary rounded-pill font-body text-[14px]">
                +{recipe.ingredients.length - 3}
              </span>
            )}
          </div>
        </div>

        {/* Star */}
        <button
          onClick={e => { e.stopPropagation(); onToggleFavorite(recipe.id) }}
          className={`flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-[10px] font-body font-semibold transition-all ${recipe.favorite ? btnActive : btnDefault}`}
        >
          <StarIcon filled={recipe.favorite} />
        </button>

        {/* Sort or trash */}
        {canSort ? (
          <>
            <div
              {...handleProps}
              className="md:hidden flex-shrink-0 w-9 h-9 flex items-center justify-center text-ink-primary cursor-grab active:cursor-grabbing touch-none"
            >
              <DragHandle />
            </div>
            <div className="hidden md:flex flex-shrink-0">
              <PositionInput position={sortIndex + 1} total={sortTotal} onMoveTo={onMoveTo} />
            </div>
          </>
        ) : (
          <button
            onClick={e => { e.stopPropagation(); setConfirm(c => !c) }}
            className={`flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-[10px] border font-body font-semibold transition-all ${
              confirm ? 'bg-urgent/20 text-urgent border-urgent' : 'bg-canvas-border text-ink-secondary border-ink-primary'
            }`}
          >
            <TrashIcon />
          </button>
        )}
      </div>

      {confirm && !canSort && (
        <div className="pb-3 px-4 flex items-center gap-2">
          <p className="flex-1 font-body text-[16px] text-ink-secondary truncate">
            Supprimer « {recipe.name} » ?
          </p>
          <button
            onClick={() => onDelete(recipe.id)}
            className={`px-3 py-1.5 rounded-[10px] font-body font-semibold text-[16px] ${btnDefault}`}
          >
            Oui
          </button>
          <button
            onClick={() => setConfirm(false)}
            className={`px-3 py-1.5 rounded-[10px] font-body font-semibold text-[16px] ${btnActive}`}
          >
            Non
          </button>
        </div>
      )}
    </div>
  )
}

export default function RecipesPage({ recipes, products, onAddRecipe, onDeleteRecipe, onEditRecipe, onToggleFavorite, onReorderRecipes, onClose, onMenu, onCart, cartCount }) {
  const navigate = useNavigate()
  const [sorting, setSorting] = useState(false)
  const [search, setSearch] = useState('')

  const q = search.trim().toLowerCase()
  const sortedRecipes = [
    ...recipes.filter(r => r.favorite),
    ...recipes.filter(r => !r.favorite),
  ]
  const filteredRecipes = q
    ? sortedRecipes.filter(r =>
        r.name.toLowerCase().includes(q) ||
        r.ingredients.some(ing => ing.toLowerCase().includes(q))
      )
    : sortedRecipes

  const { activeIndex, rowProps, handleProps } = useSortable(sorting ? sortedRecipes : [], onReorderRecipes)

  const handleMoveTo = (fromIndex, toIndex) => {
    if (fromIndex === toIndex) return
    const next = [...sortedRecipes]
    const [moved] = next.splice(fromIndex, 1)
    next.splice(toIndex, 0, moved)
    onReorderRecipes(next)
  }

  return (
    <div className="fixed inset-0 z-30 bg-canvas overflow-y-auto">
      <div className="max-w-[430px] mx-auto">

        <Header
          onTitleClick={onClose}
          onAdd={() => navigate('/recettes/new')}
          onMenu={onMenu}
          onCart={onCart}
          cartCount={cartCount}
        />

        <SearchBar
          value={search}
          onChange={v => { setSearch(v); setSorting(false) }}
          placeholder="Titre ou ingrédient…"
        />

        <main className="px-4 pb-32">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <p className="font-display font-semibold text-[15px] text-ink-primary">
                {q ? `"${search.trim()}"` : 'Recettes'}
              </p>
              {!q && recipes.length > 1 && (
                <button
                  onClick={() => setSorting(s => !s)}
                  className={`w-7 h-7 flex items-center justify-center rounded-full border border-ink-primary transition-all ${
                    sorting ? 'bg-brand text-ink-primary' : 'bg-canvas-border text-ink-primary hover:bg-brand'
                  }`}
                >
                  <SortIcon />
                </button>
              )}
            </div>
            <span className="font-body text-[16px] text-ink-secondary">
              {filteredRecipes.length} recette{filteredRecipes.length > 1 ? 's' : ''}
            </span>
          </div>

          {filteredRecipes.length === 0 ? (
            q ? <SearchEmpty /> : (
            <div className="text-center py-20">
              <span className="text-4xl block mb-3">🍳</span>
              <h3 className="font-display font-semibold text-[18px] text-ink-primary mb-2">Aucune recette</h3>
              <p className="font-body text-[16px] text-ink-secondary">
                Ajoute tes recettes favorites pour les retrouver chaque soir.
              </p>
            </div>)
          ) : (
            <div className="flex flex-col gap-3">
              {filteredRecipes.map((r, index) => (
                <RecipeItem
                  key={r.id}
                  recipe={r}
                  products={products}
                  onDelete={onDeleteRecipe}
                  onView={(r) => navigate(`/recettes/${r.id}`)}
                  onToggleFavorite={onToggleFavorite}
                  canSort={sorting && !q}
                  isDragging={activeIndex === index}
                  rowProps={sorting && !q ? rowProps(index) : {}}
                  handleProps={sorting && !q ? handleProps(index) : {}}
                  sortIndex={index}
                  sortTotal={filteredRecipes.length}
                  onMoveTo={(to) => handleMoveTo(index, to)}
                />
              ))}
            </div>
          )}
        </main>

      </div>

    </div>
  )
}
