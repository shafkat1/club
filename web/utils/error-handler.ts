import axios from 'axios'

export interface ApiError {
  status?: number
  message: string
  error?: string
}

/**
 * Unified error handler for API errors
 */
export function handleApiError(error: any): ApiError {
  if (error?.status) {
    return {
      status: error.status,
      message: error.message || 'An error occurred',
      error: error.error,
    }
  }

  if (error?.response?.status) {
    return {
      status: error.response.status,
      message: error.response.data?.message || error.message,
      error: error.response.data?.error,
    }
  }

  if (axios.isAxiosError(error)) {
    return {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      error: error.response?.data?.error,
    }
  }

  return {
    status: 500,
    message: error?.message || 'An unexpected error occurred',
  }
}

/**
 * Get user-friendly error message
 */
export function getErrorMessage(error: any): string {
  const apiError = handleApiError(error)

  switch (apiError.status) {
    case 400:
      return 'Invalid input - please check your details'
    case 401:
      return 'Unauthorized - please log in again'
    case 403:
      return 'You do not have permission for this action'
    case 404:
      return 'Resource not found'
    case 409:
      return 'This resource already exists'
    case 429:
      return 'Too many requests - please try again later'
    case 500:
      return 'Server error - please try again later'
    case 503:
      return 'Service unavailable - please try again later'
    default:
      return apiError.message || 'An error occurred'
  }
}

/**
 * Log error for debugging
 */
export function logError(error: any, context?: string) {
  const apiError = handleApiError(error)
  console.error(
    `[${context || 'API Error'}] Status: ${apiError.status}, Message: ${apiError.message}`,
    error
  )
}
