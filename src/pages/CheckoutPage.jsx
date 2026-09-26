import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../hooks/useCart.js'
import { useAuth } from '../hooks/useAuth.js'
import { getErrorMessage } from '../lib/errors.js'
import { SpinnerIcon } from '../components/icons.jsx'
import { OrderTotal, useDiscountedTotal } from '../components/OrderTotal.jsx'

const Field = ({ label, children }) => (
  <div>
    <label className="mb-1.5 block text-sm text-text-muted">{label}</label>
    {children}
  </div>
)

const inputClass =
  'w-full rounded-xl border border-border bg-surface-raised px-4 py-2.5 text-text placeholder:text-text-subtle outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30'

export const CheckoutPage = () => {
  const { items, total, checkout } = useCart()
  const { user } = useAuth()
  const { discounted } = useDiscountedTotal(total)
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: user?.name || '',
    phoneNumber: user?.phoneNumber || '',
    delivery: '',
    details: '',
    noCallback: false,
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, type, checked, value } = e.target
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const order = await checkout({ ...form, paymentMethod: 'cod' })
      navigate('/order/success', { state: { order } })
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  if (items.length === 0) {
    return <p className="py-16 text-center text-text-muted">Кошик порожній.</p>
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-4 text-2xl font-extrabold">Оформлення замовлення</h1>

      <div className="mb-6 rounded-2xl border border-border bg-surface p-5">
        <p className="mb-3 font-semibold">Ваше замовлення</p>
        <ul className="mb-3 space-y-1.5 divide-y divide-border text-sm">
          {items.map((item) => (
            <li
              key={item.product_id}
              className="flex items-center gap-3 py-1.5 text-text-muted"
            >
              <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-black">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.productName}
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sm">
                    🍣
                  </div>
                )}
              </div>
              <span className="min-w-0 flex-1 truncate">
                {item.productName} × {item.quantity}
              </span>
              <span className="shrink-0 text-text">
                {item.price * item.quantity} ₴
              </span>
            </li>
          ))}
        </ul>
        <div className="border-t border-border pt-3">
          <OrderTotal total={total} size="lg" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-border bg-surface p-5">
        <Field label="Ім'я">
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className={inputClass}
          />
        </Field>

        <Field label="Телефон (10 цифр)">
          <input
            name="phoneNumber"
            value={form.phoneNumber}
            onChange={handleChange}
            required
            pattern="[0-9]{10}"
            placeholder="0991234567"
            className={inputClass}
          />
        </Field>

        <Field label="Адреса доставки">
          <input
            name="delivery"
            value={form.delivery}
            onChange={handleChange}
            placeholder="Вулиця, будинок, квартира"
            className={inputClass}
          />
        </Field>

        <Field label="Коментар до замовлення">
          <textarea
            name="details"
            value={form.details}
            onChange={handleChange}
            rows={3}
            placeholder="Наприклад: без імбиру, зателефонувати заздалегідь"
            className={inputClass}
          />
        </Field>

        <label className="flex items-center gap-2 text-sm text-text-muted">
          <input
            type="checkbox"
            name="noCallback"
            checked={form.noCallback}
            onChange={handleChange}
            className="h-4 w-4 rounded border-border bg-surface-raised accent-primary"
          />
          Не передзвонювати мені
        </label>

        {error && <p className="text-accent">{error}</p>}

        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            type="button"
            disabled
            title="Незабаром"
            className="flex items-center justify-center gap-2 rounded-full border border-border bg-surface-raised py-3 font-semibold text-text-subtle opacity-60"
          >
            Оплатити онлайн
            <span className="text-xs">(Незабаром)</span>
          </button>

          <button
            type="submit"
            disabled={submitting}
            className="flex items-center justify-center gap-2 rounded-full bg-accent py-3 font-semibold text-black transition hover:bg-accent-light disabled:opacity-60"
          >
            {submitting && <SpinnerIcon className="h-4 w-4 animate-spin" />}
            {submitting ? 'Оформлюємо…' : `Сплачу при отриманні · ${discounted} ₴`}
          </button>
        </div>
      </form>
    </div>
  )
}
