/**
 * Pinia Auth Store
 * Manages authentication state and operations
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '@/services/auth'
import type { AuthState, User, LoginCredentials, RegisterCredentials } from '@/types/auth'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Computed
  const isAuthenticated = computed(() => user.value !== null)
  const token = computed(() => sessionStorage.getItem('authToken'))

  /**
   * Get current auth state (for debugging/monitoring)
   */
  const state = computed<AuthState>(() => ({
    user: user.value,
    isLoading: isLoading.value,
    error: error.value,
    isAuthenticated: isAuthenticated.value,
  }))

  /**
   * Login user with email and password
   * @param credentials - Email and password
   */
  async function login(credentials: LoginCredentials) {
    isLoading.value = true
    error.value = null

    try {
      const response = await authApi.login(credentials)

      // Store user data
      user.value = response.user

      // Store token per-tab
      sessionStorage.setItem('authToken', response.accessToken)

      return response
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred during login'
      error.value = errorMessage
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Register a new user
   * @param credentials - Email, password, and confirm password
   */
  async function register(credentials: RegisterCredentials) {
    isLoading.value = true
    error.value = null

    try {
      const response = await authApi.register(credentials)

      // Store user data
      user.value = response.user

      // Store token per-tab
      sessionStorage.setItem('authToken', response.accessToken)

      return response
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'An error occurred during registration'
      error.value = errorMessage
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Logout user
   * Clears user data and token
   */
  function logout() {
    user.value = null
    error.value = null
    sessionStorage.removeItem('authToken')
  }

  /**
   * Clear error message
   */
  function clearError() {
    error.value = null
  }

  /**
 * Initialize auth state
 */
async function initializeAuth() {
  const token = sessionStorage.getItem('authToken')

  if (!token) {
    logout()
    return
  }

  try {
    const profile = await authApi.getProfile(token)
    user.value = profile
  } catch {
    logout()
  }
}

/**
 * Update user profile
 */
async function updateProfile(profileData: Partial<User>) {
  isLoading.value = true
  error.value = null

  try {
    const token = sessionStorage.getItem('authToken')

    if (!token) {
      throw new Error('No authentication token found')
    }

    const updatedUser = await authApi.updateProfile(token, profileData)

    user.value = updatedUser

    return updatedUser
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : 'Failed to update profile'

    error.value = errorMessage
    throw err
  } finally {
    isLoading.value = false
  }
}

return {
  // State
  user,
  isLoading,
  error,
  isAuthenticated,
  state,
  token,

  // Methods
  login,
  register,
  logout,
  clearError,
  initializeAuth,
  updateProfile,
}

})
