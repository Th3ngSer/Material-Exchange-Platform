/**
 * Token Storage
 * Uses sessionStorage so the token is isolated per tab and persists across page reloads.
 * Token validation happens on first API call via the global interceptor.
 */

const TOKEN_KEY = 'authToken'

export function getToken(): string | null {
  try {
    return sessionStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function setToken(token: string): void {
  try {
    sessionStorage.setItem(TOKEN_KEY, token)
  } catch {
    // ignore sessionStorage errors
  }
}

export function clearToken(): void {
  try {
    sessionStorage.removeItem(TOKEN_KEY)
  } catch {
    // ignore sessionStorage errors
  }
}

