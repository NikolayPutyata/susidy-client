import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { fetchAllProducts, fetchProductsByCategory } from '../api/products.js'
import { CATEGORIES } from '../lib/constants.js'
import { ProductCard } from '../components/ProductCard.jsx'
import { getErrorMessage } from '../lib/errors.js'

const ProductCardSkeleton = () => (
  <div className="animate-pulse overflow-hidden rounded-2xl border border-border bg-surface">
    <div className="aspect-square bg-surface-raised" />
    <div className="space-y-2 p-4">
      <div className="h-3 w-1/3 rounded bg-surface-raised" />
      <div className="h-4 w-2/3 rounded bg-surface-raised" />
      <div className="h-8 rounded bg-surface-raised" />
    </div>
  </div>
)

// TODO: замінити --hero-bg на реальне фото (наразі — абстрактний градієнт-заглушка).
const Hero = () => (
  <section
    className="relative left-1/2 right-1/2 -mt-8 mb-10 -ml-[50vw] -mr-[50vw] flex h-[70vh] min-h-[420px] w-screen items-center justify-center overflow-hidden bg-cover bg-center text-center"
    style={{
      backgroundImage:
        'radial-gradient(ellipse at 30% 20%, rgba(0,157,181,0.35), transparent 55%), radial-gradient(ellipse at 75% 75%, rgba(255,133,98,0.3), transparent 55%), #0a0a0c',
    }}
  >
    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/10" />

    <div className="relative px-6">
      <h1 className="mx-auto max-w-2xl text-4xl font-extrabold leading-tight text-text sm:text-6xl">
        Суші тільки зі свіжих продуктів
      </h1>
      <p className="mx-auto mt-4 max-w-md text-lg text-text-muted">
        Готуємо для сусідів, як для себе!
      </p>
    </div>
  </section>
)

export const CatalogPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const category = searchParams.get('category') || 'all'
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const setCategory = (value) => {
    if (value === 'all') {
      setSearchParams({})
    } else {
      setSearchParams({ category: value })
    }
  }

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
      <Hero />

      <div className="sticky top-0 z-10 -mx-4 mb-6 hidden bg-bg/95 px-4 py-3 backdrop-blur sm:block">
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setCategory('all')}
            className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition ${
              category === 'all'
                ? 'bg-primary text-black'
                : 'bg-surface text-text-muted hover:bg-surface-hover hover:text-text'
            }`}
          >
            Все меню
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c.value}
              onClick={() => setCategory(c.value)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition ${
                category === c.value
                  ? 'bg-primary text-black'
                  : 'bg-surface text-text-muted hover:bg-surface-hover hover:text-text'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p className="mb-4 rounded-xl border border-accent/30 bg-accent/10 px-4 py-3 text-accent">
          {error}
        </p>
      )}

      {!loading && products.length === 0 && !error && (
        <p className="py-12 text-center text-text-muted">
          У цій категорії поки нічого немає.
        </p>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {loading
          ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
          : products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
      </div>
    </div>
  )
}
