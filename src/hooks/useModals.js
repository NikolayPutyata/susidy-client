import { useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '../store/hooks.js'
import {
  closeLogin,
  closeMyOrders,
  closeProfile,
  closeRegister,
  openLogin,
  openMyOrders,
  openProfile,
  openRegister,
  selectLoginOpen,
  selectMyOrdersOpen,
  selectProfileOpen,
  selectRegisterOpen,
} from '../store/uiSlice.js'

// Централізований стан для модалок, які раніше були окремими сторінками
// (логін, реєстрація, мої замовлення) — будь-який компонент може відкрити
// потрібну, не тримаючи цей стан у себе.
export const useModals = () => {
  const dispatch = useAppDispatch()

  return {
    loginOpen: useAppSelector(selectLoginOpen),
    registerOpen: useAppSelector(selectRegisterOpen),
    myOrdersOpen: useAppSelector(selectMyOrdersOpen),
    profileOpen: useAppSelector(selectProfileOpen),
    openLogin: useCallback(() => dispatch(openLogin()), [dispatch]),
    closeLogin: useCallback(() => dispatch(closeLogin()), [dispatch]),
    openRegister: useCallback(() => dispatch(openRegister()), [dispatch]),
    closeRegister: useCallback(() => dispatch(closeRegister()), [dispatch]),
    openMyOrders: useCallback(() => dispatch(openMyOrders()), [dispatch]),
    closeMyOrders: useCallback(() => dispatch(closeMyOrders()), [dispatch]),
    openProfile: useCallback(() => dispatch(openProfile()), [dispatch]),
    closeProfile: useCallback(() => dispatch(closeProfile()), [dispatch]),
  }
}
