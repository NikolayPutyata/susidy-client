import { createSlice } from '@reduxjs/toolkit'
import { CITIES } from '../lib/constants.js'

const CITY_KEY = 'susidy_city'

const readStoredCity = () => {
  try {
    const value = localStorage.getItem(CITY_KEY)
    return CITIES.some((c) => c.value === value) ? value : null
  } catch {
    return null
  }
}

const writeStoredCity = (city) => {
  try {
    localStorage.setItem(CITY_KEY, city)
  } catch {
    /* ignore — вибір міста просто не переживе перезавантаження сторінки */
  }
}

const initialState = {
  // null означає, що юзер ще не обирав місто — сайт має це запитати.
  city: readStoredCity(),
}

const citySlice = createSlice({
  name: 'city',
  initialState,
  reducers: {
    setCity(state, action) {
      state.city = action.payload
      writeStoredCity(action.payload)
    },
  },
})

export const { setCity } = citySlice.actions
export default citySlice.reducer

export const selectCity = (state) => state.city.city
