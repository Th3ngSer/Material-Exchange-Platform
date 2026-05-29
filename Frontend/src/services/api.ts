import axios from 'axios'
import { getToken, clearToken } from '@/utils/tokenStorage'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Global 401 handler — if any API call is rejected as unauthorized,
// clear the token and redirect to login so the user can re-authenticate.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearToken()
      // Lazy-import to avoid circular dependency with router
      import('@/stores/auth').then(({ useAuthStore }) => {
        const store = useAuthStore()
        store.logout()
      })
      import('@/router').then(({ default: router }) => {
        if (router.currentRoute.value.name !== 'login') {
          router.push({ name: 'login' })
        }
      })
    }
    return Promise.reject(error)
  }
)

export default api