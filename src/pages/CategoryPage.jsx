import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router-dom'
import { fetchProductsByCategory } from '../api/products.js'
import { CATEGORIES } from '../lib/constants.js'
import { ProductGrid } from '../components/ProductGrid.jsx'
import { getErrorMessage } from '../lib/errors.js'
import { CloseIcon } from '../components/icons.jsx'

// A dedicated page per category (/category/:categoryValue) instead of the
// old ?category= query param rendered inline under the homepage's own
// carousels/tiles — a real page is bookmarkable, gets its own browser
// history entry, and keeps the homepage sections from disappearing
// whenever someone is just browsing a category.
export const CategoryPage = () => {
  const { t } = useTranslation()
  const { categoryValue } = useParams()
  const category = CATEGORIES.find((c) => c.value === categoryValue)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [categoryValue])

  useEffect(() => {
    if (!category) return
    let cancelled = false
    setLoading(true)
    setError('')
    fetchProductsByCategory(categoryValue)
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
  }, [category, categoryValue])

  if (!category) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4">
        <p className="py-12 text-center text-text-muted">
          {t('errors.categoryNotFound')}{' '}
          <Link to="/" className="text-primary-light underline underline-offset-2">
            {t('header.home')}
          </Link>
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h1 className="text-lg font-bold">{t(`categories.${category.value}`)}</h1>
        <Link
          to="/"
          className="flex items-center gap-1 text-sm text-text-muted underline underline-offset-2 hover:text-text"
        >
          <CloseIcon className="h-3.5 w-3.5" />
          {t('header.allMenu')}
        </Link>
      </div>

      <ProductGrid
        products={products}
        loading={loading}
        error={error}
        emptyMessage={t('filters.categoryEmpty')}
      />
    </div>
  )
}
