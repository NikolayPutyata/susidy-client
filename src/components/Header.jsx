import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useCart } from '../hooks/useCart.js'
import { useAuth } from '../hooks/useAuth.js'
import { useCity } from '../hooks/useCity.js'
import { CATEGORIES, CITIES, SOCIAL_LINKS } from '../lib/constants.js'
import { Logo } from './Logo.jsx'
import {
  CartIcon,
  CloseIcon,
  FacebookIcon,
  InstagramIcon,
  MenuIcon,
} from './icons.jsx'

const navLinkClass = ({ isActive }) =>
  `text-sm font-medium transition ${
    isActive ? 'text-primary-light' : 'text-text-muted hover:text-text'
  }`

const menuLinkClass =
  'rounded-xl px-3.5 py-2.5 text-sm font-medium text-text-muted transition hover:bg-surface-hover hover:text-text'

const MobileMenu = ({ open, onClose }) => {
  const { user, isAdmin, logout } = useAuth()
  const { city, setCity } = useCity()
  const navigate = useNavigate()

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  const goToCategory = (value) => {
    onClose()
    navigate(value === 'all' ? '/' : `/?category=${value}`)
  }

  return (
    <div className="fixed inset-0 z-[70]">
      <button
        aria-label="Закрити меню"
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
      />

      <aside className="absolute left-0 top-0 flex h-full w-[80%] max-w-xs flex-col overflow-y-auto border-r border-border bg-surface shadow-2xl animate-slide-in-left">
        <div className="flex items-center justify-between border-b border-border px-4 py-4">
          <Logo className="text-base" />
          <button
            onClick={onClose}
            aria-label="Закрити"
            className="flex h-9 w-9 items-center justify-center rounded-full text-text-muted transition hover:bg-surface-hover hover:text-text"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="flex gap-1.5 border-b border-border px-3 py-3">
          {CITIES.map((c) => (
            <button
              key={c.value}
              onClick={() => setCity(c.value)}
              className={`flex-1 rounded-full px-3 py-1.5 text-sm font-medium transition ${
                city === c.value
                  ? 'bg-primary text-black'
                  : 'bg-surface-raised text-text-muted hover:text-text'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        <nav className="flex flex-col gap-1 px-3 py-3">
          <button onClick={() => goToCategory('all')} className={`${menuLinkClass} text-left`}>
            Все меню
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c.value}
              onClick={() => goToCategory(c.value)}
              className={`${menuLinkClass} text-left`}
            >
              {c.label}
            </button>
          ))}
        </nav>

        <div className="mt-auto flex flex-col gap-1 border-t border-border px-3 py-3">
          {user && (
            <Link to="/orders" onClick={onClose} className={menuLinkClass}>
              Мої замовлення
            </Link>
          )}
          {isAdmin && (
            <Link to="/admin" onClick={onClose} className={menuLinkClass}>
              Адмін панель
            </Link>
          )}
          {user ? (
            <button
              onClick={() => {
                onClose()
                logout()
              }}
              className={`flex items-center gap-2 text-left ${menuLinkClass}`}
            >
              Вийти ({user.name})
              {user.discount > 0 && (
                <span className="rounded-full bg-accent/15 px-2 py-0.5 text-xs font-semibold text-accent">
                  −{user.discount}%
                </span>
              )}
            </button>
          ) : (
            <Link to="/login" onClick={onClose} className={menuLinkClass}>
              Увійти
            </Link>
          )}

          <div className="flex items-center gap-2 px-3 pt-2">
            <a
              href={SOCIAL_LINKS.instagram}
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-raised text-text-muted transition hover:text-text"
            >
              <InstagramIcon className="h-4.5 w-4.5" />
            </a>
            <a
              href={SOCIAL_LINKS.facebook}
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-raised text-text-muted transition hover:text-text"
            >
              <FacebookIcon className="h-4.5 w-4.5" />
            </a>
          </div>
        </div>
      </aside>
    </div>
  )
}

export const Header = () => {
  const { itemsCount, openDrawer } = useCart()
  const { user, isAdmin, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const isHome = location.pathname === '/'

  return (
    <>
      {isHome ? (
        <div className="pointer-events-none fixed inset-x-0 top-0 z-40 flex items-start justify-between p-4">
          <button
            onClick={() => setMenuOpen(true)}
            aria-label="Меню"
            className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full bg-black/50 text-text backdrop-blur-md transition hover:bg-black/70"
          >
            <MenuIcon className="h-5 w-5" />
          </button>

          {itemsCount > 0 && (
            <button
              onClick={openDrawer}
              aria-label="Відкрити кошик"
              className="pointer-events-auto relative flex h-11 w-11 items-center justify-center rounded-full bg-black/50 text-text backdrop-blur-md transition hover:bg-black/70"
            >
              <CartIcon className="h-5 w-5" />
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-xs font-bold text-black ring-2 ring-black">
                {itemsCount}
              </span>
            </button>
          )}
        </div>
      ) : (
        <header className="sticky top-0 z-40 border-b border-border bg-black/85 backdrop-blur-md">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
            <Link to="/" onClick={() => setMenuOpen(false)} className="shrink-0">
              <Logo className="text-lg" />
            </Link>

            <nav className="hidden items-center gap-6 sm:flex">
              {user && (
                <NavLink to="/orders" className={navLinkClass}>
                  Мої замовлення
                </NavLink>
              )}
              {isAdmin && (
                <NavLink to="/admin" className={navLinkClass}>
                  Адмін панель
                </NavLink>
              )}
              {user ? (
                <button
                  onClick={logout}
                  className="flex items-center gap-2 text-sm font-medium text-text-muted transition hover:text-text"
                >
                  Вийти ({user.name})
                  {user.discount > 0 && (
                    <span className="rounded-full bg-accent/15 px-2 py-0.5 text-xs font-semibold text-accent">
                      −{user.discount}%
                    </span>
                  )}
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
                onClick={() => setMenuOpen(true)}
                aria-label="Меню"
                className="flex h-10 w-10 items-center justify-center rounded-full text-text transition hover:bg-surface-hover sm:hidden"
              >
                <MenuIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </header>
      )}
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  )
}
