import { defineStore } from 'pinia'
import { ref } from 'vue'
import { chatApi } from '@/services/chat'

export const useChatStore = defineStore('chat', () => {
  const messages = ref<any[]>([])
  const activeUserId = ref<string | null>(null)

  const fetchConversation = async (userId: string) => {
    activeUserId.value = userId

    const res = await chatApi.getConversation(userId)
    messages.value = res.data
  }

  const sendMessage = async (content: string) => {
    if (!activeUserId.value || !content.trim()) return

    await chatApi.sendMessage({
      receiverId: activeUserId.value,
      content,
      type: 'text',
    })

    await fetchConversation(activeUserId.value)
  }

  return {
    messages,
    activeUserId,
    fetchConversation,
    sendMessage,
  }
})
