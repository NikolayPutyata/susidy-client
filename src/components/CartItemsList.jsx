import { useState } from 'react'
import { useCart } from '../hooks/useCart.js'
import { getErrorMessage } from '../lib/errors.js'
import { QuantityStepper } from './QuantityStepper.jsx'
import { TrashIcon } from './icons.jsx'

export const CartItemsList = ({ onError, showImage = false }) => {
  const { items, updateItem, removeItem } = useCart()
  const [busyId, setBusyId] = useState(null)

  const run = async (productId, action) => {
    setBusyId(productId)
    onError?.('')
    try {
      await action()
    } catch (err) {
      onError?.(getErrorMessage(err))
    } finally {
      setBusyId(null)
    }
  }

  return (
    <ul className="divide-y divide-border">
      {items.map((item) => (
        <li key={item.product_id} className="flex items-center gap-3 py-4">
          {showImage && (
            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-black">
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.productName}
                  className="h-full w-full object-contain"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-lg">
                  🍣
                </div>
              )}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-text">{item.productName}</p>
            <p className="text-sm text-text-muted">{item.price} грн / шт</p>
          </div>

          <QuantityStepper
            size="sm"
            quantity={item.quantity}
            disabled={busyId === item.product_id}
            onDecrease={() =>
              item.quantity <= 1
                ? run(item.product_id, () => removeItem(item.product_id))
                : run(item.product_id, () =>
                    updateItem(item.product_id, item.quantity - 1),
                  )
            }
            onIncrease={() =>
              run(item.product_id, () =>
                updateItem(item.product_id, item.quantity + 1),
              )
            }
          />

          <div className="w-16 shrink-0 text-right font-semibold text-text">
            {item.price * item.quantity} ₴
          </div>

          <button
            type="button"
            disabled={busyId === item.product_id}
            onClick={() => run(item.product_id, () => removeItem(item.product_id))}
            aria-label="Прибрати товар"
            className="shrink-0 text-text-subtle transition hover:text-accent disabled:opacity-50"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </li>
      ))}
    </ul>
  )
}
