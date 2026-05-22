
<script setup lang="ts">
import { ref, onMounted, watch, computed } from "vue"
import { useRoute, useRouter } from "vue-router"
import { useAuthStore } from '@/stores/auth'
import LoginPromptModal from '@/components/LoginPromptModal.vue'
import { connectSocket, getSocket, disconnectSocket } from '@/services/socket'
import api from '@/services/api'

import ChatSidebar from "../components/ChatSidebar.vue"
import ChatWindow from "../components/ChatWindow.vue"
import Header from "../components/layout/Header.vue"

type Message = {
  text: string
  sender: "me" | "them"
  time: string
  type?: "text" | "image" | "voice"
  imageUrl?: string
  audioUrl?: string
}

type User = {
  id: string | number
  name: string
  role: string
  message: string
  time: string
  avatar: string
  online?: boolean
  chat: Message[]
}

const route = useRoute()

// ✅ USERS (frontend temporary until backend)
const users = ref<User[]>([])

// ✅ CURRENT CHAT USER
const selectedUser = ref<User | null>(null)

// ✅ MESSAGE INPUT
const newMessage = ref("")

// Auth and UI
const auth = useAuthStore()
const router = useRouter()
const showLoginPrompt = ref(false)

// =========================
// 🔥 LOAD USERS (TEMP MOCK OR BACKEND LATER)
// =========================
const storageKey = computed(() => `chat_users_${auth.user?.id ?? 'guest'}`)

const normalizeAvatarUrl = (value: string | undefined | null) => {
  const normalized = String(value || '').trim()
  if (!normalized || normalized.toLowerCase() === 'null' || normalized.toLowerCase() === 'undefined') {
    return 'https://via.placeholder.com/48'
  }
  return normalized
}

const loadUsers = () => {
  const saved = localStorage.getItem(storageKey.value)

  if (!saved) {
    users.value = []
    return
  }

  try {
    users.value = JSON.parse(saved)
  } catch {
    users.value = []
  }
}

const saveUsers = () => {
  localStorage.setItem(storageKey.value, JSON.stringify(users.value))
}

const selectSellerFromRoute = () => {
  const sellerId = String(route.query.sellerId || route.query.sellerName || "").trim()
  const sellerName = String(route.query.sellerName || "").trim()

  if (!sellerId || !sellerName) {
    return false
  }

  const existing = users.value.find((u) => String(u.id) === String(sellerId))

  if (existing) {
    const sellerAvatar = String(route.query.sellerAvatar || "").trim()
    if (sellerAvatar) {
      existing.avatar = normalizeAvatarUrl(sellerAvatar)
      existing.name = sellerName
      saveUsers()
    }

    selectedUser.value = existing
    return true
  }

  const sellerAvatar = normalizeAvatarUrl(String(route.query.sellerAvatar || ""))
  const sellerUser: User = {
    id: sellerId,
    name: sellerName,
    role: "Seller",
    message: "Hi, I am interested in your listing.",
    time: new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
    avatar: sellerAvatar,
    online: true,
    chat: [],
  }

  users.value.unshift(sellerUser)
  selectedUser.value = sellerUser
  saveUsers()

  return true
}

const initChat = () => {
  if (users.value.length === 0) {
    loadUsers()
  }

  const hasSeller = selectSellerFromRoute()
  if (hasSeller) {
    return
  }

  const userId = route.params.id
  if (userId) {
    selectedUser.value =
      users.value.find((u) => String(u.id) === String(userId)) || null
    return
  }

  if (users.value.length > 0) {
    selectedUser.value = users.value[0]
  }
}

onMounted(() => {
  if (!auth.isAuthenticated) {
    showLoginPrompt.value = true
    return
  }

  // connect socket and load chats
  connectSocket()
  const s = getSocket()
  if (s) {
    s.on('message', handleIncomingMessage)
  }

  initChat()
})

watch(
  () => route.query,
  () => {
    initChat()
  },
  { deep: true },
)

// When auth state changes (e.g., user logs in), load that user's chats
watch(
  () => auth.isAuthenticated,
  (val) => {
    if (val) {
      showLoginPrompt.value = false
      loadUsers()

      // connect socket and bind
      connectSocket()
      const s = getSocket()
      if (s) {
        s.off('message', handleIncomingMessage)
        s.on('message', handleIncomingMessage)
      }

      initChat()
    } else {
      users.value = []
      selectedUser.value = null
      // disconnect socket
      disconnectSocket()
    }
  }
)

// =========================
// SELECT USER FROM SIDEBAR
// =========================
const selectUser = (user: User) => {
  selectedUser.value = user
}

// =========================
// SEND MESSAGE
// =========================
const sendMessage = async () => {
  if (!auth.isAuthenticated) {
    showLoginPrompt.value = true
    return
  }

  if (!selectedUser.value || !newMessage.value.trim()) return

  const text = newMessage.value
  const time = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })

  // ✅ 1. INSTANT UI UPDATE (FIX)
  selectedUser.value.chat.push({
    text,
    sender: "me",
    time,
    type: "text",
  })

  selectedUser.value.message = text
  selectedUser.value.time = time

  saveUsers()

  // clear input immediately
  newMessage.value = ""

  try {
    // ✅ 2. send to backend
    await api.post("/chat/send", {
      receiverId: String(selectedUser.value.id),
      content: text,
      type: "text",
    })
  } catch (err) {
    console.error("Send failed", err)
  }
}
// =========================
// SEND IMAGE
// =========================
const sendImage = async (file: File) => {
  if (!selectedUser.value) return

  const imageUrl = URL.createObjectURL(file)

  // ✅ 1. instant UI update
  selectedUser.value.chat.push({
    text: "",
    sender: "me",
    time: new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
    type: "image",
    imageUrl,
  })

  saveUsers()

  // ✅ 2. send to backend (optional file upload later)
  try {
    const form = new FormData()
    form.append("receiverId", String(selectedUser.value.id))
    form.append("file", file)
    form.append("type", "image")

    await api.post("/chat/send-image", form)
  } catch (err) {
    console.error("Image send failed", err)
  }
}

const sendVoice = async (audioBlob: Blob) => {
  if (!selectedUser.value) return

  const audioUrl = URL.createObjectURL(audioBlob)
  const time = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })

  selectedUser.value.chat.push({
    text: "Voice message",
    sender: "me",
    time,
    type: "voice",
    audioUrl,
  })

  selectedUser.value.message = "Sent a voice message"
  selectedUser.value.time = time
  saveUsers()

  try {
    const form = new FormData()
    form.append("receiverId", String(selectedUser.value.id))
    form.append("file", audioBlob)
    form.append("type", "voice")

    await api.post("/chat/send-voice", form)
  } catch (err) {
    console.error("Voice send failed", err)
  }
}

// handle incoming server message
function handleIncomingMessage(msg: any) {
  // msg: { senderId, receiverId, content, type, createdAt, _id }
  const myId = String(auth.user?.id)
  const otherId = String(msg.senderId === myId ? msg.receiverId : msg.senderId)

  // find or create user entry
  let u = users.value.find((x) => String(x.id) === otherId)
  if (!u) {
    u = {
      id: otherId,
      name: msg.senderId === myId ? (auth.user?.name || 'Me') : (msg.senderName || 'User'),
      role: 'Seller',
      message: msg.content || '',
      time: new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      avatar: normalizeAvatarUrl(msg.senderAvatar || 'https://via.placeholder.com/48'),
      online: true,
      chat: [],
    }
    users.value.unshift(u)
  }

  const chatEntry = {
    text: msg.content,
    sender: String(msg.senderId) === myId ? ('me' as const) : ('them' as const),
    time: new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    type: msg.type === 'voice' ? ('voice' as const) : msg.type === 'image' ? ('image' as const) : ('text' as const),
    imageUrl: msg.imageUrl || (msg.type === 'image' ? msg.content : undefined),
    audioUrl: msg.type === 'voice' ? msg.audioUrl || msg.content || undefined : undefined,
  }

  u.chat.push(chatEntry)
  u.message = chatEntry.type === 'voice' ? 'Sent a voice message' : chatEntry.text || (chatEntry.type === 'image' ? 'Sent an image' : '')
  u.time = chatEntry.time
  saveUsers()
}

</script>

<template>
  <div>
    <Header />

    <div class="layout">
      <ChatSidebar
        :users="users"
        :selected-user="selectedUser"
        @select-user="selectUser"
      />

      <ChatWindow
        :selected-user="selectedUser"
        :messages="selectedUser?.chat || []"
        :new-message="newMessage"
        @send-message="sendMessage"
        @send-image="sendImage"
        @send-voice="sendVoice"
        @update:newMessage="newMessage = $event"
      />
          <LoginPromptModal v-if="showLoginPrompt" @login="() => router.push({ name: 'login', query: { redirect: '/chat' } })" @close="showLoginPrompt = false" />
    </div>
  </div>
</template>

<style scoped>
.layout {
  display: flex;
  height: calc(100vh - 60px);
  font-family: 'Inter', system-ui, sans-serif;
}
</style>