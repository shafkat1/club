import axios from 'axios'
import { getAuthToken } from './auth'

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api'

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add request interceptor to include auth token
apiClient.interceptors.request.use(
  async (config) => {
    const token = await getAuthToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// API endpoints
export const authAPI = {
  login: async (email: string, password: string) => {
    // TODO: Implement login API call
    const response = await apiClient.post('/auth/login', { email, password })
    return response.data
  },

  register: async (email: string, password: string, name: string) => {
    // TODO: Implement register API call
    const response = await apiClient.post('/auth/register', { email, password, name })
    return response.data
  },

  logout: async () => {
    // TODO: Implement logout API call
    return { success: true }
  },

  refreshToken: async (refreshToken: string) => {
    // TODO: Implement token refresh API call
    const response = await apiClient.post('/auth/refresh', { refreshToken })
    return response.data
  },
}

export const venueAPI = {
  getNearbyVenues: async (latitude: number, longitude: number, radius = 5000) => {
    // TODO: Implement get nearby venues API call
    const response = await apiClient.get('/venues/nearby', {
      params: { latitude, longitude, radius },
    })
    return response.data
  },

  getVenueDetails: async (venueId: string) => {
    // TODO: Implement get venue details API call
    const response = await apiClient.get(`/venues/${venueId}`)
    return response.data
  },
}

export const groupAPI = {
  listGroups: async () => {
    // TODO: Implement list groups API call
    const response = await apiClient.get('/groups')
    return response.data
  },

  createGroup: async (name: string, members: string[]) => {
    // TODO: Implement create group API call
    const response = await apiClient.post('/groups', { name, members })
    return response.data
  },
}

export default apiClient
