/**
 * API Service
 * Centralized configuration for backend API calls
 */

import type { AuthResponse, LoginCredentials, RegisterCredentials, ApiError } from '@/types/auth'

// Backend API base URL - adjust if your backend runs on a different port/host
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

/**
 * Parse error response from API
 */
function parseErrorMessage(error: unknown): string {
    if (error instanceof TypeError) {
        return 'Oops! We could not reach the server. Please check your connection and try again.'
    }

    if (error instanceof Response) {
        return 'An error occurred. Please try again.'
    }

    if (typeof error === 'object' && error !== null) {
        const apiError = error as ApiError
        if (typeof apiError.message === 'string') {
            return apiError.message
        }
        if (Array.isArray(apiError.message)) {
            return apiError.message[0] || 'An error occurred'
        }
    }

    return 'An unexpected error occurred. Please try again.'
}

/**
 * Authentication API Service
 */
export const authApi = {
    /**
     * Login with email and password
     * @param credentials - Email and password
     * @returns Authentication response with token and user data
     * @throws Error with user-friendly message
     */
    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials),
            })

            if (!response.ok) {
                const error = await response.json().catch(() => ({}))
                throw {
                    statusCode: response.status,
                    message: error.message || 'Login failed. Please check your credentials.',
                }
            }

            return await response.json()
        } catch (error) {
            throw new Error(parseErrorMessage(error))
        }
    },

    /**
     * Register a new user
     * @param credentials - Email, password, and confirm password
     * @returns Authentication response with token and user data
     * @throws Error with user-friendly message
     */
    async register(credentials: RegisterCredentials): Promise<AuthResponse> {
        try {
            // Remove confirmPassword before sending to backend
            const { confirmPassword, ...data } = credentials

            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            })

            if (!response.ok) {
                const error = await response.json().catch(() => ({}))
                throw {
                    statusCode: response.status,
                    message: error.message || 'Registration failed. Please try again.',
                }
            }

            return await response.json()
        } catch (error) {
            throw new Error(parseErrorMessage(error))
        }
    },
}
