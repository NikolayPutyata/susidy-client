import { useState } from 'react'
import { Map, AdvancedMarker } from '@vis.gl/react-google-maps'
import { CITY_CENTERS, LOCATIONS } from '../lib/constants.js'
import { useNearestPoint } from '../hooks/useNearestPoint.js'
import { AddressAutocompleteInput } from './AddressAutocompleteInput.jsx'
import { DeliveryMapModal } from './DeliveryMapModal.jsx'
import { MapIcon } from './icons.jsx'

const inputClass =
  'w-full rounded-xl border border-border bg-surface-raised px-4 py-2.5 text-text placeholder:text-text-subtle outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30'

// Small, non-interactive preview of the picked point — clicking it opens
// the same big map modal as the dedicated map button, it's just a second,
// more visual way in.
const MiniMapPreview = ({ city, position, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label="Відкрити карту"
    className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-border transition hover:border-primary"
  >
    <Map
      mapId="susidy-mini-map"
      defaultCenter={position || CITY_CENTERS[city]}
      defaultZoom={position ? 15 : 12}
      disableDefaultUI
      gestureHandling="none"
      keyboardShortcuts={false}
      reuseMaps
    >
      {position && <AdvancedMarker position={position} />}
    </Map>
  </button>
)

// Ties together the three ways a customer can give us a delivery address —
// type-and-pick-from-dropdown, tap the mini map, or tap the map-icon
// button — all three end up calling the same onChange with the same shape.
export const AddressPicker = ({ city, value, onChange }) => {
  const [mapOpen, setMapOpen] = useState(false)
  const position = value.lat != null && value.lng != null ? { lat: value.lat, lng: value.lng } : null
  const nearest = useNearestPoint(position, city)
  const nearestPoint = nearest ? LOCATIONS.find((l) => l.id === nearest.pointId) : null

  const handleConfirmFromMap = ({ lat, lng, formattedAddress }) => {
    onChange({ street: formattedAddress, building: '', lat, lng, formattedAddress })
    setMapOpen(false)
  }

  return (
    <div className="space-y-2">
      <label className="mb-1.5 block text-sm text-text-muted">Адреса доставки</label>
      <div className="flex gap-2">
        <div className="min-w-0 flex-1 space-y-2">
          <AddressAutocompleteInput
            city={city}
            className={inputClass}
            onSelect={({ street, building, lat, lng, formattedAddress }) =>
              onChange({ street, building, lat, lng, formattedAddress })
            }
          />
          {value.street && (
            <p className="truncate px-1 text-sm text-text-muted">
              Обрано: {value.formattedAddress || `${value.street}, ${value.building}`}
            </p>
          )}
        </div>

        <MiniMapPreview city={city} position={position} onClick={() => setMapOpen(true)} />

        <button
          type="button"
          onClick={() => setMapOpen(true)}
          aria-label="Обрати адресу на карті"
          className="flex h-24 w-14 shrink-0 items-center justify-center rounded-xl border border-border bg-surface-raised text-text-muted transition hover:border-primary hover:text-primary"
        >
          <MapIcon className="h-6 w-6" />
        </button>
      </div>

      {nearestPoint && (
        <p className="px-1 text-sm text-text-muted">
          Ваше замовлення готуватиме точка:{' '}
          <span className="font-semibold text-text">{nearestPoint.address}</span>
        </p>
      )}

      <DeliveryMapModal
        open={mapOpen}
        city={city}
        initialPosition={position}
        onClose={() => setMapOpen(false)}
        onConfirm={handleConfirmFromMap}
      />
    </div>
  )
}
