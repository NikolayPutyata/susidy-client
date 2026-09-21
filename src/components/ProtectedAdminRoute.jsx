import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { SpinnerIcon } from './icons.jsx'

export const ProtectedAdminRoute = () => {
  const { isAdmin, isAuthenticated, initializing } = useAuth()
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

  if (!isAdmin) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
