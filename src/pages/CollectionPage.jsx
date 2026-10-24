import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { ProductGrid } from '../components/ProductGrid.jsx'
import { getErrorMessage } from '../lib/errors.js'
import { CloseIcon } from '../components/icons.jsx'

// Shared page for the homepage's curated carousels ("Обирають найчастіше",
// "Роли від шефа") once their title is clicked — same layout as
// CategoryPage, just backed by a curation fetch (featured/chefsPick)
// instead of a catalog category.
export const CollectionPage = ({ title, fetchProducts }) => {
  const { t } = useTranslation()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    fetchProducts()
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
  }, [fetchProducts])

  return (
    <div className="mx-auto w-full max-w-6xl px-4">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h1 className="text-lg font-bold">{title}</h1>
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
