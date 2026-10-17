import { apiClient } from './client.js'

// Live "this point will prepare your order" hint while picking a delivery
// address — not authoritative, the server recomputes this itself at
// checkout from the submitted coordinates.
export const fetchNearestPoint = ({ lat, lng, city }) =>
  apiClient.get('/locations/nearest', { params: { lat, lng, city } }).then((r) => r.data.data)
