import { useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '../store/hooks.js'
import {
  login as loginThunk,
  logout as logoutThunk,
  registerUser as registerThunk,
  selectAuthInitializing,
  selectIsAdmin,
  selectIsAuthenticated,
  selectUser,
} from '../store/userSlice.js'
import { discardGuestCart, loadMyCart } from '../store/cartSlice.js'

export const useAuth = () => {
  const dispatch = useAppDispatch()
  const user = useAppSelector(selectUser)
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const isAdmin = useAppSelector(selectIsAdmin)
  const initializing = useAppSelector(selectAuthInitializing)

  const login = useCallback(
    async (payload) => {
      const loggedInUser = await dispatch(loginThunk(payload)).unwrap()
      // Свідоме рішення: жодного злиття кошиків. Що б не лежало в
      // гостьовому кошику до логіну — воно відкидається, і завантажується
      // кошик з БД цього акаунта (порожній, якщо там нічого немає).
      dispatch(discardGuestCart())
      dispatch(loadMyCart())
      return loggedInUser
    },
    [dispatch],
  )

  const register = useCallback(
    (payload) => dispatch(registerThunk(payload)).unwrap(),
    [dispatch],
  )

  const logout = useCallback(() => dispatch(logoutThunk()).unwrap(), [dispatch])

  return { user, isAuthenticated, isAdmin, initializing, login, register, logout }
}
