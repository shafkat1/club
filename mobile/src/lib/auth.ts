import AsyncStorage from '@react-native-async-storage/async-storage'

const AUTH_TOKEN_KEY = '@auth_token'
const REFRESH_TOKEN_KEY = '@refresh_token'
const USER_KEY = '@user'

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

export const setAuthToken = async (token: string) => {
  try {
    await AsyncStorage.setItem(AUTH_TOKEN_KEY, token)
  } catch (error) {
    console.error('Error setting auth token:', error)
  }
}

export const getAuthToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(AUTH_TOKEN_KEY)
  } catch (error) {
    console.error('Error getting auth token:', error)
    return null
  }
}

export const removeAuthToken = async () => {
  try {
    await AsyncStorage.removeItem(AUTH_TOKEN_KEY)
  } catch (error) {
    console.error('Error removing auth token:', error)
  }
}

export const setRefreshToken = async (token: string) => {
  try {
    await AsyncStorage.setItem(REFRESH_TOKEN_KEY, token)
  } catch (error) {
    console.error('Error setting refresh token:', error)
  }
}

export const getRefreshToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(REFRESH_TOKEN_KEY)
  } catch (error) {
    console.error('Error getting refresh token:', error)
    return null
  }
}

export const setUser = async (user: User) => {
  try {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user))
  } catch (error) {
    console.error('Error setting user:', error)
  }
}

export const getUser = async (): Promise<User | null> => {
  try {
    const user = await AsyncStorage.getItem(USER_KEY)
    return user ? JSON.parse(user) : null
  } catch (error) {
    console.error('Error getting user:', error)
    return null
  }
}

export const clearAuth = async () => {
  try {
    await Promise.all([
      AsyncStorage.removeItem(AUTH_TOKEN_KEY),
      AsyncStorage.removeItem(REFRESH_TOKEN_KEY),
      AsyncStorage.removeItem(USER_KEY),
    ])
  } catch (error) {
    console.error('Error clearing auth:', error)
  }
}

export const jwtDecode = (token: string): any => {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch (error) {
    console.error('Failed to decode JWT:', error)
    return null
  }
}

export const isTokenExpired = (token: string): boolean => {
  const decoded = jwtDecode(token)
  if (!decoded || !decoded.exp) return true
  return Date.now() >= decoded.exp * 1000
}
