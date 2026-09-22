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

export const useAuth = () => {
  const dispatch = useAppDispatch()
  const user = useAppSelector(selectUser)
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const isAdmin = useAppSelector(selectIsAdmin)
  const initializing = useAppSelector(selectAuthInitializing)

  const login = useCallback(
    (payload) => dispatch(loginThunk(payload)).unwrap(),
    [dispatch],
  )

  const register = useCallback(
    (payload) => dispatch(registerThunk(payload)).unwrap(),
    [dispatch],
  )

  const logout = useCallback(() => dispatch(logoutThunk()).unwrap(), [dispatch])

  return { user, isAuthenticated, isAdmin, initializing, login, register, logout }
}
