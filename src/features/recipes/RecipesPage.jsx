import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getIngredientChipBg } from '../products/badges'
import { btnActive, btnDefault } from '../../utils/styles'
import { useSortable } from '../../hooks/useSortable'
import Header from '../../components/Header'
import SearchBar from '../../components/SearchBar'
import SearchEmpty from '../../components/SearchEmpty'
import { useIsDesktop } from '../../hooks/useIsDesktop'

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
      className="w-8 h-8 flex-shrink-0 rounded-full bg-[#F9EDDC] text-ink-primary font-body font-bold text-[14px] text-center outline-none border-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
    />
  )
}

function RecipeItem({ recipe, products, onDelete, onView, onToggleFavorite, canSort, isDragging, rowProps, handleProps, sortIndex, sortTotal, onMoveTo, matchCount }) {
  const getDays = (name) => {
    const p = products.find(x => x.name === name)
    return (p && p.expiryDate != null) ? p.expiryDate : null
  }
  const [confirm, setConfirm] = useState(false)
  const totalCount = recipe.ingredients.length
  return (
    <div {...rowProps} className={`bg-canvas-card rounded-xl border border-ink-primary shadow-sm overflow-hidden transition-opacity ${isDragging ? 'opacity-40' : ''}`}>
      <div
        className="flex items-center gap-3 p-4 cursor-pointer"
        role="button"
        tabIndex={0}
        onClick={() => !canSort && onView(recipe)}
        onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && !canSort && onView(recipe)}
      >
        {/* Thumbnail — photo ou emoji */}
        <div className="w-14 h-14 bg-canvas rounded-md overflow-hidden flex-shrink-0 flex items-center justify-center">
          {recipe.photo
            ? <img src={recipe.photo} alt="" className="w-full h-full object-cover" />
            : <span className="text-3xl">{recipe.emoji}</span>
          }
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            {recipe.favorite && (
              <span className="text-brand text-[14px] leading-none">★</span>
            )}
            <h3 className="font-body font-semibold text-[16px] leading-[22px] text-ink-primary truncate">
              {recipe.name}
            </h3>
          </div>
          <p className="flex items-center gap-1 font-body text-[16px] text-ink-primary mb-1.5">
            <ClockIcon /> {recipe.time}
          </p>
          <div className="flex flex-wrap gap-1">
            {recipe.ingredients.slice(0, 3).map((ing, i) => (
              <span key={i} className={`px-2 py-0.5 rounded-pill font-body text-[14px] text-ink-primary whitespace-nowrap ${getIngredientChipBg(getDays(ing))}`}>
                {ing}
              </span>
            ))}
            {recipe.ingredients.length > 3 && (
              <span className="px-2 py-0.5 bg-canvas text-ink-primary rounded-pill font-body text-[14px]">
                +{recipe.ingredients.length - 3}
              </span>
            )}
          </div>
        </div>

        {/* Colonne droite : badge stock + boutons */}
        <div className="flex-shrink-0 flex flex-col items-end justify-between gap-3">
          {totalCount > 0 && matchCount > 0 && (
            <span className="flex items-center gap-1 whitespace-nowrap">
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${matchCount === totalCount ? 'bg-fresh' : 'bg-brand'}`} />
              <span className="font-body text-[14px] text-ink-primary">
                {matchCount === totalCount ? 'En stock' : `${matchCount}/${totalCount} items`}
              </span>
            </span>
          )}
          <div className="flex gap-1">
            <button
              onClick={e => { e.stopPropagation(); onToggleFavorite(recipe.id) }}
              aria-label={recipe.favorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
              className={`w-9 h-9 flex items-center justify-center rounded-[10px] font-body font-semibold transition-all ${recipe.favorite ? btnActive : btnDefault}`}
            >
              <StarIcon filled={recipe.favorite} />
            </button>
            {canSort ? (
              <>
                <div {...handleProps} className="md:hidden w-9 h-9 flex items-center justify-center text-ink-primary cursor-grab active:cursor-grabbing touch-none">
                  <DragHandle />
                </div>
                <div className="hidden md:flex">
                  <PositionInput position={sortIndex + 1} total={sortTotal} onMoveTo={onMoveTo} />
                </div>
              </>
            ) : (
              <button
                onClick={e => { e.stopPropagation(); setConfirm(c => !c) }}
                aria-label="Supprimer la recette"
                className={`w-9 h-9 flex items-center justify-center rounded-[10px] border font-body font-semibold transition-all ${
                  confirm ? 'bg-urgent/30 text-urgent border-urgent' : 'bg-canvas-border text-ink-primary border-ink-primary'
                }`}
              >
                <TrashIcon />
              </button>
            )}
          </div>
        </div>
      </div>

      {confirm && !canSort && (
        <div className="pb-3 px-4 flex items-center gap-2">
          <p className="flex-1 font-body text-[16px] text-ink-primary truncate">
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

const FILTERS = [
  { id: 'tous',      label: 'Tous'     },
  { id: 'faisable',  label: 'Faisable' },
  { id: 'urgentes',  label: 'Urgents'  },
]

export default function RecipesPage({ recipes, products, onDeleteRecipe, onToggleFavorite, onReorderRecipes, onClose, onMenu, onCart, cartCount }) {
  const navigate = useNavigate()
  const [sorting, setSorting] = useState(false)
  const [search, setSearch]   = useState('')
  const [filter, setFilter]   = useState('tous')
  const isDesktop = useIsDesktop()

  // Map nom → produit pour retrouver en O(1)
  const productMap = new Map(products.map(p => [p.name, p]))

  const getMatchCount = (recipe) =>
    recipe.ingredients.filter(ing => productMap.has(ing)).length

  const getMinExpiry = (recipe) => {
    const dates = recipe.ingredients
      .map(ing => productMap.get(ing)?.expiryDate)
      .filter(Boolean)
    if (!dates.length) return Infinity
    return Math.min(...dates.map(d => new Date(d).getTime()))
  }

  const hasUrgent = (recipe) =>
    recipe.ingredients.some(ing => {
      const p = productMap.get(ing)
      if (!p?.expiryDate) return false
      const days = Math.ceil((new Date(p.expiryDate) - new Date()) / (1000 * 60 * 60 * 24))
      return days <= 4
    })

  const faisableCount = recipes.filter(r => getMatchCount(r) > 0).length
  const urgentesCount = recipes.filter(r => hasUrgent(r)).length

  const q = search.trim().toLowerCase()

  const sortedRecipes = [
    ...recipes.filter(r => r.favorite),
    ...recipes.filter(r => !r.favorite),
  ]

  const baseRecipes = (() => {
    if (filter === 'faisable') {
      return [...recipes]
        .filter(r => getMatchCount(r) > 0)
        .sort((a, b) => getMatchCount(b) - getMatchCount(a))
    }
    if (filter === 'urgentes') {
      return [...recipes]
        .filter(r => hasUrgent(r))
        .sort((a, b) => getMinExpiry(a) - getMinExpiry(b))
    }
    return sortedRecipes
  })()

  const filteredRecipes = q
    ? baseRecipes.filter(r =>
        r.name.toLowerCase().includes(q) ||
        r.ingredients.some(ing => ing.toLowerCase().includes(q))
      )
    : baseRecipes

  const canSort = sorting && !q && filter === 'tous'
  const { activeIndex, rowProps, handleProps } = useSortable(canSort ? sortedRecipes : [], onReorderRecipes)

  const handleMoveTo = (fromIndex, toIndex) => {
    if (fromIndex === toIndex) return
    const next = [...sortedRecipes]
    const [moved] = next.splice(fromIndex, 1)
    next.splice(toIndex, 0, moved)
    onReorderRecipes(next)
  }

  return (
    <div className={isDesktop ? 'min-h-dvh bg-canvas' : 'fixed inset-0 z-30 bg-canvas overflow-y-auto'}>
      <div className={isDesktop ? 'max-w-[75%] mx-auto px-8' : 'max-w-[430px] mx-auto'}>

        {!isDesktop && (
          <Header
            onTitleClick={onClose}
            onAdd={() => navigate('/recipes/new')}
            onMenu={onMenu}
            onCart={onCart}
            cartCount={cartCount}
          />
        )}

        {isDesktop ? (
          <div className="flex items-center gap-4 pt-8 mb-8">
            <div className="flex-1 relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-primary" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
              </svg>
              <input
                type="text"
                name="search"
                value={search}
                onChange={e => { setSearch(e.target.value); setSorting(false) }}
                placeholder="Titre ou ingrédient…"
                className="w-full pl-9 pr-9 py-2 bg-canvas border border-ink-primary rounded-[10px] font-body text-[16px] text-ink-primary placeholder:text-ink-primary/50 outline-none"
              />
              {search && (
                <button onClick={() => setSearch('')} aria-label="Effacer la recherche" className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-primary text-lg leading-none">×</button>
              )}
            </div>
            <button
              onClick={() => navigate('/recipes/new')}
              className={`flex-shrink-0 px-3 py-2 rounded-[10px] font-body font-semibold text-[14px] leading-6 border transition-all ${btnDefault}`}
            >
              + Ajouter une recette
            </button>
          </div>
        ) : (
          <SearchBar
            value={search}
            onChange={v => { setSearch(v); setSorting(false) }}
            placeholder="Titre ou ingrédient…"
          />
        )}

        <main className={isDesktop ? 'pb-8' : 'px-4 pb-32'}>

          {/* Filtres */}
          {!q && (
            <div className="flex items-center gap-2 mb-4">
              {FILTERS.map(f => {
                const count = f.id === 'faisable' ? faisableCount : f.id === 'urgentes' ? urgentesCount : null
                return (
                  <button
                    key={f.id}
                    onClick={() => { setFilter(f.id); setSorting(false) }}
                    className={`flex-shrink-0 px-4 py-1.5 rounded-full font-body font-semibold text-[14px] border transition-all ${filter === f.id ? btnActive : btnDefault}`}
                  >
                    {f.label}{count !== null ? ` (${count})` : ''}
                  </button>
                )
              })}
            </div>
          )}

          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <p className="font-display font-semibold text-[15px] text-ink-primary">
                {q ? `"${search.trim()}"` : filter === 'faisable' ? 'Faisable' : filter === 'urgentes' ? 'Urgents' : 'Recettes'}
              </p>
              {!q && filter === 'tous' && recipes.length > 1 && (
                <button
                  onClick={() => setSorting(s => !s)}
                  aria-label="Trier manuellement"
                  className={`w-7 h-7 flex items-center justify-center rounded-full border border-ink-primary transition-all ${
                    sorting ? 'bg-brand text-ink-primary' : 'bg-canvas-border text-ink-primary hover:bg-brand'
                  }`}
                >
                  <SortIcon />
                </button>
              )}
            </div>
            <span className="font-body text-[16px] text-ink-primary">
              {filteredRecipes.length} recette{filteredRecipes.length > 1 ? 's' : ''}
            </span>
          </div>

          {filteredRecipes.length === 0 ? (
            q ? <SearchEmpty /> : (
              filter === 'faisable' ? (
                <div className="text-center py-20">
                  <span className="text-4xl block mb-3">🧑‍🍳</span>
                  <h3 className="font-display font-semibold text-[18px] text-ink-primary mb-2">Rien de faisable</h3>
                  <p className="font-body text-[16px] text-ink-primary">Aucune recette ne correspond aux produits en stock.</p>
                </div>
              ) : filter === 'urgentes' ? (
                <div className="text-center py-20">
                  <span className="text-4xl block mb-3">✅</span>
                  <h3 className="font-display font-semibold text-[18px] text-ink-primary mb-2">Rien d'urgent</h3>
                  <p className="font-body text-[16px] text-ink-primary">Aucun ingrédient ne périme dans les 4 prochains jours.</p>
                </div>
              ) : (
                <div className="text-center py-20">
                  <span className="text-4xl block mb-3">🍳</span>
                  <h3 className="font-display font-semibold text-[18px] text-ink-primary mb-2">Aucune recette</h3>
                  <p className="font-body text-[16px] text-ink-primary">
                    Ajoute tes recettes favorites pour les retrouver chaque soir.
                  </p>
                </div>
              )
            )
          ) : (
            <div className={isDesktop ? 'grid grid-cols-2 gap-3' : 'flex flex-col gap-3'}>
              {filteredRecipes.map((r, index) => (
                <RecipeItem
                  key={r.id}
                  recipe={r}
                  products={products}
                  onDelete={onDeleteRecipe}
                  onView={(r) => navigate(`/recipes/${r.id}`)}
                  onToggleFavorite={onToggleFavorite}
                  canSort={canSort}
                  isDragging={activeIndex === index}
                  rowProps={canSort ? rowProps(index) : {}}
                  handleProps={canSort ? handleProps(index) : {}}
                  sortIndex={index}
                  sortTotal={filteredRecipes.length}
                  onMoveTo={(to) => handleMoveTo(index, to)}
                  matchCount={getMatchCount(r)}
                />
              ))}
            </div>
          )}
        </main>

      </div>

    </div>
  )
}
