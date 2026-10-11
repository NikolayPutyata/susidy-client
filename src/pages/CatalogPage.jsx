import { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { useSearchParams } from 'react-router-dom'
import { fetchAllProducts, fetchProductsByCategory } from '../api/products.js'
import { useModals } from '../hooks/useModals.js'
import { CATEGORIES, FAVORITES_CATEGORY } from '../lib/constants.js'
import { ProductCard } from '../components/ProductCard.jsx'
import { getErrorMessage } from '../lib/errors.js'
import { selectIsAuthenticated, selectUser } from '../store/userSlice.js'

// TODO: замінити --hero-bg на реальне фото (наразі — абстрактний градієнт-заглушка).
const Hero = () => (
  <section
    className="relative left-1/2 right-1/2 -mt-8 mb-10 -ml-[50vw] -mr-[50vw] flex h-[70vh] min-h-[420px] w-screen items-center justify-center overflow-hidden bg-cover bg-center text-center"
    style={{ backgroundImage: "url('/fon.jpg')" }}
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
  const user = useSelector(selectUser)
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const { openLogin } = useModals()
  const [searchParams, setSearchParams] = useSearchParams()
  const category = searchParams.get('category') || 'all'
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const setCategory = (value) => {
    if (value === FAVORITES_CATEGORY.value && !isAuthenticated) {
      openLogin()
      return
    }

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

    // "Улюблене" is not a real backend category — it's a client-side
    // filter over whatever the user has favorited, which can span any
    // category, so it fetches the whole catalog like "Все меню" does.
    const request =
      category === 'all' || category === FAVORITES_CATEGORY.value
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

  const displayedProducts = useMemo(() => {
    if (category !== FAVORITES_CATEGORY.value) return products
    return products.filter((product) => user?.favorites?.includes(product._id))
  }, [products, category, user])

  return (
    <div>
      <Hero />

      <div className="sticky top-0 z-10 -mx-4 mb-6 hidden bg-bg/95 px-4 py-3 backdrop-blur sm:block">
        <div className="flex justify-center gap-2 overflow-x-auto pb-1">
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
          <button
            onClick={() => setCategory(FAVORITES_CATEGORY.value)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition ${
              category === FAVORITES_CATEGORY.value
                ? 'bg-primary text-black'
                : 'bg-surface text-text-muted hover:bg-surface-hover hover:text-text'
            }`}
          >
            {FAVORITES_CATEGORY.label}
          </button>
        </div>
      </div>

      {error && (
        <p className="mb-4 rounded-xl border border-accent/30 bg-accent/10 px-4 py-3 text-accent">
          {error}
        </p>
      )}

      {!loading && displayedProducts.length === 0 && !error && (
        <p className="py-12 text-center text-text-muted">
          {category === FAVORITES_CATEGORY.value
            ? 'У вас поки немає улюблених позицій.'
            : 'У цій категорії поки нічого немає.'}
        </p>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {displayedProducts.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  )
}
