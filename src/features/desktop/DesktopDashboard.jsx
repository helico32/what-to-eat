import { useState, useCallback } from 'react'
import { useNavigate }       from 'react-router-dom'
import { sortByUrgency }     from '../products/badges'
import { btnActive, btnDefault } from '../../utils/styles'
import RecipeCard            from '../recipes/RecipeCard'
import ProductRow            from '../products/ProductRow'
import ShoppingList          from '../shopping/ShoppingList'
import PlannedMealsSection   from '../meals/PlannedMealsSection'
import AddModal              from '../products/AddModal'
import { ProductPickerSheet, NewRepasSheet } from '../meals/MealPlanPage'
import SearchEmpty           from '../../components/SearchEmpty'

function DotIcon()      { return <span className="w-2 h-2 rounded-full bg-current inline-block" /> }
function FridgeIcon()   { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="4" y1="10" x2="20" y2="10"/><line x1="9" y1="6" x2="9" y2="8"/><line x1="9" y1="14" x2="9" y2="18"/></svg> }
function SnowflakeIcon(){ return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m10 20-1.25-2.5L6 18"/><path d="M10 4 8.75 6.5 6 6"/><path d="m14 20 1.25-2.5L18 18"/><path d="m14 4 1.25 2.5L18 6"/><path d="m17 21-3-6h-4"/><path d="m17 3-3 6 1.5 3"/><path d="M2 12h6.5L10 9"/><path d="m20 10-1.5 2 1.5 2"/><path d="M22 12h-6.5L14 15"/><path d="m4 10 1.5 2L4 14"/><path d="m7 21 3-6-1.5-3"/><path d="m7 3 3 6h4"/></svg> }
function CabinetIcon()  { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"/><path d="M12 22V12"/><polyline points="3.29 7 12 12 20.71 7"/><path d="m7.5 4.27 9 5.15"/></svg> }
function ListIcon()     { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg> }

const TABS = [
  { id: 'urgent',  label: 'À utiliser en priorité', Icon: DotIcon       },
  { id: 'frigo',   label: 'Frigo',                  Icon: FridgeIcon    },
  { id: 'congel',  label: 'Congélateur',             Icon: SnowflakeIcon },
  { id: 'placard', label: 'Placard',                 Icon: CabinetIcon   },
  { id: 'tout',    label: 'Tout',                    Icon: ListIcon      },
]


function SectionLabel({ label, count }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <p className="font-display font-semibold text-[17px] text-ink-primary">{label}</p>
      {count !== undefined && (
        <span className="font-body text-[16px] text-ink-primary">{count} article{count > 1 ? 's' : ''}</span>
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

// ── Composant principal ───────────────────────────────────────────────

export default function DesktopDashboard({
  store, mealsStore, recipes, tab, onTabChange,
  onAddCheckedToStock,
}) {
  const navigate = useNavigate()
  const [showAdd,           setShowAdd]           = useState(false)
  const [pickerRepasId,     setPickerRepasId]     = useState(null)  // null | repasId | '__none__'
  const [showNewRepasSheet, setShowNewRepasSheet] = useState(false)
  const [search,            setSearch]            = useState('')

  const q            = search.trim().toLowerCase()
  const viewProducts = q
    ? store.products.filter(p => p.name.toLowerCase().includes(q))
    : getView(tab, store.products)

  const handleAddToMeal = useCallback((product, qty) => {
    const today = new Date().toISOString().split('T')[0]
    mealsStore.addMeal(product, qty, today)
  }, [mealsStore])

  // canDrag = faux sur urgent (trié par date) et pendant une recherche
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

  return (
    <div className="min-h-dvh bg-canvas font-body text-ink-primary">
      <div className="max-w-[1440px] mx-auto px-8 pt-6 pb-16">

        {/* ── Planning du jour — bande pleine largeur ── */}
        {!q && (
          <div className="mb-6">
            <PlannedMealsSection
              meals={mealsStore.meals}
              repas={mealsStore.repas}
              onConfirmMeal={mealsStore.confirmMeal}
              onCancelMeal={mealsStore.cancelMeal}
              onRenameRepas={mealsStore.renameRepas}
              onNameNoneMeals={mealsStore.nameNoneMeals}
              onAddItem={setPickerRepasId}
              onDeleteRepas={mealsStore.deleteRepas}
              onCreateRepas={() => setShowNewRepasSheet(true)}
              horizontal
            />
          </div>
        )}

        {/* ── Deux colonnes ── */}
        <div className="flex gap-8 items-start">

          {/* Colonne gauche — produits (2/3) */}
          <div className="flex-[2] min-w-0">

            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-primary" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
                </svg>
                <input
                  type="text"
                  name="search"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Rechercher un article…"
                  className="w-full pl-9 pr-9 py-2 bg-canvas border border-ink-primary rounded-[10px] font-body text-[16px] text-ink-primary placeholder:text-ink-primary/50 outline-none"
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    aria-label="Effacer la recherche"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-primary text-lg leading-none"
                  >
                    ×
                  </button>
                )}
              </div>
              <button
                onClick={() => setShowAdd(true)}
                className={`flex-shrink-0 px-3 py-2 rounded-[10px] font-body font-semibold text-[14px] leading-6 border transition-all ${btnDefault}`}
              >
                + Ajouter un item
              </button>
            </div>

            {/* Sub-nav — sous la searchbar */}
            <div className="flex items-center justify-center gap-3 mb-3">
              {TABS.map(({ id, label, Icon }) => (
                <button
                  key={id}
                  onClick={() => onTabChange(id)}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-5 py-2 rounded-full font-body font-semibold text-[16px] transition-all border ${tab === id ? btnActive : btnDefault}`}
                >
                  <Icon />
                  {label}
                </button>
              ))}
            </div>

            <SectionLabel
              label={q ? `Résultats pour "${search.trim()}"` : getSectionLabel(tab)}
              count={viewProducts.length}
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
                    canDrag={canDrag}
                    sortIndex={index}
                    sortTotal={viewProducts.length}
                    onMoveTo={(toIndex) => handleMoveProductTo(index, toIndex)}
                    desktopMode
                  />
                ))}
              </div>
            )}

          </div>

          {/* Colonne droite — recettes + courses (1/3) */}
          <div className="flex-[1] flex flex-col gap-6 min-w-0">

            {/* Proposition de recette */}
            <div>
              <p className="font-display font-semibold text-[17px] text-ink-primary mb-3">
                Proposition de repas
              </p>
              <RecipeCard
                recipes={recipes}
                products={store.products}
                onViewRecipe={(r) => navigate(`/recipes/${r.id}`)}
              />
            </div>

            {/* Liste de courses */}
            <div>
              <p className="font-display font-semibold text-[17px] text-ink-primary mb-3">
                Liste de courses
              </p>
              <ShoppingList
                items={store.shoppingList}
                onToggle={store.toggleShoppingItem}
                onDelete={store.removeFromShoppingList}
                onDecrement={store.decrementShoppingItem}
                onIncrement={store.incrementShoppingItem}
                onClearChecked={store.clearCheckedItems}
                onReorder={store.reorderShoppingList}
                onAddCheckedToStock={onAddCheckedToStock}
                canSort={false}
              />
            </div>

          </div>
        </div>
      </div>

      {/* Modal ajout produit */}
      {showAdd && (
        <AddModal
          onClose={() => setShowAdd(false)}
          onAdd={(p) => { store.addProduct(p); setShowAdd(false) }}
        />
      )}

      {/* Picker produit → repas */}
      {pickerRepasId !== null && (
        <ProductPickerSheet
          products={store.products}
          selectedDate={new Date().toISOString().split('T')[0]}
          onAdd={(product, qty, date) => {
            const repasId = pickerRepasId === '__none__' ? null : pickerRepasId
            mealsStore.addMeal(product, qty, date, repasId)
          }}
          onClose={() => setPickerRepasId(null)}
        />
      )}

      {/* Créer un nouveau repas */}
      {showNewRepasSheet && (
        <NewRepasSheet
          onConfirm={(name) => {
            mealsStore.addRepas(name, new Date().toISOString().split('T')[0])
            setShowNewRepasSheet(false)
          }}
          onClose={() => setShowNewRepasSheet(false)}
        />
      )}
    </div>
  )
}
