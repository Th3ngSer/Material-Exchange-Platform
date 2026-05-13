import api from './api-chat'

export const chatApi = {
  // send message
  sendMessage(data: { receiverId: string; content: string }) {
    return api.post('/chat/send', data)
  },

  // conversation between 2 users
  getConversation(user1: string, user2: string) {
    return api.get(`/chat/history?user1=${user1}&user2=${user2}`)
  },
}