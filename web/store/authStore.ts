import { create } from 'zustand'
import { apiClient } from '@/utils/api-client'
import { getErrorMessage } from '@/utils/error-handler'

export interface User {
  id: string
  email: string
  displayName: string
  profileImage?: string
  bio?: string
  age?: number
  interests?: string[]
  preferredDrinks?: string[]
  phoneVerified?: boolean
  emailVerified?: boolean
  stats?: {
    drinksReceived?: number
    drinksGiven?: number
    rating?: number
    reviewCount?: number
  }
}

export interface AuthState {
  // State
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null

  // Actions
  signup: (
    email: string,
    password: string,
    displayName?: string
  ) => Promise<void>
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refreshSession: () => Promise<void>
  setUser: (user: User | null) => void
  clearError: () => void
  loadUser: () => Promise<void>

  // Getters
  isLogged: () => boolean
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  signup: async (email, password, displayName) => {
    set({ isLoading: true, error: null })
    try {
      const result = await apiClient.signup(email, password, displayName)
      set({
        user: result.user,
        isAuthenticated: true,
        isLoading: false,
      })
    } catch (error) {
      set({
        error: getErrorMessage(error),
        isLoading: false,
      })
      throw error
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null })
    try {
      const result = await apiClient.login(email, password)
      set({
        user: result.user,
        isAuthenticated: true,
        isLoading: false,
      })
    } catch (error) {
      set({
        error: getErrorMessage(error),
        isLoading: false,
      })
      throw error
    }
  },

  logout: async () => {
    set({ isLoading: true, error: null })
    try {
      await apiClient.logout()
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      })
    } catch (error) {
      set({
        error: getErrorMessage(error),
        isLoading: false,
      })
    }
  },

  refreshSession: async () => {
    try {
      await apiClient.refreshTokenInternal?.()
    } catch (error) {
      set({
        user: null,
        isAuthenticated: false,
        error: getErrorMessage(error),
      })
    }
  },

  setUser: (user) => {
    set({
      user,
      isAuthenticated: !!user,
    })
  },

  clearError: () => {
    set({ error: null })
  },

  loadUser: async () => {
    set({ isLoading: true })
    try {
      const user = await apiClient.getProfile()
      set({
        user,
        isAuthenticated: true,
        isLoading: false,
      })
    } catch (error) {
      set({
        isAuthenticated: false,
        isLoading: false,
      })
    }
  },

  isLogged: () => {
    const { isAuthenticated } = get()
    return isAuthenticated
  },
}))
