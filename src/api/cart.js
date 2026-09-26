import { apiClient } from './client.js'

export const fetchMyCart = () => apiClient.get('/cart/me').then((r) => r.data.data)

export const addToCartRequest = (payload) =>
  apiClient.post('/cart/add', payload).then((r) => r.data.data)

export const updateCartItemRequest = (productId, quantity) =>
  apiClient
    .patch(`/cart/items/${productId}`, { quantity })
    .then((r) => r.data.data)

export const removeCartItemRequest = (productId) =>
  apiClient.delete(`/cart/items/${productId}`).then((r) => r.data.data)

export const checkoutRequest = (payload) =>
  apiClient.post('/cart/checkout', payload).then((r) => r.data.data)
