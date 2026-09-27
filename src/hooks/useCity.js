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

  return {
    city,
    cityLabel: city ? CITY_LABELS[city] : null,
    setCity,
    getPrice,
  }
}
