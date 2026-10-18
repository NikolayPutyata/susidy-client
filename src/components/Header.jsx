import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../hooks/useCart.js'
import { useAuth } from '../hooks/useAuth.js'
import { useCity } from '../hooks/useCity.js'
import { useModals } from '../hooks/useModals.js'
import { useBodyScrollLock } from '../hooks/useBodyScrollLock.js'
import { CATEGORIES, CITIES, SOCIAL_LINKS } from '../lib/constants.js'
import { Logo } from './Logo.jsx'
import {
  CartIcon,
  CloseIcon,
  FacebookIcon,
  HeartIcon,
  InstagramIcon,
  MapPinIcon,
  MenuIcon,
  SearchIcon,
  UserIcon,
} from './icons.jsx'

const floatingButtonClass =
  'pointer-events-auto flex h-11 items-center justify-center rounded-full bg-black/50 text-text backdrop-blur-md transition hover:bg-black/70'

const menuLinkClass =
  'rounded-xl px-3.5 py-2.5 text-sm font-medium text-text-muted transition hover:bg-surface-hover hover:text-text'

// Замість миттєвого зникнення (яке виглядає як "мигання" сторінки під
// меню) — програємо анімацію закриття і розмонтовуємо тільки після неї.
const CLOSE_ANIMATION_MS = 200

const MobileMenu = ({ open, onClose, onLoginClick }) => {
  const { user, isAdmin, logout } = useAuth()
  const { city, setCity } = useCity()
  const { openProfile, openMyOrders } = useModals()
  const navigate = useNavigate()
  const [rendered, setRendered] = useState(open)
  const [closing, setClosing] = useState(false)
  const [searchValue, setSearchValue] = useState('')

  const submitSearch = (e) => {
    e.preventDefault()
    const trimmed = searchValue.trim()
    if (!trimmed) return
    onClose()
    navigate(`/?search=${encodeURIComponent(trimmed)}`)
  }

  useEffect(() => {
    if (open) {
      setRendered(true)
      setClosing(false)
      return
    }
    if (!rendered) return
    setClosing(true)
    const timeout = setTimeout(() => {
      setRendered(false)
      setClosing(false)
    }, CLOSE_ANIMATION_MS)
    return () => clearTimeout(timeout)
  }, [open, rendered])

  useBodyScrollLock(rendered)

  useEffect(() => {
    if (!rendered) return
    const onKeyDown = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [rendered, onClose])

  if (!rendered) return null

  const goToCategory = (value) => {
    onClose()
    navigate(value === 'all' ? '/' : `/?category=${value}`)
  }

  return (
    <div className="fixed inset-0 z-[70]">
      <button
        aria-label="Закрити меню"
        onClick={onClose}
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm ${closing ? 'animate-fade-out' : 'animate-fade-in'}`}
      />

      <aside
        className={`absolute left-0 top-0 flex h-full w-[80%] max-w-xs flex-col overflow-y-auto border-r border-border bg-surface shadow-2xl ${closing ? 'animate-slide-out-left' : 'animate-slide-in-left'}`}
      >
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

        <form
          onSubmit={submitSearch}
          className="flex items-center gap-2 border-b border-border px-3 py-3"
        >
          <SearchIcon className="h-4.5 w-4.5 shrink-0 text-text-subtle" />
          <input
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Пошук страв…"
            className="w-full bg-transparent text-sm text-text placeholder:text-text-subtle outline-none"
          />
        </form>

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
            <button
              onClick={() => {
                onClose()
                openProfile()
              }}
              className={`text-left ${menuLinkClass}`}
            >
              Мій профіль
            </button>
          )}
          {user && (
            <button
              onClick={() => {
                onClose()
                openMyOrders()
              }}
              className={`text-left ${menuLinkClass}`}
            >
              Мої замовлення
            </button>
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
            <button
              onClick={() => {
                onClose()
                onLoginClick()
              }}
              className={`text-left ${menuLinkClass}`}
            >
              Увійти
            </button>
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

// Search box inline in the floating header — always a text input (no
// icon-to-expand step), submitting routes to /?search=... the same way a
// category click routes to /?category=... (handled in CatalogPage.jsx).
// Desktop-only (sm:flex) — mobile search isn't in scope of this round,
// same as before.
const SearchBox = () => {
  const navigate = useNavigate()
  const [value, setValue] = useState('')

  const submit = (e) => {
    e.preventDefault()
    const trimmed = value.trim()
    if (!trimmed) return
    navigate(`/?search=${encodeURIComponent(trimmed)}`)
  }

  return (
    <form onSubmit={submit} className="pointer-events-auto relative flex items-center">
      <SearchIcon className="pointer-events-none absolute left-4 h-4 w-4 text-text-subtle" />
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Пошук страв…"
        className="h-11 w-48 rounded-full border border-border-strong bg-black/60 pl-10 pr-4 text-sm text-text placeholder:text-text-subtle outline-none backdrop-blur-md transition-all focus:w-64 focus:border-primary"
      />
    </form>
  )
}

export const Header = () => {
  const { itemsCount, openDrawer } = useCart()
  const { user, isAuthenticated } = useAuth()
  const { city, cityLabel, setCity } = useCity()
  const { openLogin, openProfile } = useModals()
  const [menuOpen, setMenuOpen] = useState(false)

  const otherCity = CITIES.find((c) => c.value !== city) || CITIES[0]

  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 top-0 z-40 flex items-start justify-between gap-2 p-4 sm:px-10 md:px-16 lg:px-24">
        <Link
          to="/"
          aria-label="На головну"
          className="pointer-events-auto absolute left-1/2 top-3 -translate-x-1/2 sm:top-4"
        >
          <Logo imgClassName="w-20 sm:w-28" />
        </Link>

        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={() => setMenuOpen(true)}
            aria-label="Меню"
            className={`${floatingButtonClass} w-11`}
          >
            <MenuIcon className="h-5 w-5" />
          </button>

          {city && (
            <button
              onClick={() => setCity(otherCity.value)}
              className={`${floatingButtonClass} hidden gap-1.5 px-4 text-sm font-medium sm:flex`}
            >
              <MapPinIcon className="h-4 w-4 text-primary-light" />
              {cityLabel}
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 mt-2">
          <div className="hidden sm:block">
            <SearchBox />
          </div>

          <button
            onClick={() => (isAuthenticated ? openProfile() : openLogin())}
            aria-label="Улюблене"
            className={`${floatingButtonClass} hidden w-11 sm:flex`}
          >
            <HeartIcon
              filled={Boolean(user?.favorites?.length)}
              className={`h-5 w-5 ${user?.favorites?.length ? 'text-accent' : ''}`}
            />
          </button>

          <button
            onClick={() => (isAuthenticated ? openProfile() : openLogin())}
            aria-label={isAuthenticated ? 'Мій профіль' : 'Увійти'}
            className={`${floatingButtonClass} hidden w-11 sm:flex`}
          >
            <UserIcon className="h-5 w-5" />
          </button>

          {itemsCount > 0 && (
            <button
              onClick={openDrawer}
              aria-label="Відкрити кошик"
              className={`${floatingButtonClass} relative w-11`}
            >
              <CartIcon className="h-5 w-5" />
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-xs font-bold text-black ring-2 ring-black">
                {itemsCount}
              </span>
            </button>
          )}
        </div>
      </div>

      <MobileMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onLoginClick={openLogin}
      />
    </>
  )
}
