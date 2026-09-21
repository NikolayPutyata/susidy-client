import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useCart } from '../context/CartContext.jsx'
import { CartItemsList } from '../components/CartItemsList.jsx'
import { CartIcon } from '../components/icons.jsx'

export const CartPage = () => {
  const { cart, loading, total } = useCart()
  const navigate = useNavigate()
  const [error, setError] = useState('')

  const items = cart?.items || []

  if (loading) {
    return <p className="py-16 text-center text-text-muted">Завантаження кошика…</p>
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-20 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface">
          <CartIcon className="h-7 w-7 text-text-subtle" />
        </div>
        <p className="text-text-muted">Кошик порожній.</p>
        <Link
          to="/"
          className="rounded-full bg-primary px-5 py-2 font-semibold text-black transition hover:bg-primary-light"
        >
          Перейти до меню
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto grid max-w-3xl gap-6 lg:max-w-4xl lg:grid-cols-[1fr_280px]">
      <div>
        <h1 className="mb-4 text-2xl font-extrabold">Кошик</h1>
        {error && <p className="mb-4 text-accent">{error}</p>}
        <div className="rounded-2xl border border-border bg-surface px-5">
          <CartItemsList onError={setError} />
        </div>
      </div>

      <div className="h-fit rounded-2xl border border-border bg-surface p-5 lg:sticky lg:top-24">
        <div className="flex items-center justify-between text-text-muted">
          <span>Разом</span>
          <span className="text-2xl font-extrabold text-text">{total} ₴</span>
        </div>
        <button
          onClick={() => navigate('/checkout')}
          className="mt-4 w-full rounded-full bg-accent py-3 font-semibold text-black transition hover:bg-accent-light"
        >
          Оформити замовлення
        </button>
      </div>
    </div>
  )
}
