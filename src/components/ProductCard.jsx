import { useState } from 'react'
import { useCart } from '../context/CartContext.jsx'
import { CATEGORY_LABELS } from '../lib/constants.js'
import { getErrorMessage } from '../lib/errors.js'

export const ProductCard = ({ product }) => {
  const { addItem } = useCart()
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState('')

  const handleAdd = async () => {
    setAdding(true)
    setError('')
    try {
      await addItem(product, 1)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setAdding(false)
    }
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white">
      <div className="aspect-square bg-neutral-100">
        {product.images?.[0] && (
          <img
            src={product.images[0]}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <span className="text-xs uppercase text-neutral-400">
          {CATEGORY_LABELS[product.category] || product.category}
        </span>
        <h3 className="font-medium text-neutral-900">{product.name}</h3>
        {product.description && (
          <p className="line-clamp-2 text-sm text-neutral-500">
            {product.description}
          </p>
        )}
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="font-semibold">{product.priceKiev} грн</span>
          <button
            onClick={handleAdd}
            disabled={adding}
            className="rounded-full bg-neutral-900 px-3 py-1.5 text-sm text-white disabled:opacity-50"
          >
            {adding ? '...' : 'В кошик'}
          </button>
        </div>
        {error && <p className="text-xs text-rose-600">{error}</p>}
      </div>
    </div>
  )
}
