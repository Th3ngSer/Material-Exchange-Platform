/**
 * Pinia Auth Store
 * Manages authentication state and operations
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '@/services/auth'
import { getToken, setToken, clearToken } from '@/utils/tokenStorage'
import type { AuthState, User, LoginCredentials, RegisterCredentials } from '@/types/auth'

export const useAuthStore = defineStore('auth', () => {
  const USER_STORAGE_KEY = 'authUser'

  // State
  const user = ref<User | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Computed
  const isAuthenticated = computed(() => user.value !== null)
  const token = computed(() => getToken())

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

  function readCachedAvatar(userId: string): string | null {
    try {
      return localStorage.getItem(getAvatarStorageKey(userId))
    } catch {
      return null
    }
  }

  function writeCachedAvatar(value: User | null) {
    try {
      if (!value?.id) return
      if (!value.avatar) {
        localStorage.removeItem(getAvatarStorageKey(value.id))
      } else {
        localStorage.setItem(getAvatarStorageKey(value.id), value.avatar)
      }
    } catch {
      // Silently ignore storage errors
    }
  }

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
    try {
      if (!value) {
        sessionStorage.removeItem(USER_STORAGE_KEY)
        return
      }

      sessionStorage.setItem(USER_STORAGE_KEY, JSON.stringify(value))
    } catch {
      // Silently ignore storage errors (e.g., from tracking prevention)
    }
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
        try {
          const savedAvatar = sessionStorage.getItem(getAvatarStorageKey(response.user.id))
          if (savedAvatar) {
            response.user.avatar = savedAvatar
          }
        } catch {
          // Silently ignore storage errors (e.g., from tracking prevention)
        }
      }

      // Store user data
      user.value = response.user
      writeCachedAvatar(response.user)
      writeStoredUser(response.user)

      // Store token — tab-isolated + refresh-persistent
      setToken(response.accessToken)

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
        try {
          const savedAvatar = sessionStorage.getItem(getAvatarStorageKey(response.user.id))
          if (savedAvatar) {
            response.user.avatar = savedAvatar
          }
        } catch {
          // Silently ignore storage errors (e.g., from tracking prevention)
        }
      }

      // Store user data
      user.value = response.user
      writeCachedAvatar(response.user)
      writeStoredUser(response.user)

      // Store token — tab-isolated + refresh-persistent
      setToken(response.accessToken)

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
    clearToken()
    writeStoredUser(null)
  }

  /**
   * Clear error message
   */
  function clearError() {
    error.value = null
  }

  /**
   * Initialize auth state from local cache.
   * Restores user immediately from localStorage so the app mounts with the
   * correct state. Token validation happens via the global 401 interceptor
   * on the first real API call — NOT here, to avoid wiping valid sessions.
   */
  function initializeAuth() {
    const token = getToken()
    if (!token) {
      user.value = null
      return
    }
    // Restore user from cache — the app can render straight away
    const storedUser = readStoredUser()
    if (storedUser) {
      const cachedAvatar = storedUser.id ? readCachedAvatar(storedUser.id) : null
      if (!storedUser.avatar && cachedAvatar) {
        storedUser.avatar = cachedAvatar
      }
      user.value = storedUser
      writeCachedAvatar(storedUser)
    }

    try {
      const profile = await authApi.getProfile(token)
      user.value = profile
      writeStoredUser(profile)
      writeCachedAvatar(profile)
    } catch (err) {
      const statusCode = (err as any)?.statusCode
      // If token is invalid (401), logout to force re-authentication
      if (statusCode === 401) {
        logout()
        return
      }
      // For other errors, keep the stored user and token (transient network errors)
    }
    user.value = storedUser
  }

  /**
   * Update user profile
   */
  async function updateProfile(profileData: Partial<User>) {
    isLoading.value = true
    error.value = null

    try {
      const token = getToken()

      if (!token) {
        throw new Error('No authentication token found')
      }

      const updatedUser = await authApi.updateProfile(token, profileData)

      user.value = updatedUser
      writeCachedAvatar(updatedUser)
      writeStoredUser(updatedUser)

      return updatedUser
    } catch (err) {
      const statusCode = (err as any)?.statusCode
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile'

      error.value = errorMessage
      if (statusCode === 401) {
        logout()
      }
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Refresh user profile from server
   */
  async function refreshUser() {
    try {
      const token = getToken()

      if (!token) {
        logout()
        return
      }

      const profile = await authApi.getProfile(token)
      user.value = profile
      writeCachedAvatar(profile)
      return profile
    } catch (err) {
      const statusCode = (err as any)?.statusCode
      if (statusCode === 401) {
        logout()
      }
      throw err
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
    refreshUser,
    writeCachedAvatar,
  }

})
