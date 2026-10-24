import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { addMyFavorite, removeMyFavorite } from '../api/auth.js'
import { useCart } from '../hooks/useCart.js'
import { useCity } from '../hooks/useCity.js'
import { useModals } from '../hooks/useModals.js'
import { getErrorMessage } from '../lib/errors.js'
import { getProductDescription, getProductName } from '../lib/productI18n.js'
import { selectIsAuthenticated, selectUser, setUser } from '../store/userSlice.js'
import { QuantityStepper } from './QuantityStepper.jsx'
import { ProductDetailModal } from './ProductDetailModal.jsx'
import { HeartIcon, SpinnerIcon } from './icons.jsx'

export const ProductCard = ({ product }) => {
  const { t, i18n } = useTranslation()
  const dispatch = useDispatch()
  const user = useSelector(selectUser)
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const { openLogin } = useModals()
  const { addItem, updateItem, removeItem, getItemQuantity } = useCart()
  const { getPrice } = useCity()
  const [busy, setBusy] = useState(false)
  const [favoriteBusy, setFavoriteBusy] = useState(false)
  const [error, setError] = useState('')
  const [detailOpen, setDetailOpen] = useState(false)

  const quantity = getItemQuantity(product._id)
  const price = getPrice(product)
  const isFavorite = Boolean(user?.favorites?.includes(product._id))

  const toggleFavorite = async () => {
    if (!isAuthenticated) {
      openLogin()
      return
    }

    setFavoriteBusy(true)
    try {
      const updated = isFavorite
        ? await removeMyFavorite(product._id)
        : await addMyFavorite(product._id)
      dispatch(setUser(updated))
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setFavoriteBusy(false)
    }
  }

  const withBusy = async (action) => {
    setBusy(true)
    setError('')
    try {
      await action()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  const decreaseQuantity = () =>
    withBusy(() =>
      quantity <= 1 ? removeItem(product._id) : updateItem(product._id, quantity - 1),
    )
  const increaseQuantity = () => withBusy(() => updateItem(product._id, quantity + 1))

  return (
    <>
      <div
        onClick={() => setDetailOpen(true)}
        className="group flex cursor-pointer flex-col overflow-hidden rounded-3xl bg-surface transition hover:bg-surface-hover"
      >
        <div className="relative aspect-[4/3] bg-black">
          <button
            onClick={(e) => {
              e.stopPropagation()
              toggleFavorite()
            }}
            disabled={favoriteBusy}
            aria-label={isFavorite ? t('product.removeFromFavorites') : t('product.addToFavorites')}
            className="absolute left-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-text backdrop-blur-sm transition hover:bg-black/70 disabled:opacity-60"
          >
            <HeartIcon
              filled={isFavorite}
              className={`h-4.5 w-4.5 ${isFavorite ? 'text-accent' : 'text-text'}`}
            />
          </button>
          {product.images?.[0] ? (
            <img
              src={product.images[0]}
              alt={getProductName(product, i18n.language)}
              loading="lazy"
              className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-text-subtle">
              <span className="text-3xl">🍣</span>
            </div>
          )}
          {product.weight > 0 && (
            <span className="absolute right-2 top-2 rounded-full bg-black/70 px-2 py-0.5 text-xs font-medium text-text backdrop-blur-sm">
              {t('product.weight', { value: product.weight })}
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-1 p-3">
          {/* Fixed 2-line height regardless of whether the name wraps or
              not — otherwise cards in the same row end up different
              heights depending on title length. */}
          <h3 className="line-clamp-2 min-h-[2.5rem] font-semibold text-text">
            {getProductName(product, i18n.language)}
          </h3>
          <p className="line-clamp-2 min-h-[2.5rem] text-sm text-text-muted">
            {getProductDescription(product, i18n.language)}
          </p>

          <div
            className="mt-2 sm:mx-2 sm:my-2 flex items-center justify-between gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="text-lg md:text-xl font-extrabold text-accent">{price} ₴</span>

            {quantity === 0 ? (
              <button
                onClick={() => withBusy(() => addItem(product, 1, price))}
                disabled={busy}
                className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-black transition hover:bg-primary-light disabled:opacity-60"
              >
                {busy && <SpinnerIcon className="h-3.5 w-3.5 animate-spin" />}
                {t('product.addToCart')}
              </button>
            ) : (
              <QuantityStepper
                size="sm"
                quantity={quantity}
                disabled={busy}
                onDecrease={decreaseQuantity}
                onIncrease={increaseQuantity}
              />
            )}
          </div>

          {error && <p className="text-xs text-accent">{error}</p>}
        </div>
      </div>

      <ProductDetailModal
        product={product}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        price={price}
        quantity={quantity}
        busy={busy}
        onAdd={() => withBusy(() => addItem(product, 1, price))}
        onDecrease={decreaseQuantity}
        onIncrease={increaseQuantity}
      />
    </>
  )
}
