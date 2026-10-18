import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Navigation, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'
import { fetchActiveBanners } from '../../api/banners.js'
import { ChevronIcon } from '../icons.jsx'

// Big autoplay promo carousel at the top of the homepage — news, price
// changes, promos, manually curated by the admin (AdminBannersPage).
// Square slides, centered + blurred neighbor peeking in on either side
// (see index.css's .promo-swiper rules), always loops seamlessly back to
// the start. Admin content, nothing else in the app reacts to it —
// rendering nothing when there are no active banners is the correct empty
// state, not an error.
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

  // Swiper's loop mode needs a real slide count well above slidesPerView
  // (confirmed down to 8+ real slides at slidesPerView:2 — below that it
  // disables loop internally and the carousel just dead-ends at the last
  // slide instead of wrapping). Admins will realistically only ever add a
  // handful of banners, so instead of capping the UX to "loops only past
  // 8 banners", pad out the rendered slide list by repeating the real
  // banners until there's enough for Swiper's loop to engage — visually
  // indistinguishable from a true infinite loop of the same few banners.
  const MIN_LOOP_SLIDES = 8
  const slidesToRender =
    banners.length > 1 && banners.length < MIN_LOOP_SLIDES
      ? Array.from({ length: Math.ceil(MIN_LOOP_SLIDES / banners.length) }, () => banners).flat()
      : banners

  return (
    <div className="relative mb-6">
      <Swiper
        modules={[Autoplay, Navigation, Pagination]}
        className="promo-swiper home-swiper !overflow-visible sm:!overflow-hidden"
        loop={banners.length > 1}
        centeredSlides
        autoplay={
          banners.length > 1
            ? { delay: 5000, disableOnInteraction: false }
            : false
        }
        pagination={{ clickable: true, dynamicBullets: true }}
        navigation={{ prevEl: '.promo-prev', nextEl: '.promo-next' }}
        slidesPerView={1.1}
        spaceBetween={12}
        breakpoints={{
          640: { slidesPerView: 2, spaceBetween: 20 },
        }}
      >
        {slidesToRender.map((banner, index) => (
          <SwiperSlide key={`${banner._id}-${index}`}>
            <button
              type="button"
              onClick={() => handleBannerClick(banner.link)}
              disabled={!banner.link}
              className={`relative block aspect-square w-full overflow-hidden rounded-3xl bg-surface text-left ${
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
