import { configureStore } from '@reduxjs/toolkit'
import userReducer from './userSlice.js'
import cartReducer from './cartSlice.js'
import cityReducer from './citySlice.js'
import uiReducer from './uiSlice.js'
import addonsReducer from './addonsSlice.js'

export const store = configureStore({
  reducer: {
    user: userReducer,
    cart: cartReducer,
    city: cityReducer,
    ui: uiReducer,
    addons: addonsReducer,
  },
})
