import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { APILoadingStatus, useApiLoadingStatus } from '@vis.gl/react-google-maps'
import {
  addMySavedAddress,
  removeMyFavorite,
  removeMySavedAddress,
  setMyDefaultSavedAddress,
  updateMyBirthday,
  updateMyProfile,
} from '../api/auth.js'
import { fetchAllProducts } from '../api/products.js'
import { useCity } from '../hooks/useCity.js'
import { useModals } from '../hooks/useModals.js'
import { useBodyScrollLock } from '../hooks/useBodyScrollLock.js'
import { CITY_LABELS } from '../lib/constants.js'
import { getErrorMessage } from '../lib/errors.js'
import { selectUser, setUser } from '../store/userSlice.js'
import { getProductName } from '../lib/productI18n.js'
import { DeliveryAddressFields } from './DeliveryAddressFields.jsx'
import { CloseIcon, HeartIcon, MapPinIcon, PlusIcon, SpinnerIcon, TrashIcon } from './icons.jsx'

const inputClass =
  'w-full rounded-xl border border-border bg-surface-raised px-4 py-2.5 text-text placeholder:text-text-subtle outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30'

const todayIso = () => new Date().toISOString().slice(0, 10)

const emptyNewAddress = {
  city: 'kyiv',
  street: '',
  building: '',
  deliveryLat: null,
  deliveryLng: null,
  formattedAddress: '',
  apartment: '',
  entrance: '',
  floor: '',
  isPrivateHouse: false,
}

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

export const ProfileModal = () => {
  const { t, i18n } = useTranslation()
  const dispatch = useDispatch()
  const user = useSelector(selectUser)
  const { getPrice } = useCity()
  const { profileOpen: open, closeProfile, openMyOrders } = useModals()

  const [form, setForm] = useState({ name: '', city: '' })
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileError, setProfileError] = useState('')

  const [birthdayInput, setBirthdayInput] = useState('')
  const [savingBirthday, setSavingBirthday] = useState(false)
  const [birthdayError, setBirthdayError] = useState('')

  const [favoriteProducts, setFavoriteProducts] = useState([])
  const [favoritesLoading, setFavoritesLoading] = useState(true)
  const [favoritesError, setFavoritesError] = useState('')
  const [favoriteBusyId, setFavoriteBusyId] = useState(null)

  const mapsLoaded = useApiLoadingStatus() === APILoadingStatus.LOADED
  const [addingAddress, setAddingAddress] = useState(false)
  const [newAddress, setNewAddress] = useState(emptyNewAddress)
  const [savingAddress, setSavingAddress] = useState(false)
  const [addressError, setAddressError] = useState('')
  const [addressBusyId, setAddressBusyId] = useState(null)

  useEffect(() => {
    if (!open || !user) return
    setForm({ name: user.name || '', city: user.city || '' })
    setProfileError('')
    setBirthdayError('')
  }, [open, user])

  useEffect(() => {
    if (!open) return
    setFavoritesLoading(true)
    setFavoritesError('')
    fetchAllProducts()
      .then(setFavoriteProducts)
      .catch((err) => setFavoritesError(getErrorMessage(err)))
      .finally(() => setFavoritesLoading(false))
  }, [open])

  useBodyScrollLock(open && Boolean(user))

  if (!open || !user) return null

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setSavingProfile(true)
    setProfileError('')
    try {
      const updated = await updateMyProfile(form)
      dispatch(setUser(updated))
    } catch (err) {
      setProfileError(getErrorMessage(err))
    } finally {
      setSavingProfile(false)
    }
  }

  const handleSaveBirthday = async (e) => {
    e.preventDefault()
    if (!birthdayInput) return

    setSavingBirthday(true)
    setBirthdayError('')
    try {
      const updated = await updateMyBirthday(birthdayInput)
      dispatch(setUser(updated))
    } catch (err) {
      setBirthdayError(getErrorMessage(err))
    } finally {
      setSavingBirthday(false)
    }
  }

  const handleGoToMyOrders = () => {
    closeProfile()
    openMyOrders()
  }

  const handleRemoveFavorite = async (productId) => {
    setFavoriteBusyId(productId)
    setFavoritesError('')
    try {
      const updated = await removeMyFavorite(productId)
      dispatch(setUser(updated))
    } catch (err) {
      setFavoritesError(getErrorMessage(err))
    } finally {
      setFavoriteBusyId(null)
    }
  }

  const handleAddAddress = async (e) => {
    e.preventDefault()

    // Same gap as CheckoutPage's delivery form — the Places web component
    // isn't a native <input required>.
    if (mapsLoaded && newAddress.deliveryLat == null) {
      setAddressError(t('profile.addressRequired'))
      return
    }

    setSavingAddress(true)
    setAddressError('')
    try {
      const updated = await addMySavedAddress({
        city: newAddress.city,
        street: newAddress.street,
        building: newAddress.building,
        apartment: newAddress.apartment,
        entrance: newAddress.entrance,
        floor: newAddress.floor,
        isPrivateHouse: newAddress.isPrivateHouse,
        lat: newAddress.deliveryLat,
        lng: newAddress.deliveryLng,
        formattedAddress: newAddress.formattedAddress,
      })
      dispatch(setUser(updated))
      setNewAddress(emptyNewAddress)
      setAddingAddress(false)
    } catch (err) {
      setAddressError(getErrorMessage(err))
    } finally {
      setSavingAddress(false)
    }
  }

  const handleRemoveAddress = async (addressId) => {
    setAddressBusyId(addressId)
    setAddressError('')
    try {
      const updated = await removeMySavedAddress(addressId)
      dispatch(setUser(updated))
    } catch (err) {
      setAddressError(getErrorMessage(err))
    } finally {
      setAddressBusyId(null)
    }
  }

  const handleSetDefaultAddress = async (addressId) => {
    setAddressBusyId(addressId)
    setAddressError('')
    try {
      const updated = await setMyDefaultSavedAddress(addressId)
      dispatch(setUser(updated))
    } catch (err) {
      setAddressError(getErrorMessage(err))
    } finally {
      setAddressBusyId(null)
    }
  }

  const favorites = favoriteProducts.filter((p) => user.favorites?.includes(p._id))
  const savedAddresses = user.savedAddresses || []

  return (
    // Full-screen sheet on mobile (no outer gutter, square corners, no
    // border) — same reasoning as CheckoutPage: an outer inset stacked with
    // the card's own padding left fields narrower than they needed to be on
    // a phone screen. From sm: up it reverts to a centered dialog.
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in sm:px-4">
      <div className="relative flex h-full w-full flex-col rounded-none border-0 bg-surface p-4 sm:h-auto sm:max-h-[85vh] sm:max-w-2xl sm:rounded-3xl sm:border sm:border-border sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">{t('profile.title')}</h2>
          <button
            onClick={closeProfile}
            aria-label={t('cart.close')}
            className="flex h-8 w-8 items-center justify-center rounded-full text-text-muted transition hover:bg-surface-hover hover:text-text"
          >
            <CloseIcon className="h-4.5 w-4.5" />
          </button>
        </div>

        <div className="overflow-y-auto">
          <div className="mb-4 rounded-2xl border border-border bg-surface-raised p-4">
            <form onSubmit={handleProfileSubmit} className="space-y-3">
              <input
                name="name"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder={t('auth.name')}
                required
                minLength={3}
                className={inputClass}
              />
              <select
                value={form.city}
                onChange={(e) => setForm((prev) => ({ ...prev, city: e.target.value }))}
                className={inputClass}
              >
                <option value="">{t('auth.cityOptional')}</option>
                <option value="Kyiv">{t('auth.cityKyiv')}</option>
                <option value="Kharkiv">{t('auth.cityKharkiv')}</option>
              </select>

              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-text-muted">
                  {t('profile.discount')}{' '}
                  <span className="font-semibold text-accent">{user.discount || 0}%</span>
                </p>
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-black transition hover:bg-primary-light disabled:opacity-60"
                >
                  {savingProfile && <SpinnerIcon className="h-3.5 w-3.5 animate-spin" />}
                  {t('common.save')}
                </button>
              </div>
              {profileError && <p className="text-sm text-accent">{profileError}</p>}
            </form>
          </div>

          <div className="mb-4 rounded-2xl border border-border bg-surface-raised p-4">
            {user.birthday ? (
              <p className="text-sm text-text-muted">
                {t('profile.birthday')}{' '}
                <span className="font-medium text-text">
                  {new Date(user.birthday).toLocaleDateString(
                    i18n.language === 'en' ? 'en-US' : 'uk-UA',
                  )}
                </span>
              </p>
            ) : (
              <form onSubmit={handleSaveBirthday} className="flex flex-wrap items-end gap-2">
                <div>
                  <label className="mb-1 block text-sm text-text-muted">
                    {t('profile.birthdayOptional')}
                  </label>
                  <input
                    type="date"
                    value={birthdayInput}
                    onChange={(e) => setBirthdayInput(e.target.value)}
                    max={todayIso()}
                    className="rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!birthdayInput || savingBirthday}
                  className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-black transition hover:bg-primary-light disabled:opacity-60"
                >
                  {savingBirthday && <SpinnerIcon className="h-3.5 w-3.5 animate-spin" />}
                  {t('common.save')}
                </button>
              </form>
            )}
            {birthdayError && <p className="mt-2 text-sm text-accent">{birthdayError}</p>}
          </div>

          <button
            onClick={handleGoToMyOrders}
            className="mb-4 w-full rounded-2xl bg-surface-raised px-4 py-3 text-left font-medium text-text transition hover:bg-surface-hover"
          >
            {t('profile.myOrdersLink')}
          </button>

          <div className="mb-4">
            <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold uppercase tracking-widest text-primary-light">
              <MapPinIcon className="h-4 w-4" />
              {t('profile.savedAddresses')}
            </h3>

            {addressError && (
              <p className="mb-3 rounded-xl border border-accent/30 bg-accent/10 px-4 py-3 text-accent">
                {addressError}
              </p>
            )}

            {savedAddresses.length > 0 && (
              <ul className="mb-3 space-y-2">
                {savedAddresses.map((addr) => (
                  <li
                    key={addr._id}
                    className="flex items-start gap-3 rounded-2xl border border-border bg-surface-raised px-4 py-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-1.5 text-sm text-text">
                        <span className="truncate">{addr.formattedAddress || addr.street}</span>
                        {addr.isDefault && (
                          <span className="shrink-0 rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold text-primary-light">
                            {t('checkout.defaultAddress')}
                          </span>
                        )}
                      </p>
                      <p className="truncate text-xs text-text-subtle">
                        {CITY_LABELS[addr.city] || addr.city}
                        {addressExtrasLabel(addr, t) ? ` · ${addressExtrasLabel(addr, t)}` : ''}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      {!addr.isDefault && (
                        <button
                          type="button"
                          onClick={() => handleSetDefaultAddress(addr._id)}
                          disabled={addressBusyId === addr._id}
                          className="text-xs text-primary-light underline underline-offset-2 disabled:opacity-40"
                        >
                          {t('profile.makeDefault')}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveAddress(addr._id)}
                        disabled={addressBusyId === addr._id}
                        aria-label={t('profile.removeAddress')}
                        className="text-accent transition hover:opacity-70 disabled:opacity-40"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {addingAddress ? (
              <form
                onSubmit={handleAddAddress}
                className="space-y-3 rounded-2xl border border-border bg-surface-raised p-4"
              >
                <select
                  value={newAddress.city}
                  onChange={(e) =>
                    setNewAddress((prev) => ({ ...prev, city: e.target.value }))
                  }
                  className={inputClass}
                >
                  <option value="kyiv">{t('auth.cityKyiv')}</option>
                  <option value="kharkiv">{t('auth.cityKharkiv')}</option>
                </select>
                <DeliveryAddressFields
                  city={newAddress.city}
                  mapsLoaded={mapsLoaded}
                  value={newAddress}
                  onChange={(patch) => setNewAddress((prev) => ({ ...prev, ...patch }))}
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={savingAddress}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-black transition hover:bg-primary-light disabled:opacity-60"
                  >
                    {savingAddress && <SpinnerIcon className="h-3.5 w-3.5 animate-spin" />}
                    {t('profile.saveAddress')}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAddingAddress(false)
                      setNewAddress(emptyNewAddress)
                      setAddressError('')
                    }}
                    className="rounded-xl bg-surface px-4 py-2 text-sm font-medium text-text-muted transition hover:text-text"
                  >
                    {t('common.cancel')}
                  </button>
                </div>
              </form>
            ) : savedAddresses.length < 3 ? (
              <button
                type="button"
                onClick={() => setAddingAddress(true)}
                className="flex w-full items-center justify-center gap-1.5 rounded-2xl border border-dashed border-border-strong px-4 py-3 text-sm text-text-muted transition hover:border-primary hover:text-text"
              >
                <PlusIcon className="h-4 w-4" />
                {t('profile.addAddress')}
              </button>
            ) : (
              <p className="text-xs text-text-subtle">{t('profile.maxAddresses')}</p>
            )}
          </div>

          <div>
            <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold uppercase tracking-widest text-primary-light">
              <HeartIcon filled className="h-4 w-4" />
              {t('categories.favorites')}
            </h3>

            {favoritesError && (
              <p className="mb-3 rounded-xl border border-accent/30 bg-accent/10 px-4 py-3 text-accent">
                {favoritesError}
              </p>
            )}

            {favoritesLoading ? (
              <p className="py-6 text-center text-text-muted">{t('common.loading')}</p>
            ) : favorites.length === 0 ? (
              <p className="py-6 text-center text-text-muted">{t('profile.noFavorites')}</p>
            ) : (
              <ul className="divide-y divide-border rounded-2xl border border-border bg-surface-raised px-4">
                {favorites.map((product) => (
                  <li key={product._id} className="flex items-center gap-3 py-2.5">
                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-black">
                      {product.images?.[0] ? (
                        <img
                          src={product.images[0]}
                          alt={getProductName(product, i18n.language)}
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-sm">
                          🍣
                        </div>
                      )}
                    </div>
                    <span className="min-w-0 flex-1 truncate text-sm text-text">
                      {getProductName(product, i18n.language)}
                    </span>
                    <span className="shrink-0 text-sm text-text-muted">
                      {getPrice(product)} ₴
                    </span>
                    <button
                      onClick={() => handleRemoveFavorite(product._id)}
                      disabled={favoriteBusyId === product._id}
                      aria-label={t('product.removeFromFavorites')}
                      className="shrink-0 text-accent transition hover:opacity-70 disabled:opacity-40"
                    >
                      <HeartIcon filled className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
