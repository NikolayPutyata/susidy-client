import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../hooks/useCart.js'
import { useAuth } from '../hooks/useAuth.js'
import { getErrorMessage } from '../lib/errors.js'
import { SpinnerIcon } from '../components/icons.jsx'

const Field = ({ label, children }) => (
  <div>
    <label className="mb-1.5 block text-sm text-text-muted">{label}</label>
    {children}
  </div>
)

const inputClass =
  'w-full rounded-xl border border-border bg-surface-raised px-4 py-2.5 text-text placeholder:text-text-subtle outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30'

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
    return <p className="py-16 text-center text-text-muted">Кошик порожній.</p>
  }

  return (
    <div className="mx-auto grid max-w-3xl gap-6 lg:max-w-4xl lg:grid-cols-[1fr_280px]">
      <div>
        <h1 className="mb-4 text-2xl font-extrabold">Оформлення замовлення</h1>

        <form
          id="checkout-form"
          onSubmit={handleSubmit}
          className="space-y-4 rounded-2xl border border-border bg-surface p-5"
        >
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

          {error && <p className="text-accent">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-accent py-3 font-semibold text-black transition hover:bg-accent-light disabled:opacity-60 lg:hidden"
          >
            {submitting && <SpinnerIcon className="h-4 w-4 animate-spin" />}
            {submitting ? 'Оформлюємо…' : `Підтвердити замовлення · ${total} ₴`}
          </button>
        </form>
      </div>

      <div className="hidden h-fit rounded-2xl border border-border bg-surface p-5 lg:sticky lg:top-24 lg:block">
        <p className="mb-3 font-semibold">Ваше замовлення</p>
        <ul className="mb-3 space-y-1.5 divide-y divide-border text-sm">
          {items.map((item) => (
            <li
              key={item.product_id}
              className="flex justify-between gap-2 py-1.5 text-text-muted"
            >
              <span className="truncate">
                {item.productName} × {item.quantity}
              </span>
              <span className="shrink-0 text-text">
                {item.price * item.quantity} ₴
              </span>
            </li>
          ))}
        </ul>
        <div className="flex items-center justify-between border-t border-border pt-3">
          <span className="text-text-muted">Разом</span>
          <span className="text-2xl font-extrabold">{total} ₴</span>
        </div>
        <button
          type="submit"
          form="checkout-form"
          disabled={submitting}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-accent py-3 font-semibold text-black transition hover:bg-accent-light disabled:opacity-60"
        >
          {submitting && <SpinnerIcon className="h-4 w-4 animate-spin" />}
          {submitting ? 'Оформлюємо…' : 'Підтвердити замовлення'}
        </button>
      </div>
    </div>
  )
}
