import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchAllProducts } from '../../api/products.js'
import { CATEGORIES } from '../../lib/constants.js'

// Each tile's background is the first product's own photo from that
// category — no separate "category image" field anywhere to manage, so
// there's nothing for the admin to keep in sync (a new category just
// starts showing a tile the moment its first product gets a photo).
export const CategoryTiles = () => {
  const navigate = useNavigate()
  const [products, setProducts] = useState([])

  useEffect(() => {
    let cancelled = false
    fetchAllProducts()
      .then((data) => {
        if (!cancelled) setProducts(data)
      })
      .catch(() => {
        // Non-critical section — fail silently, just don't render it.
      })
    return () => {
      cancelled = true
    }
  }, [])

  const tiles = CATEGORIES.map((category) => {
    const representative = products.find(
      (p) => p.category === category.value && p.images?.[0],
    )
    return { ...category, image: representative?.images?.[0] }
  }).filter((tile) => tile.image)

  if (tiles.length === 0) return null

  return (
    <div>
      <h2 className="mb-4 flex items-center justify-center gap-2 text-center text-lg font-extrabold sm:text-xl">
        <span className="text-primary">✦</span> Наше меню{' '}
        <span className="text-primary">✦</span>
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {tiles.map((tile) => (
          <button
            key={tile.value}
            type="button"
            onClick={() => navigate(`/category/${tile.value}`)}
            className="group relative aspect-square overflow-hidden rounded-2xl bg-surface text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          >
            <img
              src={tile.image}
              alt={tile.label}
              loading="lazy"
              className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            <span className="absolute bottom-2 left-2 right-2 truncate rounded-xl bg-black/50 px-2.5 py-1.5 text-sm font-semibold text-text backdrop-blur-sm">
              {tile.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
