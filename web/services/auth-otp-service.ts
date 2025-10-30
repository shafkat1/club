/**
 * OTP Authentication Service
 * Handles phone-based OTP authentication flow for Club App
 * Uses backend endpoints: /auth/phone/send-otp and /auth/phone/verify-otp
 */

import axios from 'axios'

export interface TokenResponse {
  accessToken: string
  refreshToken: string
  user: UserProfile
  expiresIn?: number
}

export interface UserProfile {
  id: string
  email?: string
  phone?: string
  displayName?: string
  profileImage?: string
  createdAt?: string
}

export interface SendOtpResponse {
  message: string
  otpSent?: boolean
}

class OtpAuthService {
  private apiBaseUrl: string

  constructor() {
    // Use the same base URL as apiClient
    this.apiBaseUrl = typeof window !== 'undefined'
      ? (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api')
      : 'http://localhost:3000/api'
  }

  /**
   * Send OTP to phone number
   * @param phoneNumber - Phone number in format: +1234567890
   * @returns Promise with success message
   */
  async sendOtp(phoneNumber: string): Promise<SendOtpResponse> {
    try {
      console.log(`📱 Sending OTP to ${phoneNumber}...`)
      
      const response = await axios.post(`${this.apiBaseUrl}/auth/phone/send-otp`, {
        phone: phoneNumber,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      })

      console.log('✅ OTP sent successfully')
      return response.data
    } catch (error) {
      console.error('❌ Error sending OTP:', error)
      throw this.handleError(error)
    }
  }

  /**
   * Verify OTP code and get JWT tokens
   * @param phoneNumber - Phone number where OTP was sent
   * @param code - 6-digit OTP code
   * @returns Promise with tokens and user profile
   */
  async verifyOtp(phoneNumber: string, code: string): Promise<TokenResponse> {
    try {
      console.log(`🔐 Verifying OTP for ${phoneNumber}...`)
      
      const response = await axios.post(`${this.apiBaseUrl}/auth/phone/verify-otp`, {
        phone: phoneNumber,
        code,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      })

      console.log('✅ OTP verified successfully')
      
      // Ensure response has required fields
      if (!response.data.accessToken || !response.data.refreshToken) {
        throw new Error('Invalid response: missing tokens')
      }

      return response.data
    } catch (error) {
      console.error('❌ Error verifying OTP:', error)
      throw this.handleError(error)
    }
  }

  /**
   * Social login (Google, Facebook, etc.)
   * @param provider - Social provider name
   * @param accessToken - Social provider access token
   * @returns Promise with JWT tokens and user profile
   */
  async socialLogin(
    provider: 'google' | 'facebook' | 'instagram' | 'apple' | 'tiktok' | 'snapchat' | 'twitter',
    accessToken: string
  ): Promise<TokenResponse> {
    try {
      console.log(`🔐 Logging in with ${provider}...`)
      
      const response = await axios.post(`${this.apiBaseUrl}/auth/social/login`, {
        provider,
        accessToken,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      })

      console.log(`✅ ${provider} login successful`)
      return response.data
    } catch (error) {
      console.error(`❌ Error with ${provider} login:`, error)
      throw this.handleError(error)
    }
  }

  /**
   * Refresh JWT tokens
   * @param refreshToken - Refresh token from initial login/signup
   * @returns Promise with new access token
   */
  async refreshToken(refreshToken: string): Promise<{ accessToken: string; expiresIn?: number }> {
    try {
      console.log('🔄 Refreshing token...')
      
      const response = await axios.post(`${this.apiBaseUrl}/auth/refresh-token`, {
        refreshToken,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      })

      console.log('✅ Token refreshed successfully')
      return response.data
    } catch (error) {
      console.error('❌ Error refreshing token:', error)
      throw this.handleError(error)
    }
  }

  /**
   * Get current user profile (requires valid JWT)
   * @param accessToken - Valid JWT access token
   * @returns Promise with user profile
   */
  async getCurrentUser(accessToken: string): Promise<UserProfile> {
    try {
      console.log('👤 Fetching current user...')
      
      const response = await axios.get(`${this.apiBaseUrl}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      })

      console.log('✅ User fetched successfully')
      return response.data
    } catch (error) {
      console.error('❌ Error fetching user:', error)
      throw this.handleError(error)
    }
  }

  /**
   * Handle API errors and return user-friendly messages
   */
  private handleError(error: any): Error {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status
      const message = error.response?.data?.message || error.message
      const errorCode = error.response?.data?.error

      console.error(`API Error [${status}]: ${message}`)

      // User-friendly error messages
      let userMessage = message

      if (status === 400) {
        userMessage = 'Invalid request. Please check your input.'
      } else if (status === 401) {
        userMessage = 'Invalid OTP code or phone number. Please try again.'
      } else if (status === 404) {
        userMessage = 'Resource not found.'
      } else if (status === 429) {
        userMessage = 'Too many attempts. Please try again later.'
      } else if (status === 500) {
        userMessage = 'Server error. Please try again later.'
      } else if (status === 0) {
        userMessage = 'Network error. Please check your internet connection.'
      }

      return new Error(userMessage)
    }

    return error instanceof Error ? error : new Error('Unknown error occurred')
  }
}

// Export singleton instance
export const otpAuthService = new OtpAuthService()

// Export class for testing
export { OtpAuthService }
