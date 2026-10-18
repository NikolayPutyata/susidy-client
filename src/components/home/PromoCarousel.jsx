import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Navigation, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'
import { fetchActiveBanners } from '../../api/banners.js'
import { ChevronIcon } from '../icons.jsx'

// Big autoplay promo carousel at the top of the homepage — news, price
// changes, promos, manually curated by the admin (AdminBannersPage). Always
// 3 slides visible on desktop (one centered + two blurred neighbors, see
// index.css's .promo-swiper rules), 1 on mobile. Admin content, nothing
// else in the app reacts to it — rendering nothing when there are no
// active banners is the correct empty state, not an error.
export const PromoCarousel = () => {
  const navigate = useNavigate()
  const [banners, setBanners] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetchActiveBanners()
      .then((data) => {
        if (!cancelled) setBanners(data)
      })
      .catch(() => {
        // Promo content failing to load shouldn't block the rest of the
        // homepage — just show nothing.
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const handleBannerClick = (link) => {
    if (!link) return
    if (/^https?:\/\//.test(link)) {
      window.open(link, '_blank', 'noreferrer')
    } else {
      navigate(link)
    }
  }

  if (loading || banners.length === 0) return null

  // Swiper's loop mode clones slides to fake infinite scrolling, but with
  // centeredSlides + slidesPerView:3 it needs a healthy multiple of
  // slidesPerView real slides to build that clone buffer — below ~6 it
  // renders a visibly broken gap instead of the third slide. Most admins
  // will only ever add a handful of banners, so rather than require 6+
  // banners just for looping to work, fall back to rewind (restart from
  // the first slide after the last) below that threshold.
  const canLoop = banners.length >= 6

  return (
    <div className="relative mb-6">
      <Swiper
        modules={[Autoplay, Navigation, Pagination]}
        className="promo-swiper home-swiper !overflow-visible sm:!overflow-hidden"
        loop={canLoop}
        rewind={!canLoop && banners.length > 1}
        centeredSlides
        autoplay={
          banners.length > 1
            ? { delay: 5000, disableOnInteraction: false }
            : false
        }
        pagination={{ clickable: true }}
        navigation={{ prevEl: '.promo-prev', nextEl: '.promo-next' }}
        slidesPerView={1.08}
        spaceBetween={12}
        breakpoints={{
          640: { slidesPerView: 3, spaceBetween: 16 },
        }}
      >
        {banners.map((banner) => (
          <SwiperSlide key={banner._id}>
            <button
              type="button"
              onClick={() => handleBannerClick(banner.link)}
              disabled={!banner.link}
              className={`relative block aspect-[16/9] w-full overflow-hidden rounded-3xl bg-surface text-left sm:aspect-auto sm:h-[380px] md:h-[440px] lg:h-[520px] ${
                banner.link ? 'cursor-pointer' : 'cursor-default'
              }`}
            >
              <img
                src={banner.image}
                alt={banner.title || ''}
                className="h-full w-full object-cover"
              />
              {(banner.title || banner.subtitle) && (
                <div className="absolute inset-0 flex flex-col justify-end gap-1 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-5">
                  {banner.title && (
                    <h3 className="text-lg font-extrabold text-text sm:text-2xl">
                      {banner.title}
                    </h3>
                  )}
                  {banner.subtitle && (
                    <p className="text-sm text-text-muted sm:text-base">
                      {banner.subtitle}
                    </p>
                  )}
                </div>
              )}
            </button>
          </SwiperSlide>
        ))}
      </Swiper>

      {banners.length > 1 && (
        <>
          <button
            aria-label="Попередній банер"
            className="promo-prev absolute left-1 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-text backdrop-blur-sm transition hover:bg-black/70 sm:flex"
          >
            <ChevronIcon className="h-5 w-5" />
          </button>
          <button
            aria-label="Наступний банер"
            className="promo-next absolute right-1 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-text backdrop-blur-sm transition hover:bg-black/70 sm:flex"
          >
            <ChevronIcon className="h-5 w-5 rotate-180" />
          </button>
        </>
      )}
    </div>
  )
}
