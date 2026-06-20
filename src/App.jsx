import { useState, useCallback } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { useSortable }   from './hooks/useSortable'
import { useStore }      from './hooks/useStore'
import { useRecipes }    from './hooks/useRecipes'
import { useMeals }      from './hooks/useMeals'
import { sortByUrgency } from './utils/badges'
import Header               from './components/Header'
import MenuDrawer           from './components/MenuDrawer'
import TabBar               from './components/TabBar'
import RecipeCard           from './components/RecipeCard'
import ProductRow           from './components/ProductRow'
import ListePage            from './components/ListePage'
import RecipesPage          from './components/RecipesPage'
import AddModal             from './components/AddModal'
import AddRecipeModal       from './components/AddRecipeModal'
import SearchBar            from './components/SearchBar'
import SearchEmpty          from './components/SearchEmpty'
import RecipeModal          from './components/RecipeModal'
import PlannedMealsSection  from './components/PlannedMealsSection'
import MealPlanPage         from './components/MealPlanPage'

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
            className={`w-7 h-7 flex items-center justify-center rounded-full border border-ink-primary transition-all ${
              sorting ? 'bg-brand text-ink-primary' : 'bg-canvas-border text-ink-primary hover:bg-brand'
            }`}
          >
            <SortIcon />
          </button>
        )}
        {onMealMode && (
          <button
            onClick={onMealMode}
            className={`w-7 h-7 flex items-center justify-center rounded-full border border-ink-primary transition-all ${
              mealMode ? 'bg-brand text-ink-primary' : 'bg-canvas-border text-ink-primary hover:bg-brand'
            }`}
            title="Mode repas"
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
  if (tab === 'placard')return products.filter(p => p.location === 'placard')
  return products
}

const getSectionLabel = (tab) => ({
  urgent:  'À utiliser en priorité',
  frigo:   'Frigo',
  congel:  'Congélateur',
  placard: 'Placard',
  tout:    'Tout',
}[tab])

export default function App() {
  const store   = useStore()
  const { recipes, addRecipe, deleteRecipe, editRecipe, toggleFavorite, reorderRecipes } = useRecipes()
  const navigate = useNavigate()
  const location = useLocation()

  const [tab,      setTab]      = useState('urgent')
  const [showAdd,  setShowAdd]  = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [sorting,  setSorting]  = useState(false)
  const [search,   setSearch]   = useState('')
  const [mealMode, setMealMode] = useState(false)

  const mealsStore = useMeals({
    onDecreaseQty:  store.decreaseQty,
    onIncreaseQty:  store.increaseQty,
    onRemoveIfZero: store.removeIfZero,
  })

  const uncheckedCount  = store.shoppingList.filter(i => !i.checked).length
  const q               = search.trim().toLowerCase()
  const viewProducts    = q
    ? store.products.filter(p => p.name.toLowerCase().includes(q))
    : getView(tab, store.products)
  const canDrag         = !q && tab !== 'urgent' && sorting

  const activePage = location.pathname === '/liste'
    ? 'liste'
    : location.pathname.startsWith('/recettes')
    ? 'recettes'
    : location.pathname === '/planning'
    ? 'planning'
    : null

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

  const handleAddCheckedToStock = useCallback((location, expiryDateStr) => {
    const expiryDate = location === 'frigo' ? expiryDateStr || null : null
    store.shoppingList
      .filter(i => i.checked)
      .forEach(item => store.addProduct({
        name:     item.name,
        emoji:    item.emoji ?? null,
        image:    item.image ?? null,
        qty:      item.qty ?? 1,
        expiryDate,
        location,
      }))
    store.clearCheckedItems()
  }, [store])

  const { activeIndex, rowProps, handleProps } = useSortable(
    canDrag ? viewProducts : [],
    onReorderProducts
  )

  return (
    <div className="min-h-dvh bg-canvas max-w-[430px] mx-auto font-body text-ink-primary">
      <Routes>

        {/* ── Homepage ── */}
        <Route path="/" element={
          <>
            <Header
              onTitleClick={() => { setTab('urgent'); setSorting(false) }}
              onAdd={() => setShowAdd(true)}
              onMenu={() => setShowMenu(true)}
              onCart={() => navigate('/liste')}
              cartCount={uncheckedCount}
            />
            <TabBar active={tab} onChange={(t) => { setTab(t); setSorting(false); setMealMode(false) }} />

            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Rechercher un article…"
            />

            <main className="px-4 pb-16">
              {/* Repas prévus — visible only when meals exist and not searching */}
              {!q && (
                <PlannedMealsSection
                  meals={mealsStore.meals}
                  onConfirmMeal={mealsStore.confirmMeal}
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
        } />

        {/* ── Liste de courses ── */}
        <Route path="/liste" element={
          <ListePage
            items={store.shoppingList}
            onToggle={store.toggleShoppingItem}
            onDelete={store.removeFromShoppingList}
            onDecrement={store.decrementShoppingItem}
            onIncrement={store.incrementShoppingItem}
            onClearChecked={store.clearCheckedItems}
            onReorder={store.reorderShoppingList}
            onAddItem={(name, emoji) => store.addToShoppingList({ id: Date.now(), name, emoji: emoji ?? '🛒' })}
            onAddCheckedToStock={handleAddCheckedToStock}
            onClose={() => navigate('/')}
            onMenu={() => setShowMenu(true)}
            onCart={() => navigate('/liste')}
            cartCount={uncheckedCount}
          />
        } />

        {/* ── Recettes ── */}
        <Route path="/recettes" element={
          <RecipesPage
            recipes={recipes}
            products={store.products}
            onAddRecipe={addRecipe}
            onDeleteRecipe={deleteRecipe}
            onEditRecipe={editRecipe}
            onToggleFavorite={toggleFavorite}
            onReorderRecipes={reorderRecipes}
            onClose={() => navigate('/')}
            onMenu={() => setShowMenu(true)}
            onCart={() => navigate('/liste')}
            cartCount={uncheckedCount}
          />
        } />

        {/* ── Ajouter une recette ── */}
        <Route path="/recettes/new" element={
          <AddRecipeModal
            onClose={() => navigate('/recettes')}
            onAdd={(r) => { addRecipe(r); navigate('/recettes') }}
          />
        } />

        {/* ── Détail recette ── */}
        <Route path="/recettes/:id" element={
          <RecipeModal
            recipes={recipes}
            products={store.products}
            onEdit={editRecipe}
          />
        } />

        {/* ── Planning repas ── */}
        <Route path="/planning" element={
          <MealPlanPage
            meals={mealsStore.meals}
            products={store.products}
            onAddMeal={mealsStore.addMeal}
            onConfirmMeal={mealsStore.confirmMeal}
            onCancelMeal={mealsStore.cancelMeal}
            onClose={() => navigate('/')}
            onMenu={() => setShowMenu(true)}
            onCart={() => navigate('/liste')}
            cartCount={uncheckedCount}
          />
        } />

      </Routes>

      {showMenu && (
        <MenuDrawer
          activeTab={tab}
          activePage={activePage}
          shoppingCount={uncheckedCount}
          onSelectTab={(t) => { setTab(t); setSorting(false); navigate('/') }}
          onSelectPage={(p) => navigate(`/${p}`)}
          onClose={() => setShowMenu(false)}
        />
      )}
    </div>
  )
}
