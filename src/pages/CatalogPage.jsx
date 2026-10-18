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

export const CatalogPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const category = searchParams.get('category') || 'all'
  const search = searchParams.get('search') || ''
  const isHome = category === 'all' && !search
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const categoryBarRef = useRef(null)
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

  // Switching category while scrolled far down a long grid used to leave
  // the viewport stranded past the new (often shorter) grid's end, with
  // the sticky category bar no longer pinned anywhere sensible — scroll it
  // back into place, but not on the very first mount (don't fight a
  // deep-linked ?category= or the browser's own back/forward scroll
  // restoration).
  useEffect(() => {
    if (isFirstCategoryRender.current) {
      isFirstCategoryRender.current = false
      return
    }
    categoryBarRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [category])

  return (
    <div className="pt-14">
      {isHome && (
        <>
          <PromoCarousel />
          <PopularCarousel />
          <CategoryTiles products={products} />
        </>
      )}

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
        // z-20: must paint above ProductCard's favorite-heart button
        // (z-10) — with equal z-index, the later-in-DOM product grid
        // would otherwise win the tie-break and show through this bar
        // while scrolling.
        <div
          ref={categoryBarRef}
          className="sticky top-0 z-20 -mx-4 mb-6 hidden bg-bg/95 px-4 py-3 backdrop-blur sm:block"
        >
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
          </div>
        </div>
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
  )
}
