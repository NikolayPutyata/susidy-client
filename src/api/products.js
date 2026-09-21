import { apiClient } from './client.js'

export const fetchAllProducts = () =>
  apiClient.get('/products/all').then((r) => r.data.data)

export const fetchProductsByCategory = (category) =>
  apiClient.get(`/products/category/${category}`).then((r) => r.data.data)

export const fetchProductById = (productId) =>
  apiClient.get(`/products/${productId}`).then((r) => r.data.data)
