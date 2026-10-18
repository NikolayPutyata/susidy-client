import { useEffect } from 'react'
import { APIProvider } from '@vis.gl/react-google-maps'
import { Route, Routes } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from './store/hooks.js'
import {
  clearUser,
  hasHardcodedUser,
  restoreSession,
  selectAuthInitializing,
  selectIsAuthenticated,
} from './store/userSlice.js'
import { hasHardcodedCart, loadMyCart } from './store/cartSlice.js'
import { setUnauthorizedHandler } from './api/client.js'
import { Header } from './components/Header.jsx'
import { Footer } from './components/Footer.jsx'
import { CartDrawer } from './components/CartDrawer.jsx'
import { CityModal } from './components/CityModal.jsx'
import { AuthModal } from './components/AuthModal.jsx'
import { MyOrdersModal } from './components/MyOrdersModal.jsx'
import { ProfileModal } from './components/ProfileModal.jsx'
import { ProtectedAdminRoute } from './components/ProtectedAdminRoute.jsx'
import { CatalogPage } from './pages/CatalogPage.jsx'
import { CategoryPage } from './pages/CategoryPage.jsx'
import { CheckoutPage } from './pages/CheckoutPage.jsx'
import { NotFoundPage } from './pages/NotFoundPage.jsx'
import { AdminLayout } from './pages/admin/AdminLayout.jsx'
import { AdminProductsPage } from './pages/admin/AdminProductsPage.jsx'
import { AdminUsersPage } from './pages/admin/AdminUsersPage.jsx'
import { AdminOrdersPage } from './pages/admin/AdminOrdersPage.jsx'
import { AdminBannersPage } from './pages/admin/AdminBannersPage.jsx'

function App() {
  const dispatch = useAppDispatch()
  const initializing = useAppSelector(selectAuthInitializing)
  const isAuthenticated = useAppSelector(selectIsAuthenticated)

  useEffect(() => {
    // Якщо в userSlice захардкоджений initialUser — не перетираємо його
    // реальним (майже напевно невдалим у цьому режимі) зверненням до бекенду.
    if (!hasHardcodedUser) dispatch(restoreSession())
  }, [dispatch])

  useEffect(() => {
    // Коли refresh-токен більше не дійсний (сплив час сесії, кукі
    // підчищена браузером) — api/client.js ловить це, але раніше нікому не
    // повідомляв: юзер лишався "залогіненим" у Redux, поки кожен наступний
    // захищений запит тихо не 401-ив. Тепер стан скидається одразу.
    setUnauthorizedHandler(() => dispatch(clearUser()))
  }, [dispatch])

  useEffect(() => {
    // Гостьовий кошик уже читається синхронно з localStorage при старті
    // cartSlice — тут лишається довантажити кошик з БД, і тільки для
    // залогіненого юзера, і тільки коли відновлення сесії вже завершилось.
    if (hasHardcodedCart || initializing || !isAuthenticated) return
    dispatch(loadMyCart())
  }, [dispatch, initializing, isAuthenticated])

  return (
    <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''}>
      <div className="flex min-h-screen flex-col bg-bg text-text">
        <Header />
        {/* No max-width/padding here on purpose — each page/section owns
            its own horizontal containment, so full-bleed content (the
            homepage's promo carousel and section dividers) can span the
            real viewport edge-to-edge instead of being clipped by one
            shared container. */}
        <main className="w-full flex-1 pb-8 pt-8">
          <Routes>
            <Route path="/" element={<CatalogPage />} />
            <Route path="/category/:categoryValue" element={<CategoryPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />

            <Route element={<ProtectedAdminRoute />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminOrdersPage />} />
                <Route path="orders" element={<AdminOrdersPage />} />
                <Route path="products" element={<AdminProductsPage />} />
                <Route path="banners" element={<AdminBannersPage />} />
                <Route path="users" element={<AdminUsersPage />} />
              </Route>
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <Footer />
        <CartDrawer />
        <CityModal />
        <AuthModal />
        <MyOrdersModal />
        <ProfileModal />
      </div>
    </APIProvider>
  )
}

export default App
