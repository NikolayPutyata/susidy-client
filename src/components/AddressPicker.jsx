import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Map, AdvancedMarker } from '@vis.gl/react-google-maps'
import { CITY_CENTERS, LOCATIONS } from '../lib/constants.js'
import { useNearestPoint } from '../hooks/useNearestPoint.js'
import { AddressAutocompleteInput } from './AddressAutocompleteInput.jsx'
import { DeliveryMapModal } from './DeliveryMapModal.jsx'
import { MapIcon } from './icons.jsx'

// No focus:ring here (unlike the site's other inputs) — the Places web
// component already draws its own internal focus affordance, and adding
// our ring on top of that looked like a doubled border. Font stays at 16px
// (text-base, not text-sm) — iOS Safari auto-zooms the page on focus for
// any input under that, which felt broken on a phone.
const inputClass =
  'w-full rounded-lg border border-border bg-surface-raised text-base text-text placeholder:text-text-subtle outline-none transition focus:border-primary'

// Small, non-interactive preview centered on whatever's currently picked —
// center/zoom are controlled (not defaultCenter/defaultZoom) so it actually
// recenters as the customer picks a different address, instead of being
// stuck on wherever it first mounted.
const MiniMapPreview = ({ city, position, onClick }) => {
  const { t } = useTranslation()
  return (
  <button
    type="button"
    onClick={onClick}
    aria-label={t('address.openMap')}
    className="relative h-28 w-full overflow-hidden rounded-xl border border-border transition hover:border-primary"
  >
    <Map
      mapId="susidy-mini-map"
      center={position || CITY_CENTERS[city]}
      zoom={position ? 15 : 12}
      disableDefaultUI
      gestureHandling="none"
      keyboardShortcuts={false}
      reuseMaps
    >
      {position && <AdvancedMarker position={position} />}
    </Map>
  </button>
  )
}

// Ties together the three ways a customer can give us a delivery address —
// type-and-pick-from-dropdown, tap the mini map, or tap the map-icon
// button — all three end up calling the same onChange with the same shape,
// and the address input itself always reflects whichever was used last.
// Only rendered once the Google Maps JS API has actually loaded (see
// CheckoutPage) — the caller falls back to plain inputs otherwise.
export const AddressPicker = ({ city, value, onChange }) => {
  const { t } = useTranslation()
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
      <label className="mb-1.5 block text-sm text-text-muted">{t('address.deliveryAddress')}</label>

      <div className="flex gap-2">
        <div className="min-w-0 flex-1">
          <AddressAutocompleteInput
            city={city}
            value={value.formattedAddress || value.street}
            className={inputClass}
            onSelect={({ street, building, lat, lng, formattedAddress }) =>
              onChange({ street, building, lat, lng, formattedAddress })
            }
          />
        </div>

        <button
          type="button"
          onClick={() => setMapOpen(true)}
          aria-label={t('address.pickOnMap')}
          className="flex w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-surface-raised text-text-muted transition hover:border-primary hover:text-primary"
        >
          <MapIcon className="h-5 w-5" />
        </button>
      </div>

      <MiniMapPreview city={city} position={position} onClick={() => setMapOpen(true)} />

      {nearestPoint && (
        <p className="px-1 text-sm text-text-muted">
          {t('address.nearestPickup')}{' '}
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
