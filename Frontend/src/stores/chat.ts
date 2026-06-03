import { defineStore } from 'pinia'
import { ref } from 'vue'
import { chatApi } from '@/services/chat'

export const useChatStore = defineStore('chat', () => {
  const messages = ref<any[]>([])
  const activeUserId = ref<string | null>(null)

  // LOAD CONVERSATION
  const fetchConversation = async (userId: string) => {
    activeUserId.value = userId

    const res = await chatApi.getConversation(userId)
    messages.value = res.data || []
  }

  // SEND MESSAGE (OPTIMIZED)
  const sendMessage = async (content: string) => {
    if (!activeUserId.value || !content.trim()) return

    const tempMessage = {
      text: content,
      sender: 'me',
      type: 'text',
      time: new Date().toLocaleTimeString(),
    }

    // INSTANT UI UPDATE (NO WAIT)
    messages.value.push(tempMessage)

    try {
      // SEND TO SERVER
      await chatApi.sendMessage({
        receiverId: activeUserId.value,
        content,
        type: 'text',
      })
    } catch (err) {
      console.error('Send failed', err)
    }
    // await fetchConversation(activeUserId.value)
  }

  // HANDLE SOCKET MESSAGE
  const receiveMessage = (msg: any) => {
    if (!msg) return

    messages.value.push({
      text: msg.content,
      sender: msg.senderId === activeUserId.value ? 'them' : 'them',
      type: msg.type,
      time: new Date(msg.createdAt || Date.now()).toLocaleTimeString(),
      imageUrl: msg.imageUrl,
      audioUrl: msg.audioUrl,
    })
  }

  // CLEAR CHAT
  const clearChat = () => {
    messages.value = []
    activeUserId.value = null
  }

  return {
    messages,
    activeUserId,
    fetchConversation,
    sendMessage,
    receiveMessage,
    clearChat,
  }
})
