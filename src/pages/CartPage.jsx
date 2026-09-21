import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useCart } from '../context/CartContext.jsx'
import { getErrorMessage } from '../lib/errors.js'

export const CartPage = () => {
  const { cart, loading, updateItem, removeItem, total } = useCart()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState(null)

  const items = cart?.items || []

  const handleQuantityChange = async (productId, quantity) => {
    if (quantity < 1) return
    setBusyId(productId)
    setError('')
    try {
      await updateItem(productId, quantity)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setBusyId(null)
    }
  }

  const handleRemove = async (productId) => {
    setBusyId(productId)
    setError('')
    try {
      await removeItem(productId)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setBusyId(null)
    }
  }

  if (loading) {
    return <p className="text-center text-neutral-500">Завантаження кошика…</p>
  }

  if (items.length === 0) {
    return (
      <div className="text-center text-neutral-500">
        <p>Кошик порожній.</p>
        <Link to="/" className="mt-2 inline-block text-neutral-900 underline">
          Перейти до меню
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-4 text-2xl font-semibold">Кошик</h1>

      {error && <p className="mb-4 text-rose-600">{error}</p>}

      <ul className="divide-y divide-neutral-200 rounded-2xl border border-neutral-200 bg-white">
        {items.map((item) => (
          <li
            key={item.product_id}
            className="flex items-center justify-between gap-4 p-4"
          >
            <div>
              <p className="font-medium">{item.productName}</p>
              <p className="text-sm text-neutral-500">{item.price} грн / шт</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={busyId === item.product_id}
                onClick={() =>
                  handleQuantityChange(item.product_id, item.quantity - 1)
                }
                className="h-7 w-7 rounded-full bg-neutral-200 disabled:opacity-50"
              >
                −
              </button>
              <span className="w-6 text-center">{item.quantity}</span>
              <button
                disabled={busyId === item.product_id}
                onClick={() =>
                  handleQuantityChange(item.product_id, item.quantity + 1)
                }
                className="h-7 w-7 rounded-full bg-neutral-200 disabled:opacity-50"
              >
                +
              </button>
              <button
                disabled={busyId === item.product_id}
                onClick={() => handleRemove(item.product_id)}
                className="ml-2 text-sm text-rose-600 disabled:opacity-50"
              >
                Прибрати
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex items-center justify-between">
        <span className="text-lg font-semibold">Разом: {total} грн</span>
        <button
          onClick={() => navigate('/checkout')}
          className="rounded-full bg-neutral-900 px-5 py-2 text-white"
        >
          Оформити замовлення
        </button>
      </div>
    </div>
  )
}
