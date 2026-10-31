import { apiClient } from './client.js'

export const loginRequest = (payload) =>
  apiClient.post('/auth/login', payload).then((r) => r.data.data)

export const registerRequest = (payload) =>
  apiClient.post('/auth/register', payload).then((r) => r.data.data)

export const logoutRequest = () => apiClient.post('/auth/logout')

export const refreshRequest = () =>
  apiClient.post('/auth/refresh').then((r) => r.data.data)

export const fetchMe = () => apiClient.get('/auth/me').then((r) => r.data.data)

export const updateMyProfile = (payload) =>
  apiClient.patch('/auth/me', payload).then((r) => r.data.data)

export const updateMyBirthday = (birthday) =>
  apiClient.patch('/auth/me/birthday', { birthday }).then((r) => r.data.data)

export const addMyFavorite = (productId) =>
  apiClient.post(`/auth/me/favorites/${productId}`).then((r) => r.data.data)

export const removeMyFavorite = (productId) =>
  apiClient.delete(`/auth/me/favorites/${productId}`).then((r) => r.data.data)

export const addMySavedAddress = (address) =>
  apiClient.post('/auth/me/addresses', address).then((r) => r.data.data)

export const removeMySavedAddress = (addressId) =>
  apiClient.delete(`/auth/me/addresses/${addressId}`).then((r) => r.data.data)

export const setMyDefaultSavedAddress = (addressId) =>
  apiClient.patch(`/auth/me/addresses/${addressId}/default`).then((r) => r.data.data)

// purpose: 'register' | 'reset' — sends a 6-digit code by SMS
export const requestSmsCodeRequest = (phoneNumber, purpose) =>
  apiClient.post('/auth/sms/send', { phoneNumber, purpose }).then((r) => r.data.data)

export const resetPasswordRequest = (payload) => apiClient.post('/auth/password/reset', payload)
