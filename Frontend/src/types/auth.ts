/**
 * Authentication Types and Interfaces
 * Defines the structure for authentication-related data
 */

/**
 * User object returned from backend
 */
export interface User {
  id: string
  email: string
  createdAt: string
}

/**
 * Login credentials sent to backend
 */
export interface LoginCredentials {
  email: string
  password: string
}

/**
 * Registration data sent to backend
 */
export interface RegisterCredentials extends LoginCredentials {
  confirmPassword?: string
}

/**
 * Authentication response from backend
 */
export interface AuthResponse {
  access_token: string
  user: User
}

/**
 * Auth state in Pinia store
 */
export interface AuthState {
  user: User | null
  isLoading: boolean
  error: string | null
  isAuthenticated: boolean
}

/**
 * API error response structure
 */
export interface ApiError {
  statusCode: number
  message: string | string[]
  error?: string
}
