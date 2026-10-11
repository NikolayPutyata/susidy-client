import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { updateMyBirthday, updateMyProfile } from '../api/auth.js'
import { fetchAllProducts } from '../api/products.js'
import { useModals } from '../hooks/useModals.js'
import { FAVORITES_CATEGORY } from '../lib/constants.js'
import { getErrorMessage } from '../lib/errors.js'
import { selectUser, setUser } from '../store/userSlice.js'
import { ProductCard } from './ProductCard.jsx'
import { CloseIcon, HeartIcon, SpinnerIcon } from './icons.jsx'

const inputClass =
  'w-full rounded-xl border border-border bg-surface-raised px-4 py-2.5 text-text placeholder:text-text-subtle outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30'

const todayIso = () => new Date().toISOString().slice(0, 10)

export const ProfileModal = () => {
  const dispatch = useDispatch()
  const user = useSelector(selectUser)
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

  const favorites = favoriteProducts.filter((p) => user.favorites?.includes(p._id))

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4 animate-fade-in">
      <div className="relative flex max-h-[85vh] w-full max-w-2xl flex-col rounded-3xl border border-border bg-surface p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Мій профіль</h2>
          <button
            onClick={closeProfile}
            aria-label="Закрити"
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
                placeholder="Ім'я"
                required
                minLength={3}
                className={inputClass}
              />
              <select
                value={form.city}
                onChange={(e) => setForm((prev) => ({ ...prev, city: e.target.value }))}
                className={inputClass}
              >
                <option value="">Місто (необов'язково)</option>
                <option value="Kyiv">Київ</option>
                <option value="Kharkiv">Харків</option>
              </select>

              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-text-muted">
                  Ваша знижка:{' '}
                  <span className="font-semibold text-accent">{user.discount || 0}%</span>
                </p>
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-black transition hover:bg-primary-light disabled:opacity-60"
                >
                  {savingProfile && <SpinnerIcon className="h-3.5 w-3.5 animate-spin" />}
                  Зберегти
                </button>
              </div>
              {profileError && <p className="text-sm text-accent">{profileError}</p>}
            </form>
          </div>

          <div className="mb-4 rounded-2xl border border-border bg-surface-raised p-4">
            {user.birthday ? (
              <p className="text-sm text-text-muted">
                День народження:{' '}
                <span className="font-medium text-text">
                  {new Date(user.birthday).toLocaleDateString('uk-UA')}
                </span>
              </p>
            ) : (
              <form onSubmit={handleSaveBirthday} className="flex flex-wrap items-end gap-2">
                <div>
                  <label className="mb-1 block text-sm text-text-muted">
                    День народження (необов'язково, вказати можна лише раз)
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
                  Зберегти
                </button>
              </form>
            )}
            {birthdayError && <p className="mt-2 text-sm text-accent">{birthdayError}</p>}
          </div>

          <button
            onClick={handleGoToMyOrders}
            className="mb-4 w-full rounded-2xl bg-surface-raised px-4 py-3 text-left font-medium text-text transition hover:bg-surface-hover"
          >
            Мої замовлення →
          </button>

          <div>
            <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold uppercase tracking-widest text-primary-light">
              <HeartIcon filled className="h-4 w-4" />
              {FAVORITES_CATEGORY.label}
            </h3>

            {favoritesError && (
              <p className="mb-3 rounded-xl border border-accent/30 bg-accent/10 px-4 py-3 text-accent">
                {favoritesError}
              </p>
            )}

            {favoritesLoading ? (
              <p className="py-6 text-center text-text-muted">Завантаження…</p>
            ) : favorites.length === 0 ? (
              <p className="py-6 text-center text-text-muted">
                У вас поки немає улюблених позицій.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {favorites.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
