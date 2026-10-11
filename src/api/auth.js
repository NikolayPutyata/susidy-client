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
