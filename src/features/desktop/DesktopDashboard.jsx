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

import { DotIcon, FridgeIcon, SnowflakeIcon, CabinetIcon, ListIcon } from '../../components/icons'

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
      <p className="font-display font-semibold text-[16px] text-ink-primary">{label}</p>
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
      <h3 className="font-display font-semibold text-[20px] text-ink-primary mb-2">{title}</h3>
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

function formatDate(dateLocale) {
  return new Date().toLocaleDateString(dateLocale === 'en' ? 'en-GB' : 'fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
}

export default function DesktopDashboard({
  store, mealsStore, recipes, tab, onTabChange,
  onAddCheckedToStock, authName, isAnonymous, authLoading, dateLocale = 'fr',
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
      <div className="max-w-[1440px] mx-auto px-8 pt-8 pb-8">

        {/* ── Greeting ── */}
        {!authLoading && (
          <div className="relative flex items-center justify-center mb-8">
            <p className="absolute left-0 font-body text-[16px] text-ink-primary capitalize">{formatDate(dateLocale)}</p>
            <h1 className="font-display font-bold text-[28px] text-ink-primary leading-tight">
              {isAnonymous
                ? 'Bonjour petit anonyme 👋'
                : `Bonjour ${authName?.split(' ')[0]} 👋`}
            </h1>
            <button
              onClick={() => setShowNewRepasSheet(true)}
              className={`absolute right-0 px-3 py-2 rounded-[10px] font-body font-semibold text-[14px] leading-6 border transition-all ${btnDefault}`}
            >
              + Ajouter un repas
            </button>
          </div>
        )}

        {/* ── Planning du jour — bande pleine largeur ── */}
        {!q && (
          <div className="mb-8">
            <PlannedMealsSection
              meals={mealsStore.meals}
              repas={mealsStore.repas}
              onConfirmMeal={mealsStore.confirmMeal}
              onCancelMeal={mealsStore.cancelMeal}
              onRenameRepas={mealsStore.renameRepas}
              onNameNoneMeals={mealsStore.nameNoneMeals}
              onAddItem={setPickerRepasId}
              onDeleteRepas={mealsStore.deleteRepas}
              onCreateRepas={undefined}
              horizontal
            />
          </div>
        )}

        {/* ── Deux colonnes ── */}
        <div className="flex gap-8 items-start pt-8">

          {/* Colonne gauche — produits (2/3) */}
          <div className="flex-[2] min-w-0">

            <div className="flex items-center gap-4 mb-8">
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
            <div className="flex items-center justify-start gap-4 mb-4">
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
          <div className="flex-[1] flex flex-col gap-8 min-w-0">

            {/* Proposition de recette */}
            <div>
              <SectionLabel label="Proposition de repas" />
              <RecipeCard
                recipes={recipes}
                products={store.products}
                onViewRecipe={(r) => navigate(`/recipes/${r.id}`)}
              />
            </div>

            {/* Liste de courses */}
            <div>
              <SectionLabel label="Liste de courses" count={store.shoppingList.length} />
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
