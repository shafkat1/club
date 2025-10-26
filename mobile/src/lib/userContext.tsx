import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { getAuthToken, getUser, setUser, clearAuth, isTokenExpired, getRefreshToken } from './auth'
import { authAPI } from './api'

export interface User {
  id: string
  phone?: string
  email?: string
  displayName?: string
  profileImage?: string
  phoneVerified: boolean
  emailVerified: boolean
  createdAt: Date
}

interface UserContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (phone: string, otp: string) => Promise<void>
  logout: () => Promise<void>
  updateUser: (user: User) => Promise<void>
  refreshUserProfile: () => Promise<void>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUserState] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Initialize user on app load
  useEffect(() => {
    initializeAuth()
  }, [])

  const initializeAuth = async () => {
    try {
      setIsLoading(true)

      // Check if token exists
      const token = await getAuthToken()
      if (!token) {
        setIsLoading(false)
        return
      }

      // Check if token is expired
      if (isTokenExpired(token)) {
        // Try to refresh token
        const refreshToken = await getRefreshToken()
        if (refreshToken) {
          try {
            const response = await authAPI.refreshToken(refreshToken)
            // Tokens will be set by the API client
          } catch (error) {
            // Refresh failed, clear auth
            await clearAuth()
            setUserState(null)
            setIsLoading(false)
            return
          }
        }
      }

      // Fetch user profile
      try {
        const profile = await authAPI.getCurrentUser()
        setUserState(profile)
      } catch (error) {
        console.error('Failed to fetch user profile:', error)
        await clearAuth()
        setUserState(null)
      }
    } catch (error) {
      console.error('Auth initialization error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (phone: string, otp: string) => {
    try {
      setIsLoading(true)
      const response = await authAPI.verifyOtp(phone, otp)
      setUserState(response.user)
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      setIsLoading(true)
      await clearAuth()
      setUserState(null)
    } finally {
      setIsLoading(false)
    }
  }

  const updateUser = async (updatedUser: User) => {
    setUserState(updatedUser)
    await setUser(updatedUser)
  }

  const refreshUserProfile = async () => {
    try {
      const profile = await authAPI.getCurrentUser()
      setUserState(profile)
      await setUser(profile)
    } catch (error) {
      console.error('Failed to refresh user profile:', error)
      throw error
    }
  }

  return (
    <UserContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        updateUser,
        refreshUserProfile,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUser must be used within UserProvider')
  }
  return context
}
