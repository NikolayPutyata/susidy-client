import { useState } from 'react'
import { useCart } from '../hooks/useCart.js'
import { useCity } from '../hooks/useCity.js'
import { getErrorMessage } from '../lib/errors.js'
import { QuantityStepper } from './QuantityStepper.jsx'
import { SpinnerIcon } from './icons.jsx'

export const ProductCard = ({ product }) => {
  const { addItem, updateItem, removeItem, getItemQuantity } = useCart()
  const { getPrice } = useCity()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const quantity = getItemQuantity(product._id)
  const price = getPrice(product)

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

  return (
    <div className="group flex flex-col overflow-hidden rounded-3xl bg-surface transition hover:bg-surface-hover">
      <div className="relative aspect-[4/5] bg-black">
        {product.images?.[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
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
            {product.weight} г
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3">
        <h3 className="font-semibold text-text">{product.name}</h3>
        <p className="line-clamp-2 min-h-[2.5rem] text-sm text-text-muted">
          {product.description || ''}
        </p>

        <div className="mt-2 flex items-center justify-between gap-2">
          <span className="text-lg font-extrabold text-accent">{price} ₴</span>

          {quantity === 0 ? (
            <button
              onClick={() => withBusy(() => addItem(product, 1, price))}
              disabled={busy}
              className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-black transition hover:bg-primary-light disabled:opacity-60"
            >
              {busy && <SpinnerIcon className="h-3.5 w-3.5 animate-spin" />}
              В кошик
            </button>
          ) : (
            <QuantityStepper
              size="sm"
              quantity={quantity}
              disabled={busy}
              onDecrease={() =>
                withBusy(() =>
                  quantity <= 1
                    ? removeItem(product._id)
                    : updateItem(product._id, quantity - 1),
                )
              }
              onIncrease={() => withBusy(() => updateItem(product._id, quantity + 1))}
            />
          )}
        </div>

        {error && <p className="text-xs text-accent">{error}</p>}
      </div>
    </div>
  )
}
