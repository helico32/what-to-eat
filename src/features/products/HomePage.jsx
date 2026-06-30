import { useState, useCallback }  from 'react'
import { useNavigate }             from 'react-router-dom'
import { useSortable }             from '../../hooks/useSortable'
import { sortByUrgency }           from './badges'
import Header                      from '../../components/Header'
import TabBar                      from '../../components/TabBar'
import SearchBar                   from '../../components/SearchBar'
import SearchEmpty                 from '../../components/SearchEmpty'
import RecipeCard                  from '../recipes/RecipeCard'
import ProductRow                  from './ProductRow'
import AddModal                    from './AddModal'
import PlannedMealsSection         from '../meals/PlannedMealsSection'

function SortIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m21 16-4 4-4-4"/><path d="M17 20V4"/>
      <path d="m3 8 4-4 4 4"/><path d="M7 4v16"/>
    </svg>
  )
}

function CutleryToggleIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/>
      <path d="M7 2v20"/>
      <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>
    </svg>
  )
}

function SectionLabel({ label, count, onSort, sorting, onMealMode, mealMode }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <p className="font-display font-semibold text-[15px] text-ink-primary">{label}</p>
        {onSort && (
          <button
            onClick={onSort}
            aria-label="Trier manuellement"
            className={`w-8 h-8 flex items-center justify-center rounded-full border border-ink-primary transition-all ${
              sorting ? 'bg-brand text-ink-primary' : 'bg-canvas-border text-ink-primary hover:bg-brand'
            }`}
          >
            <SortIcon />
          </button>
        )}
        {onMealMode && (
          <button
            onClick={onMealMode}
            aria-label="Planifier un repas"
            className={`w-8 h-8 flex items-center justify-center rounded-full border border-ink-primary transition-all ${
              mealMode ? 'bg-brand text-ink-primary' : 'bg-canvas-border text-ink-primary hover:bg-brand'
            }`}
          >
            <CutleryToggleIcon />
          </button>
        )}
      </div>
      {count !== undefined && (
        <span className="font-body text-[16px] text-ink-secondary">
          {count} article{count > 1 ? 's' : ''}
        </span>
      )}
    </div>
  )
}

function EmptyState({ icon, title }) {
  return (
    <div className="text-center py-16 px-6">
      <span className="text-4xl block mb-3">{icon}</span>
      <h3 className="font-display font-semibold text-[18px] text-ink-primary mb-2">{title}</h3>
      <p className="font-body text-[16px] text-ink-secondary inline-flex items-center gap-1.5">
        Ajoute-le avec
        <span className="inline-flex items-center justify-center w-5 h-5 bg-brand text-ink-primary rounded-full text-[14px] font-light leading-none">+</span>
      </p>
    </div>
  )
}

const getView = (tab, products) => {
  if (tab === 'urgent') return sortByUrgency(products.filter(p => p.location === 'frigo'))
  if (tab === 'frigo')  return products.filter(p => p.location === 'frigo')
  if (tab === 'congel') return products.filter(p => p.location === 'congel')
  if (tab === 'placard') return products.filter(p => p.location === 'placard')
  return products
}

const getSectionLabel = (tab) => ({
  urgent:  'À utiliser en priorité',
  frigo:   'Frigo',
  congel:  'Congélateur',
  placard: 'Placard',
  tout:    'Tout',
}[tab])

export default function HomePage({ store, mealsStore, recipes, uncheckedCount, onMenu, tab, onTabChange }) {
  const navigate = useNavigate()
  const [showAdd,  setShowAdd]  = useState(false)
  const [sorting,  setSorting]  = useState(false)
  const [search,   setSearch]   = useState('')
  const [mealMode, setMealMode] = useState(false)

  const q            = search.trim().toLowerCase()
  const viewProducts = q
    ? store.products.filter(p => p.name.toLowerCase().includes(q))
    : getView(tab, store.products)
  const canDrag      = !q && tab !== 'urgent' && sorting

  const handleTabChange = (t) => {
    onTabChange(t)
    setSorting(false)
    setMealMode(false)
  }

  const handleAddToMeal = useCallback((product, qty) => {
    const today = new Date().toISOString().split('T')[0]
    mealsStore.addMeal(product, qty, today)
  }, [mealsStore])

  const onReorderProducts = useCallback((reorderedView) => {
    const ids = new Set(reorderedView.map(p => p.id))
    let subIdx = 0
    const merged = store.products.map(p => ids.has(p.id) ? reorderedView[subIdx++] : p)
    store.reorderProducts(merged)
  }, [store])

  const handleMoveProductTo = useCallback((fromIndex, toIndex) => {
    if (fromIndex === toIndex) return
    const view = getView(tab, store.products)
    const next = [...view]
    const [moved] = next.splice(fromIndex, 1)
    next.splice(toIndex, 0, moved)
    onReorderProducts(next)
  }, [tab, store, onReorderProducts])

  const { activeIndex, rowProps, handleProps } = useSortable(
    canDrag ? viewProducts : [],
    onReorderProducts
  )

  return (
    <>
      <Header
        onTitleClick={() => { onTabChange('urgent'); setSorting(false) }}
        onAdd={() => setShowAdd(true)}
        onMenu={onMenu}
        onCart={() => navigate('/liste')}
        cartCount={uncheckedCount}
      />
      <TabBar active={tab} onChange={handleTabChange} />

      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Rechercher un article…"
      />

      <main className="px-4 pb-16">
        {!q && (
          <PlannedMealsSection
            meals={mealsStore.meals}
            repas={mealsStore.repas}
            onConfirmMeal={mealsStore.confirmMeal}
            onCancelMeal={mealsStore.cancelMeal}
            onRenameRepas={mealsStore.renameRepas}
            onNameNoneMeals={mealsStore.nameNoneMeals}
          />
        )}

        <SectionLabel
          label={q ? `Résultats pour "${search.trim()}"` : getSectionLabel(tab)}
          count={viewProducts.length}
          onSort={!q && tab !== 'urgent' ? () => setSorting(s => !s) : undefined}
          sorting={sorting}
          onMealMode={!q && tab === 'urgent' ? () => setMealMode(m => !m) : undefined}
          mealMode={mealMode}
        />

        {viewProducts.length === 0 ? (
          q
            ? <SearchEmpty />
            : <EmptyState
                icon={tab === 'congel' ? '❄️' : tab === 'placard' ? '📦' : '🧊'}
                title="Rien ici"
              />
        ) : (
          <div className="bg-canvas-card rounded-xl border border-ink-primary divide-y divide-ink-primary px-4">
            {viewProducts.map((p, index) => (
              <ProductRow
                key={p.id}
                product={p}
                onDelete={() => store.deleteProduct(p.id)}
                onDecrement={() => store.decrementProduct(p.id)}
                onIncrement={() => store.incrementProduct(p.id)}
                onAddToCart={() => store.addToShoppingList(p)}
                onAddToMeal={(qty) => handleAddToMeal(p, qty)}
                mealMode={mealMode}
                canDrag={canDrag}
                isDragging={activeIndex === index}
                rowProps={canDrag ? rowProps(index) : {}}
                handleProps={canDrag ? handleProps(index) : {}}
                sortIndex={index}
                sortTotal={viewProducts.length}
                onMoveTo={(toIndex) => handleMoveProductTo(index, toIndex)}
              />
            ))}
          </div>
        )}

        {tab === 'urgent' && !q && (
          <div className="mt-4">
            <SectionLabel label="Proposition de repas" />
            <RecipeCard
              recipes={recipes}
              products={store.products}
              onViewRecipe={(r) => navigate(`/recettes/${r.id}`)}
            />
          </div>
        )}
      </main>

      {showAdd && (
        <AddModal
          onClose={() => setShowAdd(false)}
          onAdd={(p) => { store.addProduct(p); setShowAdd(false) }}
          products={store.products}
        />
      )}
    </>
  )
}
