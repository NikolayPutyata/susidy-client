import { useEffect, useState } from 'react'
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

const Hero = () => (
  <section className="relative mb-10 overflow-hidden rounded-3xl border border-border bg-surface px-6 py-14 text-center sm:py-20">
    <div
      aria-hidden="true"
      className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-primary/25 blur-3xl"
    />
    <div
      aria-hidden="true"
      className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-accent/25 blur-3xl"
    />

    <p className="relative text-sm font-semibold uppercase tracking-widest text-primary-light">
      Свіжі роли та суші
    </p>
    <h1 className="relative mx-auto mt-3 max-w-2xl text-4xl font-extrabold leading-tight sm:text-5xl">
      Смачно. Швидко.{' '}
      <span className="bg-gradient-to-r from-primary-light to-accent bg-clip-text text-transparent">
        Без зайвих кроків.
      </span>
    </h1>
    <p className="relative mx-auto mt-4 max-w-md text-text-muted">
      Обирай улюблені роли й суші, додавай у кошик і оформлюй замовлення без
      реєстрації — за пару хвилин.
    </p>
  </section>
)

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
      <Hero />

      <div className="sticky top-[65px] z-10 -mx-4 mb-6 bg-bg/95 px-4 py-3 backdrop-blur">
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
