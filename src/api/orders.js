import { apiClient } from './client.js'

export const fetchMyOrders = () => apiClient.get('/orders/me').then((r) => r.data.data)
