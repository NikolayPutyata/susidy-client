import { createSlice } from '@reduxjs/toolkit'

// Видимість модалок, які раніше були окремими сторінками (логін, реєстрація,
// мої замовлення) — тепер відкриваються поверх поточної сторінки, так само
// як кошик (cartSlice.isDrawerOpen). Оформлення замовлення — знову окрема
// сторінка (/checkout), не в цьому списку.
const initialState = {
  loginOpen: false,
  registerOpen: false,
  myOrdersOpen: false,
  profileOpen: false,
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    openLogin(state) {
      state.loginOpen = true
      state.registerOpen = false
    },
    closeLogin(state) {
      state.loginOpen = false
    },
    openRegister(state) {
      state.registerOpen = true
      state.loginOpen = false
    },
    closeRegister(state) {
      state.registerOpen = false
    },
    openMyOrders(state) {
      state.myOrdersOpen = true
    },
    closeMyOrders(state) {
      state.myOrdersOpen = false
    },
    openProfile(state) {
      state.profileOpen = true
    },
    closeProfile(state) {
      state.profileOpen = false
    },
  },
})

export const {
  openLogin,
  closeLogin,
  openRegister,
  closeRegister,
  openMyOrders,
  closeMyOrders,
  openProfile,
  closeProfile,
} = uiSlice.actions
export default uiSlice.reducer

export const selectLoginOpen = (state) => state.ui.loginOpen
export const selectRegisterOpen = (state) => state.ui.registerOpen
export const selectMyOrdersOpen = (state) => state.ui.myOrdersOpen
export const selectProfileOpen = (state) => state.ui.profileOpen
