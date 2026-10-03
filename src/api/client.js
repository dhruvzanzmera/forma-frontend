import axios from 'axios'

export const TOKEN_KEY = 'atelier_access_token'
export const USER_KEY = 'atelier_current_user'

let activeRequests = 0
const listeners = new Set()

const notifyListeners = () => {
  listeners.forEach((listener) => {
    try {
      listener(activeRequests)
    } catch (e) {
      console.error('[ApiLoader] listener error:', e)
    }
  })
}

export const subscribeToApiLoading = (callback) => {
  listeners.add(callback)
  callback(activeRequests)
  return () => {
    listeners.delete(callback)
  }
}

export const getActiveRequestCount = () => activeRequests

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use(
  (config) => {
    activeRequests += 1
    notifyListeners()
    const token = localStorage.getItem(TOKEN_KEY)
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => {
    activeRequests = Math.max(0, activeRequests - 1)
    notifyListeners()
    return Promise.reject(error)
  },
)

api.interceptors.response.use(
  (response) => {
    activeRequests = Math.max(0, activeRequests - 1)
    notifyListeners()
    return response.data
  },
  (error) => {
    activeRequests = Math.max(0, activeRequests - 1)
    notifyListeners()
    const status = error.response?.status
    if (status === 401) {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
      window.dispatchEvent(new Event('atelier:unauthorized'))
    }
    const messages = {
      400: 'Please check the information you entered and try again.',
      401: 'Your email or password is incorrect, or your session has expired.',
      403: 'You do not have permission to do that.',
      404: 'We could not find what you were looking for.',
      409: 'This information is already in use. Please check and try again.',
      422: 'Please check the information you entered and try again.',
      429: 'Too many attempts. Please wait a moment and try again.',
      502: 'Email delivery failed. Your account may already exist; continue to verification and resend the code.',
    }
    const message = messages[status]
      || (status >= 500 ? 'The service is having trouble. Please try again shortly.' : '')
      || (error.code === 'ERR_NETWORK' ? 'Unable to reach the store. Check your connection and try again.' : 'Something went wrong. Please try again.')
    return Promise.reject(Object.assign(new Error(message), { status, details: error.response?.data?.errors }))
  },
)

export default api