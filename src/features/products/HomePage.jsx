import { useState, useEffect, useCallback } from 'react'
import { useNavigate }                       from 'react-router-dom'
import { useSortable }                       from '../../hooks/useSortable'
import { sortByUrgency }                     from './badges'
import Header                                from '../../components/Header'
import TabBar                                from '../../components/TabBar'
import SearchBar                             from '../../components/SearchBar'
import SearchEmpty                           from '../../components/SearchEmpty'
import RecipeCard                            from '../recipes/RecipeCard'
import ProductRow                            from './ProductRow'
import AddModal                              from './AddModal'
import QuickAddSheet                         from './QuickAddSheet'
import PlannedMealsSection                   from '../meals/PlannedMealsSection'

function CutleryIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/>
      <path d="M7 2v20"/>
      <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>
    </svg>
  )
}

function CartIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
    </svg>
  )
}

function EditIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  )
}

// Les deux toggles vivent toujours dans la SectionLabel, peu importe l'onglet.
// — actionMode toggle : montre l'icône opposée au mode actif (icon = ce vers quoi on switche)
// — editMode toggle   : icône crayon, highlighted quand actif
function SectionLabel({ label, count, actionMode, onToggleAction, editMode, onToggleEdit }) {
  const hasToggles = !!onToggleAction
  const btnBase   = 'w-9 h-9 flex items-center justify-center rounded-full border border-ink-primary transition-all'
  const btnNormal = 'bg-canvas-border text-ink-primary hover:bg-brand'
  const btnOn     = 'bg-brand text-ink-primary'

  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-4">
        <p className="font-display font-semibold text-[17px] text-ink-primary">{label}</p>
        {hasToggles && (
          <>
            <button
              onClick={onToggleAction}
              aria-label={actionMode === 'meal' ? 'Passer en mode courses' : 'Passer en mode repas'}
              className={`${btnBase} ${btnNormal}`}
            >
              {actionMode === 'meal' ? <CartIcon /> : <CutleryIcon />}
            </button>
            <button
              onClick={onToggleEdit}
              aria-label={editMode ? 'Quitter le mode modifier' : 'Modifier'}
              className={`${btnBase} ${editMode ? btnOn : btnNormal}`}
            >
              <EditIcon />
            </button>
          </>
        )}
      </div>
      {count !== undefined && (
        <span className="font-body text-[16px] text-ink-primary">
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
      <p className="font-body text-[16px] text-ink-primary inline-flex items-center gap-1.5">
        Ajoute-le avec
        <span className="inline-flex items-center justify-center w-5 h-5 bg-brand text-ink-primary rounded-full text-[14px] font-light leading-none">+</span>
      </p>
    </div>
  )
}

const getView = (tab, products) => {
  if (tab === 'urgent')  return sortByUrgency(products.filter(p => p.location === 'frigo'))
  if (tab === 'frigo')   return products.filter(p => p.location === 'frigo')
  if (tab === 'congel')  return products.filter(p => p.location === 'congel')
  if (tab === 'placard') return products.filter(p => p.location === 'placard')
  return products
}

const getSectionLabel = (tab) => ({
  urgent:  'Priorité',
  frigo:   'Frigo',
  congel:  'Congélateur',
  placard: 'Placard',
  tout:    'Tout',
}[tab])

export default function HomePage({ store, mealsStore, recipes, uncheckedCount, onMenu, tab, onTabChange }) {
  const navigate = useNavigate()
  const [showAdd,    setShowAdd]    = useState(null)    // null | 'quick' | 'full'
  const [search,     setSearch]     = useState('')
  // Urgent → repas par défaut, autres onglets → courses par défaut
  const [actionMode, setActionMode] = useState('meal')  // 'meal' | 'cart'
  const [editMode,   setEditMode]   = useState(false)

  // Réinitialise les modes à chaque changement d'onglet (TabBar ou MenuDrawer)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActionMode(tab === 'urgent' ? 'meal' : 'cart')
    setEditMode(false)
  }, [tab])

  const q            = search.trim().toLowerCase()
  const viewProducts = q
    ? store.products.filter(p => p.name.toLowerCase().includes(q))
    : getView(tab, store.products)

  const handleAddToMeal = useCallback((product, qty) => {
    const today = new Date().toISOString().split('T')[0]
    mealsStore.addMeal(product, qty, today)
  }, [mealsStore])

  // Drag non-urgent : réordonnancement via PositionInput sur desktop
  const canDrag = !q && tab !== 'urgent'

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
        onTitleClick={() => onTabChange('urgent')}
        onAdd={() => setShowAdd('quick')}
        onMenu={onMenu}
        onCart={() => navigate('/liste')}
        cartCount={uncheckedCount}
      />
      <TabBar active={tab} onChange={onTabChange} />

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
          actionMode={actionMode}
          onToggleAction={() => setActionMode(m => m === 'meal' ? 'cart' : 'meal')}
          editMode={editMode}
          onToggleEdit={() => setEditMode(m => !m)}
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
                onUpdateExpiry={store.updateExpiryDate}
                actionMode={actionMode}
                editMode={editMode}
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

      {showAdd === 'quick' && (
        <QuickAddSheet
          onClose={() => setShowAdd(null)}
          onAdd={(p) => { store.addProduct(p); setShowAdd(null) }}
          onFullAdd={() => setShowAdd('full')}
        />
      )}
      {showAdd === 'full' && (
        <AddModal
          onClose={() => setShowAdd(null)}
          onAdd={(p) => { store.addProduct(p); setShowAdd(null) }}
          products={store.products}
        />
      )}
    </>
  )
}
