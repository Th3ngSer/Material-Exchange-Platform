/**
 * Authenticated fetch wrapper.
 * Automatically attaches the Bearer token from tokenStorage.
 */

import { getToken } from '@/utils/tokenStorage'

export async function authFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const token = getToken()

  const headers = new Headers(init.headers ?? {})
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  return fetch(input, { ...init, headers })
}
