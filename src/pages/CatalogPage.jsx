import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import {
  fetchAllProducts,
  fetchChefsPickProducts,
  fetchFeaturedProducts,
} from '../api/products.js'
import { ProductGrid } from '../components/ProductGrid.jsx'
import { PromoCarousel } from '../components/home/PromoCarousel.jsx'
import { ProductCarousel } from '../components/home/ProductCarousel.jsx'
import { CategoryTiles } from '../components/home/CategoryTiles.jsx'
import { getErrorMessage } from '../lib/errors.js'
import { CloseIcon } from '../components/icons.jsx'

// Vertical gap between homepage sections. On sm+ it also carries a soft
// black-to-gray glow band — a gentle visual seam between blocks instead of
// a hard line, since the whole page is otherwise flat black. Rendered
// full-bleed (outside any max-width container) so the glow spans the real
// viewport edge-to-edge instead of being cut off by a content container.
const SectionGap = () => (
  <div aria-hidden className="h-12 sm:h-16">
    <div className="hidden h-full bg-gradient-to-b from-transparent via-white/[0.05] to-transparent sm:block" />
  </div>
)

// Everything except the promo carousel and the section dividers stays
// readable-width on large screens — full-bleed only makes sense for a
// background/decorative element or an edge-to-edge image carousel, not
// for product cards and text.
const Contained = ({ children }) => (
  <div className="mx-auto w-full max-w-6xl px-4">{children}</div>
)

export const CatalogPage = () => {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const search = searchParams.get('search') || ''
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const clearSearch = () => setSearchParams({})

  useEffect(() => {
    if (!search) {
      setProducts([])
      setError('')
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    setError('')

    fetchAllProducts()
      .then((data) => {
        if (cancelled) return
        setProducts(
          data.filter((p) => p.name.toLowerCase().includes(search.toLowerCase())),
        )
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
  }, [search])

  if (search) {
    return (
      <Contained>
        <div className="mb-4 flex items-center justify-between gap-2">
          <h1 className="text-lg font-bold">
            {t('catalog.searchResults')} <span className="text-primary-light">{search}</span>
          </h1>
          <button
            onClick={clearSearch}
            aria-label={t('catalog.cancelSearch')}
            className="flex items-center gap-1 text-sm text-text-muted underline underline-offset-2 hover:text-text"
          >
            <CloseIcon className="h-3.5 w-3.5" />
            {t('catalog.cancel')}
          </button>
        </div>

        <ProductGrid
          products={products}
          loading={loading}
          error={error}
          emptyMessage={t('catalog.noSearchResults')}
        />
      </Contained>
    )
  }

  return (
    <div>
      <PromoCarousel />
      <SectionGap />

      <Contained>
        <ProductCarousel
          title={t('catalog.featuredTitle')}
          subtitle={t('catalog.featuredSubtitle')}
          fetchProducts={fetchFeaturedProducts}
        />
      </Contained>
      <SectionGap />

      <Contained>
        <CategoryTiles />
      </Contained>
      <SectionGap />

      <Contained>
        <ProductCarousel
          title={t('catalog.chefsPickTitle')}
          subtitle={t('catalog.chefsPickSubtitle')}
          fetchProducts={fetchChefsPickProducts}
        />
      </Contained>
    </div>
  )
}
