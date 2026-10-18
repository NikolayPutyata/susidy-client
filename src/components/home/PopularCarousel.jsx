import { useEffect, useState } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation } from 'swiper/modules'
import 'swiper/css'
import { fetchFeaturedProducts } from '../../api/products.js'
import { ProductCard } from '../ProductCard.jsx'
import { ChevronIcon } from '../icons.jsx'

// Smaller "Обирають найчастіше" carousel just below the promo one —
// manually curated (products.featured), manual navigation only (no
// autoplay). Reuses ProductCard as-is, same card as the regular grid.
export const PopularCarousel = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [swiper, setSwiper] = useState(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [slidesPerView, setSlidesPerView] = useState(2)

  useEffect(() => {
    let cancelled = false
    fetchFeaturedProducts()
      .then((data) => {
        if (!cancelled) setProducts(data)
      })
      .catch(() => {
        // Non-critical section — fail silently, just don't render it.
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (loading || products.length === 0) return null

  const pageCount = Math.max(1, Math.ceil(products.length / slidesPerView))
  const currentPage = Math.min(
    pageCount,
    Math.floor(activeIndex / slidesPerView) + 1,
  )

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-extrabold sm:text-xl">
            Обирають найчастіше
          </h2>
          <p className="text-sm text-text-muted">Тут зібрані справжні хіти меню</p>
        </div>

        <div className="flex items-center gap-2.5 text-sm text-text-muted">
          <button
            onClick={() => swiper?.slidePrev()}
            aria-label="Назад"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-raised text-text transition hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 disabled:opacity-40"
            disabled={currentPage <= 1}
          >
            <ChevronIcon className="h-4 w-4" />
          </button>
          <span className="tabular-nums">
            {String(currentPage).padStart(2, '0')} / {String(pageCount).padStart(2, '0')}
          </span>
          <button
            onClick={() => swiper?.slideNext()}
            aria-label="Вперед"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-raised text-text transition hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 disabled:opacity-40"
            disabled={currentPage >= pageCount}
          >
            <ChevronIcon className="h-4 w-4 rotate-180" />
          </button>
        </div>
      </div>

      <Swiper
        modules={[Navigation]}
        onSwiper={setSwiper}
        onSlideChange={(s) => setActiveIndex(s.activeIndex)}
        onBreakpoint={(s) =>
          setSlidesPerView(
            typeof s.params.slidesPerView === 'number' ? s.params.slidesPerView : 1,
          )
        }
        slidesPerView={2}
        spaceBetween={12}
        breakpoints={{
          640: { slidesPerView: 3, spaceBetween: 16 },
        }}
      >
        {products.map((product) => (
          <SwiperSlide key={product._id}>
            <ProductCard product={product} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  )
}
