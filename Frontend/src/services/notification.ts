/**
 * Notification Service
 * Handles API calls for notification-related endpoints
 */

import axios from 'axios'
// import type { Notification } from '@/types/notification'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'
const notificationApi = axios.create({
  baseURL: `${API_BASE_URL}/notifications`,
})

// Add auth token to requests
notificationApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const notificationService = {
  /**
   * Get all notifications for current user
   */
  async getAll(filter?: string) {
    try {
      const response = await notificationApi.get('/', {
        params: filter ? { type: filter } : {},
      })
      return response.data
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
      throw error
    }
  },

  /**
   * Get a single notification by ID
   */
  async getOne(id: number) {
    try {
      const response = await notificationApi.get(`/${id}`)
      return response.data
    } catch (error) {
      console.error(`Failed to fetch notification ${id}:`, error)
      throw error
    }
  },

  /**
   * Mark notification as read
   */
  async markAsRead(id: number) {
    try {
      const response = await notificationApi.patch(`/${id}/read`)
      return response.data
    } catch (error) {
      console.error(`Failed to mark notification ${id} as read:`, error)
      throw error
    }
  },

  /**
   * Delete a notification
   */
  async delete(id: number) {
    try {
      await notificationApi.delete(`/${id}`)
    } catch (error) {
      console.error(`Failed to delete notification ${id}:`, error)
      throw error
    }
  },

  /**
   * Reply to a notification (for message-type notifications)
   */
  async reply(id: number, content: string) {
    try {
      const response = await notificationApi.post(`/${id}/reply`, { content })
      return response.data
    } catch (error) {
      console.error(`Failed to reply to notification ${id}:`, error)
      throw error
    }
  },

  /**
   * Perform an action on a notification
   */
  async performAction(id: number, action: string, payload?: Record<string, any>) {
    try {
      const response = await notificationApi.post(`/${id}/action`, {
        action,
        ...payload,
      })
      return response.data
    } catch (error) {
      console.error(`Failed to perform action on notification ${id}:`, error)
      throw error
    }
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead() {
    try {
      const response = await notificationApi.patch('/read-all')
      return response.data
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error)
      throw error
    }
  },

  /**
   * Delete all notifications
   */
  async deleteAll() {
    try {
      await notificationApi.delete('/')
    } catch (error) {
      console.error('Failed to delete all notifications:', error)
      throw error
    }
  },
}
