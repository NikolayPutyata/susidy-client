import axios from 'axios'

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  withCredentials: true,
})

let accessToken = null
let refreshPromise = null
let onUnauthorized = () => {}

export const setAccessToken = (token) => {
  accessToken = token
}

export const setUnauthorizedHandler = (handler) => {
  onUnauthorized = handler
}

apiClient.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error

    const isRefreshCall = config?.url?.includes('/auth/refresh')
    if (response?.status !== 401 || !config || config._retried || isRefreshCall) {
      return Promise.reject(error)
    }

    config._retried = true

    if (!refreshPromise) {
      refreshPromise = apiClient
        .post('/auth/refresh')
        .then(({ data }) => {
          setAccessToken(data.data.accessToken)
          return data.data.accessToken
        })
        .catch((err) => {
          setAccessToken(null)
          onUnauthorized()
          throw err
        })
        .finally(() => {
          refreshPromise = null
        })
    }

    try {
      const token = await refreshPromise
      config.headers.Authorization = `Bearer ${token}`
      return apiClient(config)
    } catch {
      return Promise.reject(error)
    }
  },
)
