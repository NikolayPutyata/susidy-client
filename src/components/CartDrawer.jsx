import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../hooks/useCart.js'
import { CartItemsList } from './CartItemsList.jsx'
import { CartIcon, CloseIcon } from './icons.jsx'
import { OrderTotal } from './OrderTotal.jsx'

export const CartDrawer = () => {
  const { items, loading, isDrawerOpen, closeDrawer, total } = useCart()
  const navigate = useNavigate()
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isDrawerOpen) return
    const onKeyDown = (e) => e.key === 'Escape' && closeDrawer()
    document.addEventListener('keydown', onKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
    }
  }, [isDrawerOpen, closeDrawer])

  if (!isDrawerOpen) return null

  const goToCheckout = () => {
    closeDrawer()
    navigate('/checkout')
  }

  return (
    <div className="fixed inset-0 z-50">
      <button
        aria-label="Закрити кошик"
        onClick={closeDrawer}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in"
      />

      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-border bg-surface shadow-2xl animate-slide-in-right">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <CartIcon className="h-5 w-5 text-accent" />
            Кошик
          </h2>
          <button
            onClick={closeDrawer}
            aria-label="Закрити"
            className="flex h-9 w-9 items-center justify-center rounded-full text-text-muted transition hover:bg-surface-hover hover:text-text"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5">
          {loading && (
            <p className="py-8 text-center text-text-muted">Завантаження…</p>
          )}

          {!loading && items.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center gap-3 py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-raised">
                <CartIcon className="h-7 w-7 text-text-subtle" />
              </div>
              <p className="text-text-muted">Кошик поки порожній</p>
              <button
                onClick={closeDrawer}
                className="text-sm text-primary-light underline underline-offset-4"
              >
                Обрати щось смачненьке
              </button>
            </div>
          )}

          {!loading && items.length > 0 && <CartItemsList onError={setError} />}
        </div>

        {items.length > 0 && (
          <div className="space-y-3 border-t border-border px-5 py-4">
            {error && <p className="text-sm text-accent">{error}</p>}
            <OrderTotal total={total} />
            <button
              onClick={goToCheckout}
              className="w-full rounded-full bg-accent py-3 text-center font-semibold text-black transition hover:bg-accent-light"
            >
              Оформити замовлення
            </button>
          </div>
        )}
      </aside>
    </div>
  )
}
