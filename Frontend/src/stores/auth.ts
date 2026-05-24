/**
 * Pinia Auth Store
 * Manages authentication state and operations
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '@/services/auth'
import type { AuthState, User, LoginCredentials, RegisterCredentials } from '@/types/auth'

export const useAuthStore = defineStore('auth', () => {
  const USER_STORAGE_KEY = 'authUser'

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

  const getAvatarStorageKey = (userId: string) => `avatar_${userId}`

  function readStoredUser(): User | null {
    try {
      const raw = sessionStorage.getItem(USER_STORAGE_KEY)
      if (!raw) return null
      return JSON.parse(raw) as User
    } catch {
      return null
    }
  }

  function writeStoredUser(value: User | null) {
    if (!value) {
      sessionStorage.removeItem(USER_STORAGE_KEY)
      return
    }

    sessionStorage.setItem(USER_STORAGE_KEY, JSON.stringify(value))
  }


  /**
   * Login user with email and password
   * @param credentials - Email and password
   */
  async function login(credentials: LoginCredentials) {
    isLoading.value = true
    error.value = null

    try {
      const response = await authApi.login(credentials)

      if (response.user && !response.user.avatar) {
        const savedAvatar = sessionStorage.getItem(getAvatarStorageKey(response.user.id))
        if (savedAvatar) {
          response.user.avatar = savedAvatar
        }
      }

      // Store user data
      user.value = response.user
      writeStoredUser(response.user)

      // Store token persistently
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

      if (response.user && !response.user.avatar) {
        const savedAvatar = sessionStorage.getItem(getAvatarStorageKey(response.user.id))
        if (savedAvatar) {
          response.user.avatar = savedAvatar
        }
      }

      // Store user data
      user.value = response.user
      writeStoredUser(response.user)

      // Store token persistently
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
    writeStoredUser(null)
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
    let token = sessionStorage.getItem('authToken')

    if (!token) {
      const legacyToken = localStorage.getItem('authToken')
      const legacyUser = localStorage.getItem(USER_STORAGE_KEY)

      if (legacyToken) {
        sessionStorage.setItem('authToken', legacyToken)
        localStorage.removeItem('authToken')
        token = legacyToken
      }

      if (legacyUser) {
        sessionStorage.setItem(USER_STORAGE_KEY, legacyUser)
        localStorage.removeItem(USER_STORAGE_KEY)
      }
    }

    if (!token) {
      logout()
      return
    }

    const storedUser = readStoredUser()
    if (storedUser) {
      user.value = storedUser
    }

    try {
      const profile = await authApi.getProfile(token)
      user.value = profile
      writeStoredUser(profile)
    } catch {
      // Keep the stored user and token so refresh does not log out on transient errors.
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
      writeStoredUser(updatedUser)

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
