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
    name?: string
    username?: string
    gender?: string
    phone?: string
    nationality?: string
    birthDate?: string
    role?: string
    createdAt: string
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
    access_token?: string
    accessToken?: string
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
