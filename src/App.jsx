import { useState } from 'react'
import { useStore }      from './hooks/useStore'
import { useRecipes }    from './hooks/useRecipes'
import { sortByUrgency } from './utils/badges'
import Header       from './components/Header'
import TabBar       from './components/TabBar'
import BottomNav    from './components/BottomNav'
import RecipeCard   from './components/RecipeCard'
import ProductRow   from './components/ProductRow'
import ListePage    from './components/ListePage'
import RecipesPage  from './components/RecipesPage'
import AddModal     from './components/AddModal'
import RecipeModal  from './components/RecipeModal'

const NO_PAGE = null

function SectionLabel({ label, count }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <p className="font-display font-semibold text-[15px] text-ink-primary">{label}</p>
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
  if (tab === 'urgent' || tab === 'frigo') return sortByUrgency(products.filter(p => p.location === 'frigo'))
  if (tab === 'congel')  return products.filter(p => p.location === 'congel')
  if (tab === 'placard') return products.filter(p => p.location === 'placard')
  return sortByUrgency(products)
}

const getSectionLabel = (tab) => ({
  urgent:  'À utiliser en priorité',
  frigo:   'Mon frigo',
  congel:  'Congélateur',
  placard: 'Placards',
  tout:    'Tout',
}[tab])

export default function App() {
  const store = useStore()
  const { recipes, addRecipe, deleteRecipe } = useRecipes()

  const [tab,        setTab]        = useState('urgent')
  const [page,       setPage]       = useState(NO_PAGE)
  const [showAdd,    setShowAdd]    = useState(false)
  const [showRecipe, setShowRecipe] = useState(false)
  const [recipe,     setRecipe]     = useState(null)

  const viewProducts   = getView(tab, store.products)
  const uncheckedCount = store.shoppingList.filter(i => !i.checked).length

  const goHome = () => { setPage(NO_PAGE); setTab('urgent') }

  return (
    <div className="min-h-dvh bg-canvas max-w-[430px] mx-auto font-body text-ink-primary">

      {page === 'liste' && (
        <ListePage
          items={store.shoppingList}
          onToggle={store.toggleShoppingItem}
          onRemove={store.removeFromShoppingList}
          onClearChecked={store.clearCheckedItems}
          onReorder={store.reorderShoppingList}
          onAddItem={(name) => store.addToShoppingList({ id: Date.now(), name, emoji: '🛒' })}
          onClose={() => setPage(NO_PAGE)}
        />
      )}
      {page === 'recettes' && (
        <RecipesPage
          recipes={recipes}
          onAddRecipe={addRecipe}
          onDeleteRecipe={deleteRecipe}
          onClose={() => setPage(NO_PAGE)}
        />
      )}

      <Header onTitleClick={goHome} onAdd={() => setShowAdd(true)} />
      <TabBar active={tab} onChange={setTab} />

      <main className="px-4 pt-4 pb-36">
<SectionLabel label={getSectionLabel(tab)} count={viewProducts.length} />

        {viewProducts.length === 0 ? (
          <EmptyState
            icon={tab === 'congel' ? '❄️' : tab === 'placard' ? '📦' : '🧊'}
            title="Rien ici"
            desc="Appuie sur + pour commencer."
          />
        ) : (
          <div className="bg-canvas-surface rounded-xl border border-canvas-border divide-y divide-canvas-border px-4">
            {viewProducts.map(p => (
              <ProductRow
                key={p.id}
                product={p}
                onDelete={() => store.deleteProduct(p.id)}
                onAddToCart={() => store.addToShoppingList(p)}
              />
            ))}
          </div>
        )}

        {tab === 'urgent' && (
          <div className="mt-4">
            <RecipeCard
              recipes={recipes}
              products={store.products}
              onViewRecipe={(r) => { setRecipe(r); setShowRecipe(true) }}
            />
          </div>
        )}
      </main>

      <BottomNav
        shoppingCount={uncheckedCount}
        activePage={page}
        onShowListe={()    => setPage(p => p === 'liste'    ? NO_PAGE : 'liste')}
        onShowRecettes={() => setPage(p => p === 'recettes' ? NO_PAGE : 'recettes')}
      />

      {showAdd && (
        <AddModal
          onClose={() => setShowAdd(false)}
          onAdd={(p) => { store.addProduct(p); setShowAdd(false) }}
        />
      )}

      {showRecipe && recipe && (
        <RecipeModal
          recipe={recipe}
          products={store.products}
          onClose={() => setShowRecipe(false)}
        />
      )}
    </div>
  )
}
