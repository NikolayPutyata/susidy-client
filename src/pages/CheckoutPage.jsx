import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { getErrorMessage } from '../lib/errors.js'

export const CheckoutPage = () => {
  const { cart, total, checkout } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: user?.name || '',
    phoneNumber: user?.phoneNumber || '',
    delivery: '',
    details: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const items = cart?.items || []

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const order = await checkout(form)
      navigate('/order/success', { state: { order } })
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  if (items.length === 0) {
    return <p className="text-center text-neutral-500">Кошик порожній.</p>
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-4 text-2xl font-semibold">Оформлення замовлення</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm text-neutral-600">Ім'я</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-neutral-300 px-3 py-2"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-neutral-600">
            Телефон (10 цифр)
          </label>
          <input
            name="phoneNumber"
            value={form.phoneNumber}
            onChange={handleChange}
            required
            pattern="[0-9]{10}"
            placeholder="0991234567"
            className="w-full rounded-lg border border-neutral-300 px-3 py-2"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-neutral-600">
            Адреса доставки
          </label>
          <input
            name="delivery"
            value={form.delivery}
            onChange={handleChange}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-neutral-600">
            Коментар до замовлення
          </label>
          <textarea
            name="details"
            value={form.details}
            onChange={handleChange}
            rows={3}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2"
          />
        </div>

        {error && <p className="text-rose-600">{error}</p>}

        <div className="flex items-center justify-between pt-2">
          <span className="text-lg font-semibold">Разом: {total} грн</span>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-full bg-neutral-900 px-5 py-2 text-white disabled:opacity-50"
          >
            {submitting ? 'Оформлюємо…' : 'Підтвердити замовлення'}
          </button>
        </div>
      </form>
    </div>
  )
}
