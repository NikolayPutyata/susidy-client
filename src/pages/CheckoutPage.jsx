import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { APILoadingStatus, useApiLoadingStatus } from '@vis.gl/react-google-maps'
import { addMySavedAddress } from '../api/auth.js'
import { useCart } from '../hooks/useCart.js'
import { useAuth } from '../hooks/useAuth.js'
import { useCity } from '../hooks/useCity.js'
import { getErrorMessage } from '../lib/errors.js'
import { LOCATIONS, TIME_SLOTS } from '../lib/constants.js'
import { setUser } from '../store/userSlice.js'
import { CheckCircleIcon, CloseIcon, SpinnerIcon } from '../components/icons.jsx'
import { DeliveryAddressFields } from '../components/DeliveryAddressFields.jsx'
import { QuantityStepper } from '../components/QuantityStepper.jsx'
import { PaymentMethodModal } from '../components/PaymentMethodModal.jsx'
import { OrderTotal, useDiscountedTotal } from '../components/OrderTotal.jsx'
import { TotalWeight } from '../components/TotalWeight.jsx'
import { getAmountToFreeDelivery, getDeliveryFee } from '../lib/pricing.js'
import { getChargeableQuantity } from '../lib/addons.js'

const addressExtrasLabel = (addr, t) =>
  addr.isPrivateHouse
    ? t('checkout.privateHouse')
    : [
        addr.apartment ? t('checkout.apartmentShort', { value: addr.apartment }) : null,
        addr.entrance ? t('checkout.entranceShort', { value: addr.entrance }) : null,
        addr.floor ? t('checkout.floorShort', { value: addr.floor }) : null,
      ]
        .filter(Boolean)
        .join(', ')

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

const initialForm = (user) => ({
  name: user?.name || '',
  phoneNumber: user?.phoneNumber || '',
  fulfillment: 'delivery',
  street: '',
  building: '',
  deliveryLat: null,
  deliveryLng: null,
  formattedAddress: '',
  apartment: '',
  entrance: '',
  floor: '',
  isPrivateHouse: false,
  pickupPointId: '',
  requestedTime: 'asap',
  cutlery: 1,
  details: '',
  noCallback: false,
})

// Staff need at least 45 minutes' notice before a requested slot — filters
// out anything earlier than that from "now", so the select only ever shows
// times that are actually bookable.
const getAvailableTimeSlots = () => {
  const cutoff = new Date(Date.now() + 45 * 60 * 1000)
  const cutoffMinutes = cutoff.getHours() * 60 + cutoff.getMinutes()
  return TIME_SLOTS.filter((slot) => {
    const [hours, minutes] = slot.split(':').map(Number)
    return hours * 60 + minutes >= cutoffMinutes
  })
}

export const CheckoutPage = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { items, total, checkout, repriceError } = useCart()
  const { user, isAuthenticated } = useAuth()
  const { city, cityLabel, retryReprice } = useCity()
  const { discount, discounted } = useDiscountedTotal(total)
  const [form, setForm] = useState(() => initialForm(user))
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [paymentModalOpen, setPaymentModalOpen] = useState(false)
  const [orderResult, setOrderResult] = useState(null)
  const [cashAmount, setCashAmount] = useState('')

  const deliveryFee = getDeliveryFee(items, form.fulfillment, discount)
  const amountToFreeDelivery = getAmountToFreeDelivery(items, form.fulfillment, discount)
  const finalTotal = discounted + deliveryFee
  const cashAmountNumber = cashAmount === '' ? null : Number(cashAmount)
  const cashAmountTooLow = cashAmountNumber !== null && cashAmountNumber < finalTotal
  const mapsLoaded = useApiLoadingStatus() === APILoadingStatus.LOADED
  const [availableTimeSlots] = useState(getAvailableTimeSlots)
  const [selectedSavedAddressId, setSelectedSavedAddressId] = useState(null)
  const [saveNewAddress, setSaveNewAddress] = useState(false)

  const pickupOptions = LOCATIONS.filter((l) => l.city === city)
  // Memoized so the auto-select-default effect below only re-runs when the
  // underlying list actually changes (new city, address added/removed) —
  // otherwise a new array from this filter on every render would re-fire
  // that effect on every render too, stomping over the customer's own
  // choice of "Нова адреса" right after they made it.
  const savedAddressesForCity = useMemo(
    () => (user?.savedAddresses || []).filter((a) => a.city === city),
    [user?.savedAddresses, city],
  )

  // Сторінка монтується заново щоразу, коли на неї переходять — форма вже
  // чиста за замовчуванням, тож це лише підставляє поточного юзера.
  useEffect(() => {
    setForm(initialForm(user))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Дефолтна точка самовивозу — перша для обраного міста, і перемикається
  // разом з ним.
  useEffect(() => {
    setForm((prev) =>
      pickupOptions.some((p) => p.id === prev.pickupPointId)
        ? prev
        : { ...prev, pickupPointId: pickupOptions[0]?.id || '' },
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [city])

  // A delivery address (manual, map-picked, or a selected saved one)
  // belongs to one specific city — switching city mid-checkout (the header
  // switcher works from any page, checkout included) used to leave the old
  // city's address sitting in the form untouched, which could reach the
  // server as e.g. Kyiv coordinates with city: 'kharkiv'. Dropping it the
  // same way pickupPointId already resets above keeps the two in sync.
  const isFirstCityRender = useRef(true)
  useEffect(() => {
    if (isFirstCityRender.current) {
      isFirstCityRender.current = false
      return
    }
    clearSavedAddressSelection()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [city])

  const applySavedAddress = (addr) => {
    setSelectedSavedAddressId(addr._id)
    setForm((prev) => ({
      ...prev,
      street: addr.street,
      building: addr.building || '',
      apartment: addr.apartment || '',
      entrance: addr.entrance || '',
      floor: addr.floor || '',
      isPrivateHouse: addr.isPrivateHouse || false,
      deliveryLat: addr.lat ?? null,
      deliveryLng: addr.lng ?? null,
      formattedAddress: addr.formattedAddress || '',
    }))
  }

  // Першу ж збережену адресу для поточного міста підставляємо сама —
  // зручніше, ніж змушувати щоразу вибирати вручну, а список лишається
  // доступним, якщо треба іншу.
  useEffect(() => {
    if (selectedSavedAddressId || form.fulfillment !== 'delivery') return
    const defaultAddress =
      savedAddressesForCity.find((a) => a.isDefault) || savedAddressesForCity[0]
    if (defaultAddress) applySavedAddress(defaultAddress)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedAddressesForCity, form.fulfillment])

  const clearSavedAddressSelection = () => {
    setSelectedSavedAddressId(null)
    setForm((prev) => ({
      ...prev,
      street: '',
      building: '',
      apartment: '',
      entrance: '',
      floor: '',
      isPrivateHouse: false,
      deliveryLat: null,
      deliveryLng: null,
      formattedAddress: '',
    }))
  }

  const handleChange = (e) => {
    const { name, type, checked, value } = e.target
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // The address picker's input isn't a native <input required> (it's a
    // Google web component), so it needs its own submit-time check —
    // without this, a delivery order could go out with no address at all.
    if (form.fulfillment === 'delivery' && mapsLoaded && form.deliveryLat == null) {
      setError(t('checkout.addressRequired'))
      return
    }

    // The cart can be sitting on stale (previous-city) prices if the last
    // reprice attempt failed — never let an order go out at the wrong
    // price silently.
    if (repriceError) {
      setError(t('checkout.repriceErrorBlocking'))
      return
    }

    // The time <select> is replaced with a plain message once there's
    // nothing left to pick for pickup today — requestedTime can be stuck
    // at '' in that state, which the server would reject anyway, but a
    // clear message here beats a generic "Data is not valid" round trip.
    if (form.fulfillment === 'pickup' && availableTimeSlots.length === 0) {
      setError(t('checkout.noPickupSlotsToday'))
      return
    }

    if (cashAmountTooLow) {
      setError(t('checkout.cashTooLowSubmit', { value: finalTotal }))
      return
    }

    setSubmitting(true)
    setError('')
    try {
      const pickupPoint = pickupOptions.find((p) => p.id === form.pickupPointId)
      const order = await checkout({
        ...form,
        city,
        paymentMethod: 'cod',
        cashAmount: cashAmountNumber ?? undefined,
        pickupAddress: pickupPoint?.address || '',
      })
      setOrderResult(order)

      // Best-effort — a failure here shouldn't taint an otherwise
      // successful order, so it's silent rather than surfaced as an error.
      if (
        saveNewAddress &&
        !selectedSavedAddressId &&
        form.fulfillment === 'delivery' &&
        isAuthenticated
      ) {
        addMySavedAddress({
          city,
          street: form.street,
          building: form.building,
          apartment: form.apartment,
          entrance: form.entrance,
          floor: form.floor,
          isPrivateHouse: form.isPrivateHouse,
          lat: form.deliveryLat,
          lng: form.deliveryLng,
          formattedAddress: form.formattedAddress,
        })
          .then((updatedUser) => dispatch(setUser(updatedUser)))
          .catch((err) => console.error('Failed to save address', err))
      }
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    // No side padding on mobile (full-bleed, rounded-none/border-0 card —
    // avoids double side-insets stacking an outer gutter with the card's
    // own p-4, which left fields narrower than they needed to be on a
    // phone screen); sm:px-4 reintroduces an outer gutter once the card
    // stops being full-bleed.
    <div className="mx-auto w-full max-w-2xl sm:px-4">
      <div className="flex flex-col rounded-none border-0 bg-surface p-4 sm:rounded-3xl sm:border sm:border-border sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">
            {orderResult ? t('checkout.titleDone') : t('checkout.title')}
          </h2>
          <button
            onClick={() => navigate('/')}
            aria-label={t('header.home')}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-text-muted transition hover:bg-surface-hover hover:text-text"
          >
            <CloseIcon className="h-4.5 w-4.5" />
          </button>
        </div>

        <div>
          {orderResult ? (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/15 text-primary-light">
                <CheckCircleIcon className="h-9 w-9" />
              </div>
              <p className="mb-6 text-text-muted">{t('checkout.thankYou')}</p>

              <div className="rounded-2xl border border-border bg-surface-raised p-5 text-left">
                <p className="mb-3 font-semibold">
                  {t('checkout.orderNumber', { number: orderResult._id.slice(-6).toUpperCase() })}
                </p>
                <ul className="mb-3 divide-y divide-border">
                  {orderResult.items.map((item) => (
                    <li
                      key={item.product_id}
                      className="flex justify-between py-1.5 text-sm text-text-muted"
                    >
                      <span>
                        {item.productName} × {item.quantity}
                      </span>
                      <span className="text-text">
                        {item.price * getChargeableQuantity(item)} ₴
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="space-y-1.5 border-t border-border pt-3">
                  {orderResult.deliveryFee > 0 && (
                    <div className="flex items-center justify-between text-sm text-text-muted">
                      <span>{t('cart.delivery')}</span>
                      <span>{orderResult.deliveryFee} ₴</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-text-muted">{t('cart.total')}</span>
                    <span className="text-xl font-extrabold text-accent">
                      {orderResult.total} ₴
                    </span>
                  </div>
                  {orderResult.cashAmount > 0 && (
                    <p className="text-sm text-text-muted">
                      {t('checkout.cashPaid', {
                        amount: orderResult.cashAmount,
                        change: Math.round((orderResult.cashAmount - orderResult.total) * 100) / 100,
                      })}
                    </p>
                  )}
                </div>
              </div>

              <button
                onClick={() => navigate('/')}
                className="mt-6 inline-block rounded-full bg-primary px-5 py-2 font-semibold text-black transition hover:bg-primary-light"
              >
                {t('checkout.backToMenu')}
              </button>
            </div>
          ) : items.length === 0 ? (
            <p className="py-16 text-center text-text-muted">{t('checkout.emptyCart')}</p>
          ) : (
            <>
              <div className="mb-6 rounded-2xl border border-border bg-surface-raised p-5">
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
                        {item.addonType && item.freeQuantity > 0 && (
                          <span className="ml-1.5 rounded-full bg-primary/15 px-1.5 py-0.5 text-xs font-semibold text-primary-light">
                            {t('product.freeBadge', { count: Math.min(item.freeQuantity, item.quantity) })}
                          </span>
                        )}
                      </span>
                      <span className="shrink-0 text-text">
                        {item.price * getChargeableQuantity(item)} ₴
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="border-t border-border pt-3 space-y-2">
                  <TotalWeight items={items} />
                  <OrderTotal
                    total={total}
                    size="lg"
                    deliveryFee={form.fulfillment === 'delivery' ? deliveryFee : null}
                  />
                  {form.fulfillment === 'delivery' && amountToFreeDelivery > 0 && (
                    <p className="text-xs text-text-subtle">
                      {t('checkout.freeDeliveryHint', { value: amountToFreeDelivery })}
                    </p>
                  )}
                </div>
                {repriceError && (
                  <p className="rounded-xl bg-accent/10 px-4 py-2.5 text-sm text-accent">
                    {t('cart.repriceError')}{' '}
                    <button
                      type="button"
                      onClick={retryReprice}
                      className="underline underline-offset-2"
                    >
                      {t('common.tryAgain')}
                    </button>
                  </p>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex items-center justify-between rounded-xl bg-surface-raised px-4 py-2.5 text-sm">
                  <span className="text-text-muted">{t('checkout.city')}</span>
                  <span className="font-semibold text-text">{cityLabel}</span>
                </div>

                <Field label={t('checkout.name')}>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    className={inputClass}
                  />
                </Field>

                <Field label={t('checkout.phone')}>
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
                  <label className="mb-1.5 block text-sm text-text-muted">{t('checkout.fulfillment')}</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, fulfillment: 'delivery' }))}
                      className={segmentButtonClass(form.fulfillment === 'delivery')}
                    >
                      {t('checkout.delivery')}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          fulfillment: 'pickup',
                          requestedTime:
                            prev.requestedTime === 'asap'
                              ? availableTimeSlots[0] || ''
                              : prev.requestedTime,
                        }))
                      }
                      className={segmentButtonClass(form.fulfillment === 'pickup')}
                    >
                      {t('checkout.pickup')}
                    </button>
                  </div>
                </div>

                <Field label={form.fulfillment === 'pickup' ? t('checkout.pickupTime') : t('checkout.deliveryTime')}>
                  {form.fulfillment === 'pickup' && availableTimeSlots.length === 0 ? (
                    <p className="rounded-xl border border-border bg-surface-raised px-4 py-2.5 text-sm text-text-muted">
                      {t('checkout.noPickupSlotsToday')}
                    </p>
                  ) : (
                    <select
                      name="requestedTime"
                      value={form.requestedTime}
                      onChange={handleChange}
                      required
                      className={inputClass}
                    >
                      {form.fulfillment === 'delivery' && (
                        <option value="asap">{t('checkout.asap')}</option>
                      )}
                      {availableTimeSlots.map((slot) => (
                        <option key={slot} value={slot}>
                          {slot}
                        </option>
                      ))}
                    </select>
                  )}
                </Field>

                {form.fulfillment === 'pickup' ? (
                  <div>
                    <label className="mb-1.5 block text-sm text-text-muted">
                      {t('checkout.pickupPoint')}
                    </label>
                    <div className="space-y-2">
                      {pickupOptions.map((point) => (
                        <label
                          key={point.id}
                          className={`flex cursor-pointer items-center gap-2.5 rounded-xl border px-4 py-2.5 text-sm transition ${
                            form.pickupPointId === point.id
                              ? 'border-primary bg-primary/10 text-text'
                              : 'border-border bg-surface-raised text-text-muted hover:text-text'
                          }`}
                        >
                          <input
                            type="radio"
                            name="pickupPointId"
                            value={point.id}
                            checked={form.pickupPointId === point.id}
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
                    {savedAddressesForCity.length > 0 && (
                      // No section label here — AddressPicker shows its own
                      // "Адреса доставки" below once "Нова адреса" is
                      // picked, and a saved one is self-explanatory either
                      // way.
                      <div>
                        <div className="space-y-2">
                          {savedAddressesForCity.map((addr) => (
                            <label
                              key={addr._id}
                              className={`flex cursor-pointer items-center gap-2.5 rounded-xl border px-4 py-2.5 text-sm transition ${
                                selectedSavedAddressId === addr._id
                                  ? 'border-primary bg-primary/10 text-text'
                                  : 'border-border bg-surface-raised text-text-muted hover:text-text'
                              }`}
                            >
                              <input
                                type="radio"
                                name="savedAddress"
                                checked={selectedSavedAddressId === addr._id}
                                onChange={() => applySavedAddress(addr)}
                                className="h-4 w-4 shrink-0 accent-primary"
                              />
                              <span className="min-w-0 flex-1">
                                <span className="flex items-center gap-1.5">
                                  <span className="truncate">
                                    {addr.formattedAddress || addr.street}
                                  </span>
                                  {addr.isDefault && (
                                    <span className="shrink-0 rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold text-primary-light">
                                      {t('checkout.defaultAddress')}
                                    </span>
                                  )}
                                </span>
                                {addressExtrasLabel(addr, t) && (
                                  <span className="block truncate text-xs text-text-subtle">
                                    {addressExtrasLabel(addr, t)}
                                  </span>
                                )}
                              </span>
                            </label>
                          ))}
                          <label
                            className={`flex cursor-pointer items-center gap-2.5 rounded-xl border px-4 py-2.5 text-sm transition ${
                              selectedSavedAddressId === null
                                ? 'border-primary bg-primary/10 text-text'
                                : 'border-border bg-surface-raised text-text-muted hover:text-text'
                            }`}
                          >
                            <input
                              type="radio"
                              name="savedAddress"
                              checked={selectedSavedAddressId === null}
                              onChange={clearSavedAddressSelection}
                              className="h-4 w-4 accent-primary"
                            />
                            {t('checkout.newAddress')}
                          </label>
                        </div>
                      </div>
                    )}

                    {!selectedSavedAddressId && (
                      <>
                        <DeliveryAddressFields
                          city={city}
                          mapsLoaded={mapsLoaded}
                          value={form}
                          onChange={(patch) => setForm((prev) => ({ ...prev, ...patch }))}
                        />
                        {isAuthenticated && savedAddressesForCity.length < 3 && (
                          <label className="flex items-center gap-2 text-sm text-text-muted">
                            <input
                              type="checkbox"
                              checked={saveNewAddress}
                              onChange={(e) => setSaveNewAddress(e.target.checked)}
                              className="h-4 w-4 rounded border-border bg-surface-raised accent-primary"
                            />
                            {t('checkout.saveThisAddress')}
                          </label>
                        )}
                      </>
                    )}
                  </>
                )}

                <div>
                  <label className="mb-1.5 block text-sm text-text-muted">
                    {t('checkout.cutlery')}
                  </label>
                  <QuantityStepper
                    quantity={form.cutlery}
                    onDecrease={() =>
                      setForm((prev) => ({ ...prev, cutlery: Math.max(1, prev.cutlery - 1) }))
                    }
                    onIncrease={() =>
                      setForm((prev) => ({ ...prev, cutlery: Math.min(20, prev.cutlery + 1) }))
                    }
                  />
                </div>

                <Field label={t('checkout.comment')}>
                  <textarea
                    name="details"
                    value={form.details}
                    onChange={handleChange}
                    rows={3}
                    placeholder={t('checkout.commentPlaceholder')}
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
                  {t('checkout.noCallback')}
                </label>

                <div className="space-y-2 rounded-xl border border-border bg-surface-raised px-4 py-3">
                  <label className="block text-sm text-text-muted">
                    {t('checkout.cashLabel')}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      step="1"
                      value={cashAmount}
                      onChange={(e) => setCashAmount(e.target.value)}
                      placeholder={t('checkout.cashPlaceholder', { value: Math.ceil(finalTotal / 100) * 100 })}
                      className={`${inputClass} flex-1`}
                    />
                    {cashAmount !== '' && (
                      <button
                        type="button"
                        onClick={() => setCashAmount('')}
                        className="shrink-0 whitespace-nowrap rounded-xl px-3 py-2.5 text-sm text-text-muted underline underline-offset-2 hover:text-text"
                      >
                        {t('checkout.cashNoChange')}
                      </button>
                    )}
                  </div>
                  {cashAmountNumber !== null && (
                    <p className={`text-sm ${cashAmountTooLow ? 'text-accent' : 'text-text-muted'}`}>
                      {cashAmountTooLow
                        ? t('checkout.cashTooLow', { value: finalTotal })
                        : t('checkout.change', { value: Math.round((cashAmountNumber - finalTotal) * 100) / 100 })}
                    </p>
                  )}
                </div>

                {error && <p className="text-accent">{error}</p>}

                <div className="grid grid-cols-1 gap-3 pt-1 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setPaymentModalOpen(true)}
                    className="flex items-center justify-center gap-2 rounded-full bg-accent py-3 text-sm font-semibold text-black transition hover:bg-accent-light"
                  >
                    {t('checkout.payOnline', { value: finalTotal })}
                  </button>

                  <button
                    type="submit"
                    disabled={submitting || cashAmountTooLow}
                    className="flex items-center justify-center gap-2 rounded-full border border-border bg-surface-raised py-3 text-sm font-semibold text-text transition hover:bg-surface-hover disabled:opacity-40"
                  >
                    {submitting && <SpinnerIcon className="h-4 w-4 animate-spin" />}
                    {submitting ? t('checkout.submitting') : t('checkout.payCod')}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>

      <PaymentMethodModal open={paymentModalOpen} onClose={() => setPaymentModalOpen(false)} />
    </div>
  )
}
