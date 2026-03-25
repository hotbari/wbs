import axios from 'axios'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080'

export const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
})

// Attach access token to every request
apiClient.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined'
    ? localStorage.getItem('accessToken')
    : null
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// On 401 (unauthenticated), attempt token refresh once then redirect to login
// 403 (forbidden) is NOT retried — it means the user lacks the required role
apiClient.interceptors.response.use(
  (r) => r,
  async (error) => {
    const original = error.config
    const status = error.response?.status
    if (status === 401 && !original._retry) {
      original._retry = true
      try {
        const { data } = await axios.post(`${BASE_URL}/api/auth/refresh`, {}, { withCredentials: true })
        localStorage.setItem('accessToken', data.accessToken)
        original.headers.Authorization = `Bearer ${data.accessToken}`
        return apiClient(original)
      } catch {
        localStorage.removeItem('accessToken')
        if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
          window.location.href = '/login'
        }
      }
    }
    return Promise.reject(error)
  }
)
