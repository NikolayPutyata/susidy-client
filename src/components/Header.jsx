import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useCart } from '../context/CartContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { Logo } from './Logo.jsx'
import { CartIcon, CloseIcon, MenuIcon } from './icons.jsx'

const navLinkClass = ({ isActive }) =>
  `text-sm font-medium transition ${
    isActive ? 'text-primary-light' : 'text-text-muted hover:text-text'
  }`

export const Header = () => {
  const { itemsCount, openDrawer } = useCart()
  const { user, isAdmin, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-black/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" onClick={() => setMenuOpen(false)} className="shrink-0">
          <Logo className="text-lg" />
        </Link>

        <nav className="hidden items-center gap-6 sm:flex">
          {isAdmin && (
            <NavLink to="/admin" className={navLinkClass}>
              Адмінка
            </NavLink>
          )}
          {user ? (
            <button
              onClick={logout}
              className="text-sm font-medium text-text-muted transition hover:text-text"
            >
              Вийти ({user.name})
            </button>
          ) : (
            <NavLink to="/login" className={navLinkClass}>
              Увійти
            </NavLink>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={openDrawer}
            aria-label="Відкрити кошик"
            className="relative flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-black transition hover:bg-primary-light"
          >
            <CartIcon className="h-4.5 w-4.5" />
            <span className="hidden sm:inline">Кошик</span>
            {itemsCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-xs font-bold text-black ring-2 ring-black">
                {itemsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Меню"
            className="flex h-10 w-10 items-center justify-center rounded-full text-text transition hover:bg-surface-hover sm:hidden"
          >
            {menuOpen ? <CloseIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="flex flex-col gap-1 border-t border-border px-4 py-3 sm:hidden">
          {isAdmin && (
            <NavLink
              to="/admin"
              onClick={() => setMenuOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-medium text-text-muted hover:bg-surface-hover hover:text-text"
            >
              Адмінка
            </NavLink>
          )}
          {user ? (
            <button
              onClick={() => {
                setMenuOpen(false)
                logout()
              }}
              className="rounded-lg px-3 py-2 text-left text-sm font-medium text-text-muted hover:bg-surface-hover hover:text-text"
            >
              Вийти ({user.name})
            </button>
          ) : (
            <NavLink
              to="/login"
              onClick={() => setMenuOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-medium text-text-muted hover:bg-surface-hover hover:text-text"
            >
              Увійти
            </NavLink>
          )}
        </nav>
      )}
    </header>
  )
}
