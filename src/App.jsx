import { useState, useCallback, useEffect, useRef, lazy, Suspense } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { useStore }         from './features/products/useStore'
import { useRecipes }       from './features/recipes/useRecipes'
import { useMeals }         from './features/meals/useMeals'
import { useNotifications } from './features/notifications/useNotifications'
import { useAuth }          from './features/auth/useAuth'
import { useIsDesktop }     from './hooks/useIsDesktop'
import HomePage             from './features/products/HomePage'
import MenuDrawer           from './components/MenuDrawer'
import DesktopHeader        from './components/DesktopHeader'

// Pages secondaires — chargées uniquement à la navigation, pas au démarrage.
const ListePage       = lazy(() => import('./features/shopping/ListePage'))
const RecipesPage     = lazy(() => import('./features/recipes/RecipesPage'))
const AddRecipeModal  = lazy(() => import('./features/recipes/AddRecipeModal'))
const RecipeModal     = lazy(() => import('./features/recipes/RecipeModal'))
const MealPlanPage    = lazy(() => import('./features/meals/MealPlanPage'))
const PlanPage           = lazy(() => import('./features/auth/PlanPage'))
const AccountPage        = lazy(() => import('./features/auth/AccountPage'))
const DesktopDashboard   = lazy(() => import('./features/desktop/DesktopDashboard'))
const MentionsLegales = lazy(() => import('./features/legal/MentionsLegales'))
const Confidentialite = lazy(() => import('./features/legal/Confidentialite'))
const Conditions      = lazy(() => import('./features/legal/Conditions'))

export default function App() {
  const store    = useStore()
  const { recipes, addRecipe, deleteRecipe, editRecipe, toggleFavorite, reorderRecipes, syncAfterGoogleSignIn: syncRecipesAfterGoogleSignIn } = useRecipes()
  const navigate = useNavigate()
  const location = useLocation()

  const isDesktop = useIsDesktop()

  const [tab,      setTab]      = useState('urgent')
  const [showMenu, setShowMenu] = useState(false)

  const { permission, requestPermission, refreshToken } = useNotifications()
  const { isAnonymous, authEmail, authName, authLoading, signInWithGoogle, signOut } = useAuth()
  const [dateLocale, setDateLocale] = useState(() => localStorage.getItem('dateLocale') ?? 'fr')
  const handleDateLocaleChange = (val) => { setDateLocale(val); localStorage.setItem('dateLocale', val) }

  // Déclenche la sync produits quand l'utilisatrice passe d'anonyme à Google
  // pendant la session (sign-in via PlanPage). Le chargement initial (app ouverte
  // déjà connectée) est géré directement dans useStore, pas ici.
  const prevIsAnonymous = useRef(null)
  useEffect(() => {
    if (authLoading) return
    if (prevIsAnonymous.current === true && !isAnonymous) {
      store.syncAfterGoogleSignIn()
      syncRecipesAfterGoogleSignIn()
      refreshToken()
    }
    prevIsAnonymous.current = isAnonymous
  // store.syncAfterGoogleSignIn est stable (ne dépend pas de state React closuré)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAnonymous, authLoading])

  const mealsStore = useMeals({
    onProductsChanged: store.refreshProducts,
  })

  const uncheckedCount = store.shoppingList.filter(i => !i.checked).length

  const activePage = location.pathname === '/list'
    ? 'list'
    : location.pathname.startsWith('/recipes')
    ? 'recipes'
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
    <div className={`min-h-dvh bg-canvas font-body text-ink-primary ${isDesktop ? '' : 'max-w-[430px] mx-auto'}`}>
      {isDesktop && (
        <DesktopHeader
          onDashboard={() => setTab('urgent')}
          isAnonymous={isAnonymous}
          authLoading={authLoading}
          onShowPlan={() => navigate('/login')}
          onShowAccount={() => navigate('/compte')}
          onCart={() => navigate('/list')}
          cartCount={uncheckedCount}
        />
      )}
      <Suspense fallback={<div className="min-h-dvh bg-canvas" />}>
      <Routes>

        <Route path="/" element={
          isDesktop
            ? <DesktopDashboard
                store={store}
                mealsStore={mealsStore}
                recipes={recipes}
                tab={tab}
                onTabChange={setTab}
                onAddCheckedToStock={handleAddCheckedToStock}
                authName={authName}
                isAnonymous={isAnonymous}
                authLoading={authLoading}
                dateLocale={dateLocale}
              />
            : <HomePage
                store={store}
                mealsStore={mealsStore}
                recipes={recipes}
                uncheckedCount={uncheckedCount}
                onMenu={() => setShowMenu(true)}
                tab={tab}
                onTabChange={setTab}
              />
        } />

        {/* ── Liste de courses ── */}
        <Route path="/list" element={
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
            onCart={() => navigate('/list')}
            cartCount={uncheckedCount}
          />
        } />

        {/* ── Recettes ── */}
        <Route path="/recipes" element={
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
            onCart={() => navigate('/list')}
            cartCount={uncheckedCount}
          />
        } />

        {/* ── Ajouter une recette ── */}
        <Route path="/recipes/new" element={
          <AddRecipeModal
            onClose={() => navigate('/recipes')}
            onAdd={(r) => { addRecipe(r); navigate('/recipes') }}
          />
        } />

        {/* ── Détail recette ── */}
        <Route path="/recipes/:id" element={
          <RecipeModal
            recipes={recipes}
            products={store.products}
            onEdit={editRecipe}
          />
        } />

        {/* ── Connexion / abonnement ── */}
        <Route path="/login" element={
          <PlanPage
            onClose={() => navigate(-1)}
            onSignInWithGoogle={signInWithGoogle}
            onRequestPermission={requestPermission}
            permission={permission}
          />
        } />

        {/* ── Mon compte ── */}
        <Route path="/compte" element={
          <AccountPage
            onClose={() => navigate(-1)}
            authEmail={authEmail}
            onSignOut={signOut}
            notifPermission={permission}
            onRequestNotif={requestPermission}
            dateLocale={dateLocale}
            onDateLocaleChange={handleDateLocaleChange}
          />
        } />

        {/* ── Pages légales ── */}
        <Route path="/legal-notice" element={<MentionsLegales />} />
        <Route path="/privacy"      element={<Confidentialite />} />
        <Route path="/terms"        element={<Conditions />} />

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
            onCart={() => navigate('/list')}
            cartCount={uncheckedCount}
          />
        } />

      </Routes>
      </Suspense>

      {showMenu && !isDesktop && (
        <MenuDrawer
          activeTab={tab}
          activePage={activePage}
          shoppingCount={uncheckedCount}
          onSelectTab={(t) => { setTab(t); navigate('/') }}
          onSelectPage={(p) => navigate(`/${p}`)}
          onClose={() => setShowMenu(false)}
          isAnonymous={isAnonymous}
          authLoading={authLoading}
          onShowPlan={() => navigate('/login')}
          onShowAccount={() => navigate('/compte')}
        />
      )}
    </div>
  )
}
