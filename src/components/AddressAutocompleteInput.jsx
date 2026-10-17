import { useEffect, useRef } from 'react'
import { useMapsLibrary } from '@vis.gl/react-google-maps'
import { CITY_CENTERS } from '../lib/constants.js'

// New Places Autocomplete (google.maps.places.PlaceAutocompleteElement) —
// the legacy google.maps.places.Autocomplete widget has been deprecated
// since March 2025. It's a web component, not a controlled React input, so
// it's created imperatively and mounted into a container ref; `value` is
// pushed into it imperatively too, whenever it changes from the outside
// (e.g. the customer picked a point on the map instead of a dropdown item)
// — the component's own `.value` property is documented as settable.
//
// Earlier rounds restricted suggestions to building-level place types and
// hard-rejected anything without a street_number — that made the dropdown
// barely return results in practice (too aggressive a filter on Google's
// side), so it's back to accepting whatever the customer picks here. The
// map-pin path still checks for a building number on its own.
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
      await place.fetchFields({ fields: ['formattedAddress', 'location'] })

      // The input is the full address (street + building) as one string —
      // same shape as what a map pin confirms, so downstream code (order
      // summary, Telegram message, admin view) doesn't need to care which
      // of the two ways the customer picked it.
      const formattedAddress = place.formattedAddress || ''
      onSelect({
        street: formattedAddress,
        building: '',
        lat: place.location?.lat(),
        lng: place.location?.lng(),
        formattedAddress,
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
