import { apiClient } from './client.js'

export const loginRequest = (payload) =>
  apiClient.post('/auth/login', payload).then((r) => r.data.data)

export const registerRequest = (payload) =>
  apiClient.post('/auth/register', payload).then((r) => r.data.data)

export const logoutRequest = () => apiClient.post('/auth/logout')

export const refreshRequest = () =>
  apiClient.post('/auth/refresh').then((r) => r.data.data)

export const fetchMe = () => apiClient.get('/auth/me').then((r) => r.data.data)

export const requestResetEmail = (email) =>
  apiClient.post('/auth/request-reset-email', { email })

export const resetPasswordRequest = (payload) =>
  apiClient.post('/auth/reset-password', payload)
