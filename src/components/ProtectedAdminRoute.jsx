import { useEffect } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import { useModals } from '../hooks/useModals.js'
import { SpinnerIcon } from './icons.jsx'

export const ProtectedAdminRoute = () => {
  const { isAdmin, isAuthenticated, initializing } = useAuth()
  const { openLogin } = useModals()

  // Логін тепер модалка, не сторінка — замість редіректу на /login
  // відкриваємо її поверх головної.
  useEffect(() => {
    if (!initializing && !isAuthenticated) openLogin()
  }, [initializing, isAuthenticated, openLogin])

  if (initializing) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-text-muted">
        <SpinnerIcon className="h-5 w-5 animate-spin" />
        Завантаження…
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
