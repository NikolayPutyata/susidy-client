import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import { SpinnerIcon } from './icons.jsx'

// На відміну від ProtectedAdminRoute — вимагає лише логін, без ролі admin.
export const ProtectedRoute = () => {
  const { isAuthenticated, initializing } = useAuth()
  const location = useLocation()

  if (initializing) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-text-muted">
        <SpinnerIcon className="h-5 w-5 animate-spin" />
        Завантаження…
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <Outlet />
}
