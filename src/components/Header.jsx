import { Link, NavLink } from 'react-router-dom'
import { useCart } from '../context/CartContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'

export const Header = () => {
  const { itemsCount } = useCart()
  const { user, isAdmin, logout } = useAuth()

  return (
    <header className="sticky top-0 z-20 border-b border-neutral-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link to="/" className="text-xl font-bold text-neutral-900">
          🍣 Susidy
        </Link>

        <nav className="flex items-center gap-4 text-sm">
          {isAdmin && (
            <NavLink
              to="/admin"
              className="text-neutral-600 hover:text-neutral-900"
            >
              Адмінка
            </NavLink>
          )}

          {user ? (
            <button
              onClick={logout}
              className="text-neutral-600 hover:text-neutral-900"
            >
              Вийти ({user.name})
            </button>
          ) : (
            <Link to="/login" className="text-neutral-600 hover:text-neutral-900">
              Увійти
            </Link>
          )}

          <Link
            to="/cart"
            className="relative rounded-full bg-neutral-900 px-4 py-2 text-white"
          >
            Кошик
            {itemsCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-xs">
                {itemsCount}
              </span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  )
}
