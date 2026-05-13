import { defineStore } from 'pinia'
import { ref } from 'vue'
import { chatApi } from '@/services/chat'

export const useChatStore = defineStore('chat', () => {
  const messages = ref<any[]>([])
  const activeUserId = ref<string | null>(null)

  // current logged user (from auth store or localStorage)
  const currentUserId = localStorage.getItem('userId')

  // LOAD CONVERSATION
  const fetchConversation = async (userId: string) => {
    activeUserId.value = userId

    const res = await chatApi.getConversation(
      currentUserId!,
      userId
    )

    messages.value = res.data
  }

  // SEND MESSAGE
  const sendMessage = async (content: string) => {
    if (!activeUserId.value) return

    await chatApi.sendMessage({
      receiverId: activeUserId.value,
      content,
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
