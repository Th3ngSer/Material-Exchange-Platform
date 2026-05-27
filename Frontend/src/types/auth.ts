export interface User {
  id: string
  email: string
  name?: string
  username?: string
  gender?: string
  phone?: string
  nationality?: string
  birthDate?: string
  avatar?: string
  role?: string
  status?: string
  listingsCount?: number
  rating?: number
  createdAt?: string
  updatedAt?: string
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
  name?: string
}

/**
 * Authentication response from backend
 */
export interface AuthResponse {
  accessToken: string
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
