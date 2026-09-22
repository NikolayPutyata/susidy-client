import { apiClient } from './client.js'

export const fetchCart = (cartId) =>
  apiClient.get(`/cart/${cartId}`).then((r) => r.data.data)

export const fetchMyCart = () =>
  apiClient.get('/cart/me').then((r) => r.data.data)

export const addToCartRequest = (payload) =>
  apiClient.post('/cart/add', payload).then((r) => r.data.data)

export const updateCartItemRequest = (cartId, payload) =>
  apiClient.patch(`/cart/${cartId}`, payload).then((r) => r.data.data)

export const removeCartItemRequest = (cartId, payload) =>
  apiClient
    .delete(`/cart/${cartId}`, { data: payload })
    .then((r) => r.data.data)

export const checkoutRequest = (payload) =>
  apiClient.post('/cart/checkout', payload).then((r) => r.data.data)
