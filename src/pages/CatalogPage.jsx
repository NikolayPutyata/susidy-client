import { useEffect, useState } from 'react'
import { fetchAllProducts, fetchProductsByCategory } from '../api/products.js'
import { CATEGORIES } from '../lib/constants.js'
import { ProductCard } from '../components/ProductCard.jsx'
import { getErrorMessage } from '../lib/errors.js'

export const CatalogPage = () => {
  const [category, setCategory] = useState('all')
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')

    const request =
      category === 'all'
        ? fetchAllProducts()
        : fetchProductsByCategory(category)

    request
      .then((data) => {
        if (!cancelled) setProducts(data)
      })
      .catch((err) => {
        if (!cancelled) setError(getErrorMessage(err))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [category])

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setCategory('all')}
          className={`rounded-full px-4 py-1.5 text-sm ${
            category === 'all'
              ? 'bg-neutral-900 text-white'
              : 'bg-neutral-200 text-neutral-700'
          }`}
        >
          Все меню
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c.value}
            onClick={() => setCategory(c.value)}
            className={`rounded-full px-4 py-1.5 text-sm ${
              category === c.value
                ? 'bg-neutral-900 text-white'
                : 'bg-neutral-200 text-neutral-700'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {error && <p className="mb-4 text-rose-600">{error}</p>}
      {loading && <p className="text-neutral-500">Завантаження меню…</p>}

      {!loading && products.length === 0 && !error && (
        <p className="text-neutral-500">У цій категорії поки нічого немає.</p>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  )
}
