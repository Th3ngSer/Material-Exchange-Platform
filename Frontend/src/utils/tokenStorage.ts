/**
 * Token Storage
 * Uses sessionStorage so the session is isolated to each tab ("tab-peers"),
 * but still survives page refreshes in the same tab.
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
  } catch {}
}

export function clearToken(): void {
  try {
    sessionStorage.removeItem(TOKEN_KEY)
  } catch {}
}
