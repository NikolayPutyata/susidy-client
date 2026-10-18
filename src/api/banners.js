import { apiClient } from './client.js'

export const fetchActiveBanners = () =>
  apiClient.get('/banners').then((r) => r.data.data)
