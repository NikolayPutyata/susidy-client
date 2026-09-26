import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../hooks/useCart.js'
import { useAuth } from '../hooks/useAuth.js'
import { useCity } from '../hooks/useCity.js'
import { getErrorMessage } from '../lib/errors.js'
import { LOCATIONS } from '../lib/constants.js'
import { AppleIcon, SpinnerIcon } from '../components/icons.jsx'
import { QuantityStepper } from '../components/QuantityStepper.jsx'
import { OrderTotal, useDiscountedTotal } from '../components/OrderTotal.jsx'

const Field = ({ label, children }) => (
  <div>
    <label className="mb-1.5 block text-sm text-text-muted">{label}</label>
    {children}
  </div>
)

const inputClass =
  'w-full rounded-xl border border-border bg-surface-raised px-4 py-2.5 text-text placeholder:text-text-subtle outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30'

const segmentButtonClass = (active) =>
  `flex-1 rounded-xl py-2.5 text-sm font-semibold transition ${
    active
      ? 'bg-primary text-black'
      : 'bg-surface-raised text-text-muted hover:text-text'
  }`

export const CheckoutPage = () => {
  const { items, total, checkout } = useCart()
  const { user } = useAuth()
  const { city, cityLabel } = useCity()
  const { discounted } = useDiscountedTotal(total)
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: user?.name || '',
    phoneNumber: user?.phoneNumber || '',
    fulfillment: 'delivery',
    street: '',
    building: '',
    apartment: '',
    isPrivateHouse: false,
    pickupAddress: '',
    cutlery: 1,
    details: '',
    noCallback: false,
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const pickupOptions = LOCATIONS.filter((l) => l.city === city)

  // Дефолтна точка самовивозу — перша для обраного міста, і перемикається
  // разом з ним, якщо юзер поміняв місто просто на цій сторінці.
  useEffect(() => {
    setForm((prev) =>
      pickupOptions.some((p) => p.address === prev.pickupAddress)
        ? prev
        : { ...prev, pickupAddress: pickupOptions[0]?.address || '' },
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [city])

  const handleChange = (e) => {
    const { name, type, checked, value } = e.target
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const order = await checkout({ ...form, city, paymentMethod: 'cod' })
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
      <h1 className="mb-4 text-center md:text-start text-2xl font-extrabold">
        Ваше замовлення, любий сусіде:
      </h1>

      <div className="mb-6 rounded-2xl border border-border bg-surface p-5">
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
        <div className="flex items-center justify-between rounded-xl bg-surface-raised px-4 py-2.5 text-sm">
          <span className="text-text-muted">Місто</span>
          <span className="font-semibold text-text">{cityLabel}</span>
        </div>

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

        <div>
          <label className="mb-1.5 block text-sm text-text-muted">Отримання</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setForm((prev) => ({ ...prev, fulfillment: 'delivery' }))}
              className={segmentButtonClass(form.fulfillment === 'delivery')}
            >
              Доставка
            </button>
            <button
              type="button"
              onClick={() => setForm((prev) => ({ ...prev, fulfillment: 'pickup' }))}
              className={segmentButtonClass(form.fulfillment === 'pickup')}
            >
              Самовивіз
            </button>
          </div>
        </div>

        {form.fulfillment === 'pickup' ? (
          <div>
            <label className="mb-1.5 block text-sm text-text-muted">
              Точка самовивозу
            </label>
            <div className="space-y-2">
              {pickupOptions.map((point) => (
                <label
                  key={point.id}
                  className={`flex cursor-pointer items-center gap-2.5 rounded-xl border px-4 py-2.5 text-sm transition ${
                    form.pickupAddress === point.address
                      ? 'border-primary bg-primary/10 text-text'
                      : 'border-border bg-surface-raised text-text-muted hover:text-text'
                  }`}
                >
                  <input
                    type="radio"
                    name="pickupAddress"
                    value={point.address}
                    checked={form.pickupAddress === point.address}
                    onChange={handleChange}
                    className="h-4 w-4 accent-primary"
                  />
                  {point.address}
                </label>
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Вулиця">
                <input
                  name="street"
                  value={form.street}
                  onChange={handleChange}
                  required
                  className={inputClass}
                />
              </Field>
              <Field label="Будинок">
                <input
                  name="building"
                  value={form.building}
                  onChange={handleChange}
                  required
                  className={inputClass}
                />
              </Field>
            </div>

            <label className="flex items-center gap-2 text-sm text-text-muted">
              <input
                type="checkbox"
                name="isPrivateHouse"
                checked={form.isPrivateHouse}
                onChange={handleChange}
                className="h-4 w-4 rounded border-border bg-surface-raised accent-primary"
              />
              Приватний будинок
            </label>

            {!form.isPrivateHouse && (
              <Field label="Квартира">
                <input
                  name="apartment"
                  value={form.apartment}
                  onChange={handleChange}
                  required
                  className={inputClass}
                />
              </Field>
            )}
          </>
        )}

        <div>
          <label className="mb-1.5 block text-sm text-text-muted">
            Кількість приборів
          </label>
          <QuantityStepper
            quantity={form.cutlery}
            onDecrease={() =>
              setForm((prev) => ({ ...prev, cutlery: Math.max(1, prev.cutlery - 1) }))
            }
            onIncrease={() =>
              setForm((prev) => ({ ...prev, cutlery: Math.min(10, prev.cutlery + 1) }))
            }
          />
        </div>

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

        <div className="grid grid-cols-1 gap-3 pt-1 sm:grid-cols-3">
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center justify-center gap-2 rounded-full bg-accent py-3 text-sm font-semibold text-black transition hover:bg-accent-light disabled:opacity-60"
          >
            {submitting && <SpinnerIcon className="h-4 w-4 animate-spin" />}
            {submitting ? 'Оформлюємо…' : `Сплачу при отриманні · ${discounted} ₴`}
          </button>

          <button
            type="button"
            disabled
            title="Незабаром"
            className="flex items-center justify-center gap-1.5 rounded-full bg-black py-3 text-sm font-semibold text-white opacity-60"
          >
            <AppleIcon className="h-4 w-4" />
            Pay
          </button>

          <button
            type="button"
            disabled
            title="Незабаром"
            className="flex items-center justify-center gap-1.5 rounded-full bg-[#6c5ce7] py-3 text-sm font-semibold text-white opacity-60"
          >
            WayForPay
          </button>
        </div>
        <p className="text-center text-xs text-text-subtle sm:text-right">
          Онлайн-оплата — незабаром
        </p>
      </form>
    </div>
  )
}
