import { useEffect, useState } from 'react'
import { fetchNearestPoint } from '../api/locations.js'

// Live "this point will prepare your order" hint while the customer picks
// a delivery address — purely informational. The server recomputes this
// itself, from the same coordinates, at checkout; this hook's result is
// never sent back as-is.
export const useNearestPoint = (position, city) => {
  const [nearest, setNearest] = useState(null)

  useEffect(() => {
    if (!position) {
      setNearest(null)
      return
    }

    let cancelled = false
    fetchNearestPoint({ lat: position.lat, lng: position.lng, city })
      .then((result) => {
        if (!cancelled) setNearest(result)
      })
      .catch(() => {
        if (!cancelled) setNearest(null)
      })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [position?.lat, position?.lng, city])

  return nearest
}
