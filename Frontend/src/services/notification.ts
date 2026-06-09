/**
 * Notification Service
 * Handles notification-related API calls using native fetch()
 */
import { getToken } from '@/utils/tokenStorage'

const API_BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

const buildHeaders = (contentType = 'application/json'): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': contentType,
    Accept: 'application/json',
  }

  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`
  return headers
}

const parseResponse = async (response: Response) => {
  const text = await response.text()
  const data = text ? JSON.parse(text) : null

  if (!response.ok) {
    const message = data?.message || data?.error || response.statusText || 'Notification request failed'
    throw new Error(message)
  }

  return data
}

export const notificationService = {
  async getAll(filter?: string) {
    const url = `${API_BASE_URL}/notifications${filter ? `?type=${encodeURIComponent(filter)}` : ''}`
    const response = await fetch(url, {
      method: 'GET',
      headers: buildHeaders(),
      credentials: 'include',
    })
    return parseResponse(response)
  },

  async getOne(id: string | number) {
    const response = await fetch(`${API_BASE_URL}/notifications/${id}`, {
      method: 'GET',
      headers: buildHeaders(),
      credentials: 'include',
    })
    return parseResponse(response)
  },

  async markAsRead(id: string | number) {
    const response = await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
      method: 'PATCH',
      headers: buildHeaders(),
      credentials: 'include',
    })
    return parseResponse(response)
  },

  async delete(id: string | number) {
    const response = await fetch(`${API_BASE_URL}/notifications/${id}`, {
      method: 'DELETE',
      headers: buildHeaders(),
      credentials: 'include',
    })
    return parseResponse(response)
  },

  async reply(id: string | number, content: string) {
    const response = await fetch(`${API_BASE_URL}/notifications/${id}/reply`, {
      method: 'POST',
      headers: buildHeaders(),
      credentials: 'include',
      body: JSON.stringify({ content }),
    })
    return parseResponse(response)
  },

  async performAction(id: string | number, action: string, payload?: Record<string, any>) {
    const response = await fetch(`${API_BASE_URL}/notifications/${id}/action`, {
      method: 'POST',
      headers: buildHeaders(),
      credentials: 'include',
      body: JSON.stringify({ action, ...payload }),
    })
    return parseResponse(response)
  },

  async markAllAsRead() {
    const response = await fetch(`${API_BASE_URL}/notifications/read-all`, {
      method: 'PATCH',
      headers: buildHeaders(),
      credentials: 'include',
    })
    return parseResponse(response)
  },

  async deleteAll() {
    const response = await fetch(`${API_BASE_URL}/notifications`, {
      method: 'DELETE',
      headers: buildHeaders(),
      credentials: 'include',
    })
    return parseResponse(response)
  },
}
