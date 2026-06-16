import { useState, useCallback } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { useSortable }   from './hooks/useSortable'
import { useStore }      from './hooks/useStore'
import { useRecipes }    from './hooks/useRecipes'
import { sortByUrgency } from './utils/badges'
import Header          from './components/Header'
import MenuDrawer      from './components/MenuDrawer'
import TabBar          from './components/TabBar'
import RecipeCard      from './components/RecipeCard'
import ProductRow      from './components/ProductRow'
import ListePage       from './components/ListePage'
import RecipesPage     from './components/RecipesPage'
import AddModal        from './components/AddModal'
import AddRecipeModal  from './components/AddRecipeModal'
import RecipeModal     from './components/RecipeModal'

function SortIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 16V4m0 0L3 8m4-4l4 4"/>
      <path d="M17 8v12m0 0l4-4m-4 4l-4-4"/>
    </svg>
  )
}

function SectionLabel({ label, count, onSort, sorting }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <p className="font-display font-semibold text-[15px] text-ink-primary">{label}</p>
        {onSort && (
          <button
            onClick={onSort}
            className={`w-6 h-6 flex items-center justify-center rounded-md transition-colors ${
              sorting ? 'text-ink-primary bg-brand' : 'text-ink-secondary/50 hover:text-ink-secondary'
            }`}
          >
            <SortIcon />
          </button>
        )}
      </div>
      {count !== undefined && (
        <span className="font-body text-[13px] text-ink-secondary">
          {count} article{count > 1 ? 's' : ''}
        </span>
      )}
    </div>
  )
}

function EmptyState({ icon, title, desc }) {
  return (
    <div className="text-center py-16 px-6">
      <span className="text-4xl block mb-3">{icon}</span>
      <h3 className="font-display font-semibold text-[18px] text-ink-primary mb-2">{title}</h3>
      <p className="font-body text-[14px] text-ink-secondary">{desc}</p>
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
  placard: 'Placards',
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

  const uncheckedCount = store.shoppingList.filter(i => !i.checked).length
  const viewProducts   = getView(tab, store.products)
  const canDrag        = tab !== 'urgent' && sorting

  const activePage = location.pathname === '/liste'
    ? 'liste'
    : location.pathname.startsWith('/recettes')
    ? 'recettes'
    : null

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
    const daysLeft = (() => {
      if (location !== 'frigo' || !expiryDateStr) return null
      const diff = new Date(expiryDateStr) - new Date(new Date().toISOString().split('T')[0])
      return Math.max(0, Math.ceil(diff / 86400000))
    })()
    store.shoppingList
      .filter(i => i.checked)
      .forEach(item => store.addProduct({
        name:     item.name,
        emoji:    item.emoji ?? null,
        image:    null,
        qty:      item.qty ?? 1,
        daysLeft,
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
            <TabBar active={tab} onChange={(t) => { setTab(t); setSorting(false) }} />

            <main className="px-4 pt-4 pb-16">
              <SectionLabel
                label={getSectionLabel(tab)}
                count={viewProducts.length}
                onSort={tab !== 'urgent' ? () => setSorting(s => !s) : undefined}
                sorting={sorting}
              />

              {viewProducts.length === 0 ? (
                <EmptyState
                  icon={tab === 'congel' ? '❄️' : tab === 'placard' ? '📦' : '🧊'}
                  title="Rien ici"
                  desc="Appuie sur + pour commencer."
                />
              ) : (
                <div className="bg-canvas-surface rounded-xl border border-canvas-border divide-y divide-canvas-border px-4">
                  {viewProducts.map((p, index) => (
                    <ProductRow
                      key={p.id}
                      product={p}
                      onDelete={() => store.decrementProduct(p.id)}
                      onAddToCart={() => store.addToShoppingList(p)}
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

              {tab === 'urgent' && (
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
              />
            )}
          </>
        } />

        {/* ── Liste de courses ── */}
        <Route path="/liste" element={
          <ListePage
            items={store.shoppingList}
            onToggle={store.toggleShoppingItem}
            onRemove={store.removeFromShoppingList}
            onClearChecked={store.clearCheckedItems}
            onReorder={store.reorderShoppingList}
            onAddItem={(name) => store.addToShoppingList({ id: Date.now(), name, emoji: '🛒' })}
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
