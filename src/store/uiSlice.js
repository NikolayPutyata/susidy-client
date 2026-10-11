import { createSlice } from '@reduxjs/toolkit'

// Видимість модалок, які раніше були окремими сторінками (логін, реєстрація,
// мої замовлення, оформлення замовлення) — тепер відкриваються поверх
// поточної сторінки, так само як кошик (cartSlice.isDrawerOpen).
const initialState = {
  loginOpen: false,
  registerOpen: false,
  myOrdersOpen: false,
  checkoutOpen: false,
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
    openCheckout(state) {
      state.checkoutOpen = true
    },
    closeCheckout(state) {
      state.checkoutOpen = false
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
  openCheckout,
  closeCheckout,
  openProfile,
  closeProfile,
} = uiSlice.actions
export default uiSlice.reducer

export const selectLoginOpen = (state) => state.ui.loginOpen
export const selectRegisterOpen = (state) => state.ui.registerOpen
export const selectMyOrdersOpen = (state) => state.ui.myOrdersOpen
export const selectCheckoutOpen = (state) => state.ui.checkoutOpen
export const selectProfileOpen = (state) => state.ui.profileOpen
