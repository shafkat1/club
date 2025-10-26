import axios, { AxiosInstance } from 'axios'
import { getAuthToken } from './auth'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add JWT token to all requests
apiClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Handle 401 errors and redirect to login
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth and redirect to login
      localStorage.removeItem('authToken')
      localStorage.removeItem('refreshToken')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth endpoints
export const authAPI = {
  sendOtp: (phone: string) =>
    apiClient.post('/auth/phone/send-otp', { phone }),
  verifyOtp: (phone: string, code: string) =>
    apiClient.post('/auth/phone/verify-otp', { phone, code }),
  refreshToken: (refreshToken: string) =>
    apiClient.post('/auth/refresh-token', { refreshToken }),
  getCurrentUser: () => apiClient.get('/auth/me'),
}

// Orders endpoints
export const ordersAPI = {
  list: (status?: string, limit?: number, offset?: number) =>
    apiClient.get('/orders', { params: { status, limit, offset } }),
  getDetails: (orderId: string) =>
    apiClient.get(`/orders/${orderId}`),
  generateQR: (orderId: string) =>
    apiClient.post(`/orders/${orderId}/generate-qr`),
  updateStatus: (orderId: string, status: string, reason?: string) =>
    apiClient.post(`/orders/${orderId}/status`, { status, reason }),
}

// Redemptions endpoints
export const redemptionsAPI = {
  redeem: (redemptionId: string) =>
    apiClient.post(`/orders/redeem/${redemptionId}`),
}

// Venues endpoints
export const venuesAPI = {
  getDetails: (venueId: string) =>
    apiClient.get(`/venues/${venueId}`),
}

export default apiClient
