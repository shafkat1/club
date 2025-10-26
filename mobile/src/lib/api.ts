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

// ============================================
// AUTH API
// ============================================
export const authAPI = {
  // Send OTP to phone
  sendOtp: async (phone: string) => {
    const response = await apiClient.post('/auth/phone/send-otp', { phone })
    return response.data
  },

  // Verify OTP and login
  verifyOtp: async (phone: string, code: string) => {
    const response = await apiClient.post('/auth/phone/verify-otp', { phone, code })
    return response.data
  },

  // Refresh auth token
  refreshToken: async (refreshToken: string) => {
    const response = await apiClient.post('/auth/refresh-token', { refreshToken })
    return response.data
  },

  // Get current user profile
  getCurrentUser: async () => {
    const response = await apiClient.get('/auth/me')
    return response.data
  },

  // Social login
  socialLogin: async (provider: string, accessToken: string, idToken?: string) => {
    const response = await apiClient.post('/auth/social/login', {
      provider,
      accessToken,
      idToken,
    })
    return response.data
  },
}

// ============================================
// VENUES API
// ============================================
export const venueAPI = {
  // Search venues by location
  searchVenues: async (latitude: number, longitude: number, radius = 5000) => {
    const response = await apiClient.post('/venues/search', {
      latitude,
      longitude,
      radius,
    })
    return response.data
  },

  // Get venue details
  getVenueDetails: async (venueId: string) => {
    const response = await apiClient.get(`/venues/${venueId}`)
    return response.data
  },

  // Set user presence at venue
  setPresence: async (venueId: string, role: 'buyer' | 'receiver' | 'bartender') => {
    const response = await apiClient.post('/venues/presence/set', {
      venueId,
      role,
    })
    return response.data
  },

  // Clear presence from venue
  clearPresence: async (venueId: string) => {
    const response = await apiClient.post('/venues/presence/clear', undefined, {
      params: { venueId },
    })
    return response.data
  },

  // Get venue presence (buyer/receiver counts)
  getVenuePresence: async (venueId: string) => {
    const response = await apiClient.get(`/venues/${venueId}/presence`)
    return response.data
  },
}

// ============================================
// GROUPS API
// ============================================
export const groupAPI = {
  // Create new group
  createGroup: async (name?: string) => {
    const response = await apiClient.post('/groups', { name })
    return response.data
  },

  // Get user's groups
  listGroups: async () => {
    const response = await apiClient.get('/groups')
    return response.data
  },

  // Get group details
  getGroupDetails: async (groupId: string) => {
    const response = await apiClient.get(`/groups/${groupId}`)
    return response.data
  },

  // Add member to group
  addMember: async (groupId: string, userId: string) => {
    const response = await apiClient.post(`/groups/${groupId}/members`, { userId })
    return response.data
  },

  // Remove member from group
  removeMember: async (groupId: string, userId: string) => {
    const response = await apiClient.delete(`/groups/${groupId}/members/${userId}`)
    return response.data
  },

  // Leave group
  leaveGroup: async (groupId: string) => {
    const response = await apiClient.post(`/groups/${groupId}/leave`)
    return response.data
  },

  // Set group venue
  setGroupVenue: async (groupId: string, venueId: string) => {
    const response = await apiClient.patch(`/groups/${groupId}/venue`, { venueId })
    return response.data
  },

  // Clear group venue
  clearGroupVenue: async (groupId: string) => {
    const response = await apiClient.post(`/groups/${groupId}/venue/clear`)
    return response.data
  },
}

// ============================================
// ORDERS API
// ============================================
export const ordersAPI = {
  // Create drink order
  createOrder: async (
    recipientId: string,
    venueId: string,
    quantity: number = 1,
    amount: number,
    notes?: string,
  ) => {
    const response = await apiClient.post('/orders', {
      recipientId,
      venueId,
      quantity,
      amount,
      notes,
    })
    return response.data
  },

  // Get user's orders
  listOrders: async (status?: string, limit?: number, offset?: number) => {
    const response = await apiClient.get('/orders', {
      params: { status, limit, offset },
    })
    return response.data
  },

  // Get order details
  getOrderDetails: async (orderId: string) => {
    const response = await apiClient.get(`/orders/${orderId}`)
    return response.data
  },

  // Confirm payment
  confirmPayment: async (orderId: string) => {
    const response = await apiClient.post(`/orders/${orderId}/confirm-payment`)
    return response.data
  },

  // Update order status
  updateOrderStatus: async (orderId: string, status: string) => {
    const response = await apiClient.post(`/orders/${orderId}/status`, { status })
    return response.data
  },

  // Generate QR code for redemption
  generateRedemptionQR: async (orderId: string) => {
    const response = await apiClient.post(`/orders/${orderId}/generate-qr`)
    return response.data
  },

  // Redeem order via QR code
  redeemOrder: async (redemptionId: string) => {
    const response = await apiClient.post(`/orders/redeem/${redemptionId}`)
    return response.data
  },
}

export default apiClient
