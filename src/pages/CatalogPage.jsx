import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { fetchAllProducts, fetchProductsByCategory } from '../api/products.js'
import { CATEGORIES } from '../lib/constants.js'
import { ProductCard } from '../components/ProductCard.jsx'
import { PromoCarousel } from '../components/home/PromoCarousel.jsx'
import { PopularCarousel } from '../components/home/PopularCarousel.jsx'
import { CategoryTiles } from '../components/home/CategoryTiles.jsx'
import { getErrorMessage } from '../lib/errors.js'
import { CloseIcon } from '../components/icons.jsx'

// Vertical gap between homepage sections. On sm+ it also carries a soft
// black-to-gray glow band — a gentle visual seam between blocks instead of
// a hard line, since the whole page is otherwise flat black.
const SectionGap = () => (
  <div aria-hidden className="h-8 sm:h-14">
    <div className="hidden h-full bg-gradient-to-b from-transparent via-white/[0.045] to-transparent sm:block" />
  </div>
)

export const CatalogPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const category = searchParams.get('category') || 'all'
  const search = searchParams.get('search') || ''
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const resultsRef = useRef(null)
  const isFirstCategoryRender = useRef(true)

  const setCategory = (value) => {
    if (value === 'all') {
      setSearchParams({})
    } else {
      setSearchParams({ category: value })
    }
  }

  const clearSearch = () => setSearchParams({})

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')

    // A search ignores the category filter entirely — it looks across the
    // whole catalog, same as fetchAllProducts already does for 'all'.
    const request =
      search || category === 'all'
        ? fetchAllProducts()
        : fetchProductsByCategory(category)

    request
      .then((data) => {
        if (cancelled) return
        const filtered = search
          ? data.filter((p) =>
              p.name.toLowerCase().includes(search.toLowerCase()),
            )
          : data
        setProducts(filtered)
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
  }, [category, search])

  // Picking a category tile is above the results, so scroll the results
  // into view afterwards — but not on the very first mount (don't fight a
  // deep-linked ?category= or the browser's own back/forward scroll
  // restoration), and not when the change came from a search instead.
  useEffect(() => {
    if (isFirstCategoryRender.current) {
      isFirstCategoryRender.current = false
      return
    }
    if (!search) {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [category, search])

  const categoryLabel = CATEGORIES.find((c) => c.value === category)?.label

  return (
    <div>
      {!search && (
        <>
          <PromoCarousel />
          <SectionGap />
          <PopularCarousel />
          <SectionGap />
          <CategoryTiles activeCategory={category} />
          <SectionGap />
        </>
      )}

      <div ref={resultsRef}>
        {search ? (
          <div className="mb-4 flex items-center justify-between gap-2">
            <h1 className="text-lg font-bold">
              Результати пошуку: <span className="text-primary-light">{search}</span>
            </h1>
            <button
              onClick={clearSearch}
              aria-label="Скасувати пошук"
              className="flex items-center gap-1 text-sm text-text-muted underline underline-offset-2 hover:text-text"
            >
              <CloseIcon className="h-3.5 w-3.5" />
              Скасувати
            </button>
          </div>
        ) : (
          category !== 'all' && (
            <div className="mb-4 flex items-center justify-between gap-2">
              <h1 className="text-lg font-bold">{categoryLabel}</h1>
              <button
                onClick={() => setCategory('all')}
                className="flex items-center gap-1 text-sm text-text-muted underline underline-offset-2 hover:text-text"
              >
                <CloseIcon className="h-3.5 w-3.5" />
                Все меню
              </button>
            </div>
          )
        )}

        {error && (
          <p className="mb-4 rounded-xl border border-accent/30 bg-accent/10 px-4 py-3 text-accent">
            {error}
          </p>
        )}

        {!loading && products.length === 0 && !error && (
          <p className="py-12 text-center text-text-muted">
            {search ? 'Нічого не знайдено.' : 'У цій категорії поки нічого немає.'}
          </p>
        )}

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </div>
    </div>
  )
}
