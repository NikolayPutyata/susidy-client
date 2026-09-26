import { apiClient } from './client.js'

export const createAdminProduct = (formData) =>
  apiClient
    .post('/admin/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((r) => r.data.data)

export const updateAdminProduct = (id, formData) =>
  apiClient
    .patch(`/admin/products/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((r) => r.data.data)

export const deleteAdminProduct = (id) => apiClient.delete(`/admin/products/${id}`)

export const fetchAdminUsers = (params) =>
  apiClient.get('/admin/users', { params }).then((r) => r.data)

export const searchAdminUsers = (phone) =>
  apiClient
    .get('/admin/users/search', { params: { phone } })
    .then((r) => r.data.data)

export const updateUserDiscountRequest = (id, discount) =>
  apiClient
    .patch(`/admin/users/${id}/discount`, { discount })
    .then((r) => r.data.data)

export const fetchTodayOrders = () =>
  apiClient.get('/admin/orders/today').then((r) => r.data.data)

export const searchAdminOrders = (phone) =>
  apiClient
    .get('/admin/orders/search', { params: { phone } })
    .then((r) => r.data.data)

// Токен доступу лежить лише в пам'яті (не в localStorage), тому просте
// посилання <a href> на цей ендпоінт не надішле Authorization — потрібен
// звичайний axios-запит з blob-відповіддю.
export const exportAdminUsers = (params) =>
  apiClient
    .get('/admin/users/export', { params, responseType: 'blob' })
    .then((r) => r.data)
