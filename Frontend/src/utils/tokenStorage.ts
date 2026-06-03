/**
 * Token Storage
 * Uses localStorage so the token persists across page reloads and browser restarts.
 * Token validation happens on first API call via the global interceptor.
 */

const TOKEN_KEY = 'authToken'

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function setToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_KEY, token)
  } catch {
    // ignore localStorage errors
  }
}

export function clearToken(): void {
  try {
    localStorage.removeItem(TOKEN_KEY)
  } catch {
    // ignore localStorage errors
  }
}
