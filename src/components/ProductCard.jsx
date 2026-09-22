import { useState } from 'react'
import { useCart } from '../hooks/useCart.js'
import { CATEGORY_LABELS } from '../lib/constants.js'
import { getErrorMessage } from '../lib/errors.js'
import { QuantityStepper } from './QuantityStepper.jsx'
import { SpinnerIcon } from './icons.jsx'

export const ProductCard = ({ product }) => {
  const { addItem, updateItem, removeItem, getItemQuantity } = useCart()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const quantity = getItemQuantity(product._id)

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
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-surface transition hover:border-border-strong">
      <div className="relative aspect-square bg-black">
        {product.images?.[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-contain transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-text-subtle">
            <span className="text-3xl">🍣</span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 p-4">
        <span className="text-xs font-medium uppercase tracking-wide text-primary-light">
          {CATEGORY_LABELS[product.category] || product.category}
        </span>
        <h3 className="font-semibold text-text">{product.name}</h3>
        {product.description && (
          <p className="line-clamp-2 text-sm text-text-muted">
            {product.description}
          </p>
        )}

        <div className="mt-3 flex items-center justify-between gap-2">
          <span className="text-lg font-extrabold text-accent">
            {product.priceKiev} ₴
          </span>

          {quantity === 0 ? (
            <button
              onClick={() => withBusy(() => addItem(product, 1))}
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
