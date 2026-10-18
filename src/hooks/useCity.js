import { useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '../store/hooks.js'
import { selectCity, setCity as setCityAction } from '../store/citySlice.js'
import { repriceCartForCity } from '../store/cartSlice.js'
import { CITIES, CITY_LABELS } from '../lib/constants.js'

const cityConfig = Object.fromEntries(CITIES.map((c) => [c.value, c]))

export const useCity = () => {
  const dispatch = useAppDispatch()
  const city = useAppSelector(selectCity)

  const setCity = useCallback(
    (value) => {
      dispatch(setCityAction(value))
      // Товари, уже додані в кошик, зафіксовані за ціною попереднього
      // міста — перераховуємо їх під нове.
      dispatch(repriceCartForCity(value))
    },
    [dispatch],
  )

  const getPrice = useCallback(
    (product) => {
      const field = cityConfig[city]?.priceField || 'priceKiev'
      return product[field]
    },
    [city],
  )

  // Re-runs the same reprice the city switch itself triggers — for when it
  // failed the first time (catalog fetch error) and left the cart on the
  // previous city's prices; see cartSlice.js's repriceError.
  const retryReprice = useCallback(() => {
    dispatch(repriceCartForCity(city))
  }, [dispatch, city])

  return {
    city,
    cityLabel: city ? CITY_LABELS[city] : null,
    setCity,
    getPrice,
    retryReprice,
  }
}
