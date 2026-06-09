import api from './api'

export const chatApi = {
  sendMessage(data: {
    receiverId: string
    content: string
    type?: 'text' | 'image' | 'voice'
  }) {
    return api.post('/chat/send', {
      type: data.type || 'text',
      ...data,
    })
  },

  getUsers() {
    return api.get('/chat/users')
  },

  getConversation(userId: string) {
    return api.get('/chat/history', {
      params: { userId },
    })
  },
  deleteConversation(userId: string) {
    return api.delete('/chat/conversation', {
      params: { userId },
    })
  },
}