import { useState, useCallback } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { useStore }                from './features/products/useStore'
import { useRecipes }              from './features/recipes/useRecipes'
import { useMeals }                from './features/meals/useMeals'
import { useNotifications }        from './features/notifications/useNotifications'
import { useAuth }                 from './features/auth/useAuth'
import HomePage                    from './features/products/HomePage'
import MenuDrawer                  from './components/MenuDrawer'
import ListePage                   from './features/shopping/ListePage'
import RecipesPage                 from './features/recipes/RecipesPage'
import AddRecipeModal              from './features/recipes/AddRecipeModal'
import RecipeModal                 from './features/recipes/RecipeModal'
import MealPlanPage                from './features/meals/MealPlanPage'

export default function App() {
  const store    = useStore()
  const { recipes, addRecipe, deleteRecipe, editRecipe, toggleFavorite, reorderRecipes } = useRecipes()
  const navigate = useNavigate()
  const location = useLocation()

  const [tab,      setTab]      = useState('urgent')
  const [sorting,  setSorting]  = useState(false)
  const [showMenu, setShowMenu] = useState(false)

  const { permission, requestPermission } = useNotifications()
  const { isAnonymous, authEmail, authLoading, signInWithGoogle, signOut } = useAuth()

  const mealsStore = useMeals({
    onProductsChanged: store.refreshProducts,
  })

  const uncheckedCount = store.shoppingList.filter(i => !i.checked).length

  const activePage = location.pathname === '/liste'
    ? 'liste'
    : location.pathname.startsWith('/recettes')
    ? 'recettes'
    : location.pathname === '/planning'
    ? 'planning'
    : null

  const handleAddCheckedToStock = useCallback((loc, expiryDateStr) => {
    const expiryDate = loc === 'frigo' ? expiryDateStr || null : null
    store.shoppingList
      .filter(i => i.checked)
      .forEach(item => store.addProduct({
        name:      item.name,
        emoji:     item.emoji ?? null,
        image:     item.image ?? null,
        qty:       item.qty ?? 1,
        expiryDate,
        location:  loc,
      }))
    store.clearCheckedItems()
  }, [store])

  return (
    <div className="min-h-dvh bg-canvas max-w-[430px] mx-auto font-body text-ink-primary">
      <Routes>

        <Route path="/" element={
          <HomePage
            store={store}
            mealsStore={mealsStore}
            recipes={recipes}
            uncheckedCount={uncheckedCount}
            onMenu={() => setShowMenu(true)}
            tab={tab}
            onTabChange={setTab}
            sorting={sorting}
            onSortingChange={setSorting}
          />
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
            repas={mealsStore.repas}
            products={store.products}
            onAddMeal={mealsStore.addMeal}
            onAddRepas={mealsStore.addRepas}
            onRenameRepas={mealsStore.renameRepas}
            onNameNoneMeals={mealsStore.nameNoneMeals}
            onDeleteRepas={mealsStore.deleteRepas}
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
          notifPermission={permission}
          onRequestNotif={requestPermission}
          isAnonymous={isAnonymous}
          authEmail={authEmail}
          authLoading={authLoading}
          onSignInWithGoogle={signInWithGoogle}
          onSignOut={signOut}
        />
      )}
    </div>
  )
}
