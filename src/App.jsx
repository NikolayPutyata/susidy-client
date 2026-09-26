import { useEffect } from 'react'
import { Route, Routes } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from './store/hooks.js'
import {
  hasHardcodedUser,
  restoreSession,
  selectAuthInitializing,
  selectIsAuthenticated,
} from './store/userSlice.js'
import { hasHardcodedCart, loadMyCart } from './store/cartSlice.js'
import { Header } from './components/Header.jsx'
import { Footer } from './components/Footer.jsx'
import { CartDrawer } from './components/CartDrawer.jsx'
import { CityModal } from './components/CityModal.jsx'
import { ProtectedAdminRoute } from './components/ProtectedAdminRoute.jsx'
import { ProtectedRoute } from './components/ProtectedRoute.jsx'
import { CatalogPage } from './pages/CatalogPage.jsx'
import { CheckoutPage } from './pages/CheckoutPage.jsx'
import { OrderSuccessPage } from './pages/OrderSuccessPage.jsx'
import { MyOrdersPage } from './pages/MyOrdersPage.jsx'
import { LoginPage } from './pages/LoginPage.jsx'
import { RegisterPage } from './pages/RegisterPage.jsx'
import { NotFoundPage } from './pages/NotFoundPage.jsx'
import { AdminLayout } from './pages/admin/AdminLayout.jsx'
import { AdminProductsPage } from './pages/admin/AdminProductsPage.jsx'
import { AdminUsersPage } from './pages/admin/AdminUsersPage.jsx'
import { AdminOrdersPage } from './pages/admin/AdminOrdersPage.jsx'

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
    // Гостьовий кошик уже читається синхронно з localStorage при старті
    // cartSlice — тут лишається довантажити кошик з БД, і тільки для
    // залогіненого юзера, і тільки коли відновлення сесії вже завершилось.
    if (hasHardcodedCart || initializing || !isAuthenticated) return
    dispatch(loadMyCart())
  }, [dispatch, initializing, isAuthenticated])

  return (
    <div className="flex min-h-screen flex-col bg-bg text-text">
      <Header />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-8 pt-8">
        <Routes>
          <Route path="/" element={<CatalogPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order/success" element={<OrderSuccessPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/orders" element={<MyOrdersPage />} />
          </Route>

          <Route element={<ProtectedAdminRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminOrdersPage />} />
              <Route path="orders" element={<AdminOrdersPage />} />
              <Route path="products" element={<AdminProductsPage />} />
              <Route path="users" element={<AdminUsersPage />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
      <CartDrawer />
      <CityModal />
    </div>
  )
}

export default App
