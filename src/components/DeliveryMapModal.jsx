import { useCallback, useEffect, useRef, useState } from 'react'
import { AdvancedMarker, Map, useMap, useMapsLibrary } from '@vis.gl/react-google-maps'
import { CITY_CENTERS, LOCATIONS } from '../lib/constants.js'
import { CloseIcon, SpinnerIcon } from './icons.jsx'

// Markers for the business's own pickup points, so the customer can see
// where they are relative to the address they're picking — points without
// coordinates yet (not geocoded) just don't render.
const PointMarkers = ({ city }) => {
  const points = LOCATIONS.filter(
    (l) => l.city === city && l.lat != null && l.lng != null,
  )

  return points.map((point) => (
    <AdvancedMarker key={point.id} position={{ lat: point.lat, lng: point.lng }}>
      <div
        title={point.address}
        className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-primary text-sm shadow-lg"
      >
        🍣
      </div>
    </AdvancedMarker>
  ))
}

// Click-anywhere-on-the-map-to-drop-a-pin — the vis.gl Map component's own
// onClick covers this, so this only exists to also support drag-to-move
// via a native map listener for anything onClick doesn't catch (kept
// separate from Map's onClick prop for clarity).
const useMapClick = (onPick) => {
  const map = useMap()

  useEffect(() => {
    if (!map) return undefined
    const listener = map.addListener('click', (e) => {
      if (!e.latLng) return
      onPick({ lat: e.latLng.lat(), lng: e.latLng.lng() })
    })
    return () => listener.remove()
  }, [map, onPick])
}

const MapClickHandler = ({ onPick }) => {
  useMapClick(onPick)
  return null
}

export const DeliveryMapModal = ({ open, city, initialPosition, onClose, onConfirm }) => {
  const geocodingLib = useMapsLibrary('geocoding')
  const geocoderRef = useRef(null)
  const [marker, setMarker] = useState(initialPosition || null)
  const [address, setAddress] = useState('')
  const [geocoding, setGeocoding] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    setMarker(initialPosition || null)
    setAddress('')
    setError('')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  useEffect(() => {
    if (geocodingLib && !geocoderRef.current) {
      geocoderRef.current = new geocodingLib.Geocoder()
    }
  }, [geocodingLib])

  const handlePick = useCallback((position) => {
    setMarker(position)
    setAddress('')
    setError('')

    if (!geocoderRef.current) return

    setGeocoding(true)
    geocoderRef.current.geocode({ location: position }, (results, status) => {
      setGeocoding(false)
      if (status === 'OK' && results?.[0]) {
        setAddress(results[0].formatted_address)
      } else {
        setError('Не вдалось визначити адресу за цією точкою — спробуйте іншу.')
      }
    })
  }, [])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4 animate-fade-in">
      <div className="relative flex h-[85vh] w-full max-w-3xl flex-col rounded-3xl border border-border bg-surface p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold">Оберіть адресу на карті</h2>
          <button
            onClick={onClose}
            aria-label="Закрити"
            className="flex h-8 w-8 items-center justify-center rounded-full text-text-muted transition hover:bg-surface-hover hover:text-text"
          >
            <CloseIcon className="h-4.5 w-4.5" />
          </button>
        </div>

        <div className="relative flex-1 overflow-hidden rounded-2xl">
          <Map
            mapId="susidy-delivery-map"
            defaultCenter={initialPosition || CITY_CENTERS[city]}
            defaultZoom={13}
            gestureHandling="greedy"
            disableDefaultUI={false}
            reuseMaps
          >
            <MapClickHandler onPick={handlePick} />
            {marker && (
              <AdvancedMarker
                position={marker}
                gmpDraggable
                onDragEnd={(e) => {
                  const pos = e.latLng
                  if (pos) handlePick({ lat: pos.lat(), lng: pos.lng() })
                }}
              />
            )}
            <PointMarkers city={city} />
          </Map>
        </div>

        <div className="mt-3 space-y-2">
          {geocoding && (
            <p className="flex items-center gap-2 text-sm text-text-muted">
              <SpinnerIcon className="h-4 w-4 animate-spin" /> Визначаємо адресу…
            </p>
          )}
          {!geocoding && address && <p className="text-sm text-text">{address}</p>}
          {!geocoding && !address && !error && (
            <p className="text-sm text-text-muted">
              Торкніться карти або перетягніть позначку, щоб обрати адресу.
            </p>
          )}
          {error && <p className="text-sm text-accent">{error}</p>}

          <button
            type="button"
            disabled={!marker || geocoding || !address}
            onClick={() =>
              onConfirm({ lat: marker.lat, lng: marker.lng, formattedAddress: address })
            }
            className="w-full rounded-full bg-primary py-2.5 font-semibold text-black transition hover:bg-primary-light disabled:opacity-50"
          >
            Підтвердити адресу
          </button>
        </div>
      </div>
    </div>
  )
}
