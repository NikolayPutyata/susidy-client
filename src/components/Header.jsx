import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../hooks/useCart.js'
import { useAuth } from '../hooks/useAuth.js'
import { useCity } from '../hooks/useCity.js'
import { useModals } from '../hooks/useModals.js'
import { useBodyScrollLock } from '../hooks/useBodyScrollLock.js'
import { CATEGORIES, CITIES, SOCIAL_LINKS } from '../lib/constants.js'
import { Logo } from './Logo.jsx'
import { LanguageSwitcher } from './LanguageSwitcher.jsx'
import {
  CartIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  CloseIcon,
  FacebookIcon,
  HeartIcon,
  InstagramIcon,
  MapPinIcon,
  MenuIcon,
  SearchIcon,
  UserIcon,
} from './icons.jsx'

const iconButtonClass =
  'flex h-10 w-10 items-center justify-center rounded-full text-text transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60'

const menuLinkClass =
  'rounded-xl px-3.5 py-2 text-sm font-medium text-text-muted transition hover:bg-surface-hover hover:text-text'

// Замість миттєвого зникнення (яке виглядає як "мигання" сторінки під
// меню) — програємо анімацію закриття і розмонтовуємо тільки після неї.
// Має збігатися з тривалістю .animate-slide-out-left/.animate-fade-out-fast
// в index.css.
const CLOSE_ANIMATION_MS = 120

const MobileMenu = ({ open, onClose, onLoginClick }) => {
  const { t } = useTranslation()
  const { user, isAdmin, logout } = useAuth()
  const { city, setCity } = useCity()
  const { openProfile, openMyOrders } = useModals()
  const navigate = useNavigate()
  const [rendered, setRendered] = useState(open)
  const [closing, setClosing] = useState(false)

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
    navigate(value === 'all' ? '/' : `/category/${value}`)
  }

  return (
    <div className="fixed inset-0 z-[70]">
      <button
        aria-label={t('header.closeMenu')}
        onClick={onClose}
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm ${closing ? 'animate-fade-out-fast' : 'animate-fade-in'}`}
      />

      <aside
        className={`absolute left-0 top-0 flex h-full w-[80%] max-w-xs flex-col overflow-y-auto border-r border-border bg-surface shadow-2xl ${closing ? 'animate-slide-out-left' : 'animate-slide-in-left'}`}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-4">
          <Logo className="text-base" />
          <button
            onClick={onClose}
            aria-label={t('cart.close')}
            className="flex h-9 w-9 items-center justify-center rounded-full text-text-muted transition hover:bg-surface-hover hover:text-text"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="flex items-center gap-1.5 border-b border-border px-3 py-3">
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

        <nav className="flex flex-col gap-0.5 px-3 py-3">
          <button onClick={() => goToCategory('all')} className={`${menuLinkClass} text-left`}>
            {t('header.allMenu')}
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c.value}
              onClick={() => goToCategory(c.value)}
              className={`${menuLinkClass} text-left`}
            >
              {t(`categories.${c.value}`)}
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
              {t('header.myProfile')}
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
              {t('header.myOrders')}
            </button>
          )}
          {isAdmin && (
            <Link to="/admin" onClick={onClose} className={menuLinkClass}>
              {t('header.admin')}
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
              {t('header.logoutWithName', { name: user.name })}
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
              {t('header.login')}
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

// Search box inline in the header — always a text input (no icon-to-expand
// step), submitting routes to /?search=... (handled in CatalogPage.jsx).
// Desktop-only (sm:flex) — mobile search isn't in scope of this round.
const SearchBox = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [value, setValue] = useState('')

  const submit = (e) => {
    e.preventDefault()
    const trimmed = value.trim()
    if (!trimmed) return
    navigate(`/?search=${encodeURIComponent(trimmed)}`)
    setValue('')
  }

  return (
    <form onSubmit={submit} className="relative flex items-center">
      <SearchIcon className="pointer-events-none absolute left-4 h-4 w-4 text-text-subtle" />
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={t('header.searchPlaceholder')}
        className="h-10 w-44 rounded-full border border-border bg-surface pl-10 pr-4 text-sm text-text placeholder:text-text-subtle outline-none transition-all focus:w-60 focus:border-primary"
      />
    </form>
  )
}

// City picker as a proper dropdown — button shows the current city, click
// opens a small list of every city with the active one checked. Closes on
// selection, an outside click, or Escape. Desktop-only; the mobile side
// menu already lists both cities directly as a 2-button row.
const CityDropdown = () => {
  const { city, cityLabel, setCity } = useCity()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const onPointerDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    const onKeyDown = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  if (!city) return null

  return (
    <div ref={ref} className="relative hidden sm:block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium text-text transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
      >
        <MapPinIcon className="h-4 w-4 text-primary-light" />
        {cityLabel}
        <ChevronDownIcon
          className={`h-3.5 w-3.5 text-text-subtle transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute left-0 top-full z-10 mt-1.5 min-w-[9rem] overflow-hidden rounded-2xl border border-border bg-surface-raised py-1.5 shadow-xl"
        >
          {CITIES.map((c) => (
            <button
              key={c.value}
              type="button"
              role="option"
              aria-selected={city === c.value}
              onClick={() => {
                setCity(c.value)
                setOpen(false)
              }}
              className={`flex w-full items-center justify-between gap-3 px-4 py-2 text-sm transition ${
                city === c.value
                  ? 'text-primary-light'
                  : 'text-text-muted hover:bg-surface-hover hover:text-text'
              }`}
            >
              {c.label}
              {city === c.value && <CheckCircleIcon className="h-4 w-4" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export const Header = () => {
  const { t } = useTranslation()
  const { itemsCount, openDrawer } = useCart()
  const { user, isAuthenticated } = useAuth()
  const { openLogin, openProfile } = useModals()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-white/5 bg-black">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 px-4 py-3 sm:px-10 sm:py-4 md:px-16 lg:px-24">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setMenuOpen(true)}
              aria-label={t('header.menu')}
              className={iconButtonClass}
            >
              <MenuIcon className="h-5 w-5" />
            </button>

            <CityDropdown />
          </div>

          <Link to="/" aria-label={t('header.home')} className="justify-self-center">
            <Logo imgClassName="w-20 sm:w-24" />
          </Link>

          <div className="flex items-center justify-end gap-1.5">
            <LanguageSwitcher className="hidden h-8 lg:h-10 sm:inline-flex" />

            <div className="hidden sm:block">
              <SearchBox />
            </div>

            <button
              onClick={() => (isAuthenticated ? openProfile() : openLogin())}
              aria-label={t('product.addToFavorites')}
              className={`${iconButtonClass} hidden sm:flex`}
            >
              <HeartIcon
                filled={Boolean(user?.favorites?.length)}
                className={`h-5 w-5 ${user?.favorites?.length ? 'text-accent' : ''}`}
              />
            </button>

            <button
              onClick={() => (isAuthenticated ? openProfile() : openLogin())}
              aria-label={isAuthenticated ? t('header.myProfile') : t('header.login')}
              className={`${iconButtonClass} hidden sm:flex`}
            >
              <UserIcon className="h-5 w-5" />
            </button>

            {itemsCount > 0 && (
              <button
                onClick={openDrawer}
                aria-label={t('header.openCart')}
                className={`${iconButtonClass} relative`}
              >
                <CartIcon className="h-5 w-5" />
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-xs font-bold text-black ring-2 ring-black">
                  {itemsCount}
                </span>
              </button>
            )}
          </div>
        </div>
      </header>

      <MobileMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onLoginClick={openLogin}
      />
    </>
  )
}
