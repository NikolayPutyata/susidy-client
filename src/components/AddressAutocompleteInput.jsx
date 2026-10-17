import { useEffect, useRef } from 'react'
import { useMapsLibrary } from '@vis.gl/react-google-maps'
import { CITY_CENTERS } from '../lib/constants.js'

// Pulls a usable street + building number out of Google's address
// components — Ukrainian results don't always split them the same way, so
// this falls back to the first line of the formatted address if the
// components don't have what we need.
const extractStreetAndBuilding = (place) => {
  const components = place.addressComponents || []
  const byType = (type) =>
    components.find((c) => c.types.includes(type))?.longText || ''

  const street = byType('route')
  const building = byType('street_number')

  if (street) return { street, building }

  const firstLine = (place.formattedAddress || '').split(',')[0]?.trim() || ''
  return { street: firstLine, building }
}

// New Places Autocomplete (google.maps.places.PlaceAutocompleteElement) —
// the legacy google.maps.places.Autocomplete widget has been deprecated
// since March 2025. It's a web component, not a controlled React input, so
// it's created imperatively and mounted into a container ref; `value` is
// pushed into it imperatively too, whenever it changes from the outside
// (e.g. the customer picked a point on the map instead of a dropdown item)
// — the component's own `.value` property is documented as settable.
export const AddressAutocompleteInput = ({ city, value, onSelect, className }) => {
  const placesLib = useMapsLibrary('places')
  const containerRef = useRef(null)
  const elementRef = useRef(null)

  useEffect(() => {
    if (!placesLib || !containerRef.current) return

    const element = new placesLib.PlaceAutocompleteElement({
      includedRegionCodes: ['ua'],
      locationBias: { center: CITY_CENTERS[city], radius: 20000 },
    })
    element.className = className
    if (value) element.value = value
    elementRef.current = element
    containerRef.current.replaceChildren(element)

    const handleSelect = async (event) => {
      const place = event.placePrediction.toPlace()
      await place.fetchFields({
        fields: ['addressComponents', 'formattedAddress', 'location'],
      })

      const { street, building } = extractStreetAndBuilding(place)
      onSelect({
        street,
        building,
        lat: place.location?.lat(),
        lng: place.location?.lng(),
        formattedAddress: place.formattedAddress || '',
      })
    }

    element.addEventListener('gmp-select', handleSelect)
    return () => {
      element.removeEventListener('gmp-select', handleSelect)
      elementRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placesLib, city])

  useEffect(() => {
    if (elementRef.current && elementRef.current.value !== (value || '')) {
      elementRef.current.value = value || ''
    }
  }, [value])

  return <div ref={containerRef} />
}
