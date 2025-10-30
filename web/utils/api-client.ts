import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios'

interface ApiConfig {
  baseURL?: string
  timeout?: number
}

/**
 * Direct API Client for Club App NestJS Backend
 * - NO Supabase
 * - NO adapter layer
 * - Direct endpoint mapping
 */
export class ApiClient {
  private client: AxiosInstance
  private accessToken: string | null = null
  private refreshToken: string | null = null
  private isRefreshing = false
  private refreshQueue: Array<() => void> = []

  constructor(config: ApiConfig = {}) {
    const baseURL = config.baseURL || process.env.NEXT_PUBLIC_API_URL || '/api'

    this.client = axios.create({
      baseURL,
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true, // Important for httpOnly cookies
    })

    this.setupInterceptors()
    this.loadTokensFromStorage()
  }

  /**
   * Setup request and response interceptors
   */
  private setupInterceptors(): void {
    // Request interceptor: Add token to headers
    this.client.interceptors.request.use((config) => {
      const token = this.getAccessToken()
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    })

    // Response interceptor: Handle 401 and token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as any

        // Handle 401 - token expired or invalid
        if (
          error.response?.status === 401 &&
          originalRequest &&
          !originalRequest._retry
        ) {
          if (this.isRefreshing) {
            // Token refresh in progress - queue this request
            return new Promise((resolve) => {
              this.refreshQueue.push(() => {
                resolve(this.client(originalRequest))
              })
            })
          }

          originalRequest._retry = true
          this.isRefreshing = true

          try {
            // Attempt to refresh token
            await this.refreshTokenInternal()

            // Process queued requests
            this.refreshQueue.forEach((cb) => cb())
            this.refreshQueue = []
            this.isRefreshing = false

            // Retry original request with new token
            return this.client(originalRequest)
          } catch (refreshError) {
            // Refresh failed - redirect to login
            this.clearTokens()
            if (typeof window !== 'undefined') {
              window.location.href = '/auth/login'
            }
            return Promise.reject(refreshError)
          }
        }

        // Other errors - just reject
        return Promise.reject(error)
      }
    )
  }

  /**
   * Authentication Methods
   */

  async signup(email: string, password: string, displayName?: string) {
    try {
      const response = await this.client.post('/auth/signup', {
        email,
        password,
        displayName,
      })

      this.setTokens(response.data.accessToken, response.data.refreshToken)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  async login(email: string, password: string) {
    try {
      const response = await this.client.post('/auth/login', {
        email,
        password,
      })

      this.setTokens(response.data.accessToken, response.data.refreshToken)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  async logout() {
    try {
      await this.client.post('/auth/logout')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      this.clearTokens()
    }
  }

  private async refreshTokenInternal(): Promise<string> {
    try {
      const response = await this.client.post('/auth/refresh-token', {
        refreshToken: this.refreshToken,
      })

      this.setAccessToken(response.data.accessToken)
      return response.data.accessToken
    } catch (error) {
      this.clearTokens()
      throw this.handleError(error)
    }
  }

  async googleLogin(token: string) {
    try {
      const response = await this.client.post('/auth/google', { token })
      this.setTokens(response.data.accessToken, response.data.refreshToken)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  async facebookLogin(token: string) {
    try {
      const response = await this.client.post('/auth/facebook', { token })
      this.setTokens(response.data.accessToken, response.data.refreshToken)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * Token Management
   */

  private setTokens(accessToken: string, refreshToken: string) {
    this.setAccessToken(accessToken)
    this.refreshToken = refreshToken
    localStorage.setItem('refreshToken', refreshToken)
  }

  private setAccessToken(token: string) {
    this.accessToken = token
    // Store in sessionStorage for page refresh recovery
    sessionStorage.setItem('accessToken', token)
  }

  private getAccessToken(): string | null {
    if (!this.accessToken) {
      // Try to load from sessionStorage (for page refresh)
      this.accessToken = sessionStorage.getItem('accessToken')
    }
    return this.accessToken
  }

  private clearTokens() {
    this.accessToken = null
    this.refreshToken = null
    localStorage.removeItem('refreshToken')
    sessionStorage.removeItem('accessToken')
  }

  private loadTokensFromStorage() {
    this.refreshToken = localStorage.getItem('refreshToken')
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken()
  }

  /**
   * Profile Methods
   */

  async getProfile() {
    const response = await this.client.get('/users/me')
    return response.data
  }

  async updateProfile(data: any) {
    const response = await this.client.put('/users/me', data)
    return response.data
  }

  /**
   * Generic Request Methods
   */

  get(url: string, config?: AxiosRequestConfig) {
    return this.client.get(url, config)
  }

  post(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.client.post(url, data, config)
  }

  put(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.client.put(url, data, config)
  }

  delete(url: string, config?: AxiosRequestConfig) {
    return this.client.delete(url, config)
  }

  /**
   * Error Handling
   */

  private handleError(error: any) {
    if (axios.isAxiosError(error)) {
      return {
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
        error: error.response?.data?.error,
      }
    }
    return error
  }
}

// Export singleton instance
export const apiClient = new ApiClient()
