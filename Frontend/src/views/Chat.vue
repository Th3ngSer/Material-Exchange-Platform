
<script setup lang="ts">
import { ref, onMounted, watch, computed } from "vue"
import { useRoute, useRouter } from "vue-router"
import { useAuthStore } from '../stores/auth'
import LoginPromptModal from '../components/LoginPromptModal.vue'
import { connectSocket, getSocket, disconnectSocket } from '../services/socket'
import { chatApi } from '../services/chat'
import type { ChatUser, ChatMessage } from '../types/chat'

import ChatSidebar from "../components/ChatSidebar.vue"
import ChatWindow from "../components/ChatWindow.vue"
import Header from "../components/layout/Header.vue"

const route = useRoute()
const users = ref<ChatUser[]>([])
const selectedUser = ref<ChatUser | null>(null)
const newMessage = ref("")


// Auth and UI
const auth = useAuthStore()
const router = useRouter()
const showLoginPrompt = ref(false)

// LOAD USERS 
const storageKey = computed(() => `chat_users_${auth.user?.id ?? 'guest'}`)

const API_URL = 'http://localhost:3000'

const normalizeAvatarUrl = (value: string | undefined | null) => {
  const normalized = String(value || '').trim()
  if (!normalized || normalized.toLowerCase() === 'null' || normalized.toLowerCase() === 'undefined') {
    return 'https://via.placeholder.com/48'
  }
  if (normalized.startsWith('http')) {
    return normalized
  }
  if (normalized.startsWith('/')) {
    return `${API_URL}${normalized}`
  }
  return `${API_URL}/${normalized}`
}

const normalizeChatMessage = (msg: any) => {
  const type = String(msg.type || '').toLowerCase()
  return {
    text: String(msg.text ?? ''),
    sender: String(msg.sender ?? '').toLowerCase() === 'me' ? 'me' : 'them',
    time: String(msg.time ?? ''),
    type: type === 'voice' ? 'voice' : type === 'image' ? 'image' : 'text',
    imageUrl: msg.imageUrl ? String(msg.imageUrl) : undefined,
    audioUrl: msg.audioUrl ? String(msg.audioUrl) : undefined,
  }
}

const restoreSelectedUser = () => {
  if (!selectedUser.value) return
  const found = users.value.find((u) => String(u.id) === String(selectedUser.value?.id))
  if (found) {
    selectedUser.value = found
  }
}

const loadUsers = () => {
  const saved = localStorage.getItem(storageKey.value)

  if (!saved) {
    users.value = []
    return
  }

  try {
    const parsed = JSON.parse(saved)
    if (Array.isArray(parsed)) {
      users.value = parsed.map((user: any) => ({
        ...user,
        unreadCount: typeof user.unreadCount === 'number' ? user.unreadCount : 0,
        chat: Array.isArray(user.chat)
          ? user.chat.map(normalizeChatMessage)
          : [],
      }))
      // dedupe any accidental duplicates by id
      users.value = dedupeUsers(users.value)
      restoreSelectedUser()
    } else {
      users.value = []
    }
  } catch {
    users.value = []
  }
}

// FETCH USERS FROM BACKEND
const fetchUsersFromBackend = async () => {
  try {
    const { data } = await chatApi.getUsers()
    if (Array.isArray(data)) {
      const backendUsers: ChatUser[] = data.map((u: any) => ({
        id: u._id,
        name: u.name || u.username || u.email || 'User',
        role: u.role || 'Member',
        message: '',
        time: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        avatar: u.avatar ? normalizeAvatarUrl(u.avatar) : 'https://via.placeholder.com/48',
        online: true,
        chat: [],

        unreadCount: 0,
      }))

      // Merge with existing users, preferring existing data
      const merged: ChatUser[] = [...backendUsers]
      users.value.forEach((existingUser) => {
        const found = merged.find((u) => String(u.id) === String(existingUser.id))
        if (!found) {
          merged.push(existingUser)
        } else {
          // Keep existing chat history and message preview
          found.chat = existingUser.chat
          found.message = existingUser.message
          found.time = existingUser.time
          found.unreadCount = existingUser.unreadCount ?? 0
        }
      })

      users.value = dedupeUsers(merged)
      restoreSelectedUser()
      saveUsers()
    }
  } catch (err) {
    console.error('Failed to fetch users from backend', err)
  }
}

const saveUsers = () => {
  // ensure uniqueness before saving
  const unique = dedupeUsers(users.value)
  localStorage.setItem(storageKey.value, JSON.stringify(unique))
}

// Remove duplicate users by id (preserve first occurrence)
const dedupeUsers = (arr: any[]) => {
  const seen = new Set<string>()
  const out: any[] = []
  for (const u of arr) {
    const id = String(u.id || u._id || '')
    if (!id) continue
    if (seen.has(id)) continue
    seen.add(id)
    out.push({ ...u, id })
  }
  return out
}

// LOAD CONVERSATION HISTORY
const loadConversationHistory = async (userId: string) => {
  try {
    const { data } = await chatApi.getConversation(userId)
    const currentUserId = String(auth.user?.id)

    // Find the user in users list
    const user = users.value.find((u) => String(u.id) === String(userId))
    if (!user) return

    // Clear existing chat and load history
    user.chat = []

    // Map database messages to chat format
    if (Array.isArray(data)) {
      data.forEach((msg: any) => {
        const type = String(msg.type || '').toLowerCase()
        const sender: 'me' | 'them' = String(msg.senderId) === currentUserId ? 'me' : 'them'
        const chatEntry: ChatMessage = {
          text: type === 'text' ? String(msg.content || '') : type === 'voice' ? 'Voice message' : type === 'image' ? 'Sent an image' : '',
          sender,
          time: new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: type === 'voice' ? 'voice' : type === 'image' ? 'image' : 'text',
          imageUrl: type === 'image' ? String(msg.content || msg.imageUrl || '') : undefined,
          audioUrl: type === 'voice' ? String(msg.content || msg.audioUrl || '') : undefined,
        }
        user.chat.push(chatEntry)
      })
    }

    saveUsers()
  } catch (err) {
    console.error('Failed to load conversation history', err)
  }
}

const blobToDataUrl = (blob: Blob) => {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : null
      if (result) {
        resolve(result)
        return
      }

      reject(new Error('Unable to convert voice recording to a data URL.'))
    }

    reader.onerror = () => {
      reject(reader.error || new Error('Unable to read voice recording.'))
    }

    reader.readAsDataURL(blob)
  })
}

const selectSellerFromRoute = async () => {
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

  let resolvedId = sellerId
  if (sellerId === sellerName) {
    try {
      const { data } = await chatApi.getUsers()
      const matched = (data as any[]).find((item) => {
        const itemName = String(item.name || item.username || item.email || '').trim()
        return itemName === sellerName
      })
      if (matched?._id) {
        resolvedId = String(matched._id)
      }
    } catch {
      // ignore lookup failures
    }
  }

  const sellerAvatar = normalizeAvatarUrl(String(route.query.sellerAvatar || ""))
  const sellerUser: ChatUser = {
    id: resolvedId,
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
    unreadCount: 0,
  }

  users.value.unshift(sellerUser)
  selectedUser.value = sellerUser
  saveUsers()

  return true
}

const initChat = async () => {
  if (users.value.length === 0) {
    loadUsers()
  }

  const hasSeller = await selectSellerFromRoute()
  if (hasSeller) {
    if (selectedUser.value) {
      await loadConversationHistory(String(selectedUser.value.id))
    }
    return
  }

  const userId = route.params.id
  if (userId) {
    selectedUser.value =
      users.value.find((u) => String(u.id) === String(userId)) || null
    if (selectedUser.value) {
      await loadConversationHistory(String(userId))
    }
    return
  }

  if (users.value.length > 0) {
    selectedUser.value = users.value[0] || null
    if (selectedUser.value) {
      await loadConversationHistory(String(selectedUser.value.id))
    }
  }
}

// SOCKET HELPERS
const bindSocket = () => {
  const s = getSocket()
  if (!s) return

  s.off('message', handleIncomingMessage)
  s.on('message', handleIncomingMessage)
}

onMounted(async () => {
  if (!auth.isAuthenticated) {
    showLoginPrompt.value = true
    return
  }

  // Load users from localStorage first
  loadUsers()

  // Fetch fresh user list from backend
  await fetchUsersFromBackend()

  connectSocket()
  bindSocket()

  await initChat()
})


watch(
  () => route.query,
  async () => {
    await initChat()
  },
  { deep: true },
)

// When auth state changes 
watch(
  () => auth.isAuthenticated,
  async (val) => {
    if (val) {
      showLoginPrompt.value = false
      loadUsers()

      // Fetch fresh user list from backend
      await fetchUsersFromBackend()

      connectSocket()
      bindSocket()

      await initChat()
    } else {
      users.value = []
      selectedUser.value = null
      // disconnect socket
      disconnectSocket()
    }
  }
)

// SELECT USER FROM SIDEBAR
const selectUser = async (user: ChatUser) => {
  selectedUser.value = user

  if ('unreadCount' in user) {
    user.unreadCount = 0
  }
  // Load conversation history when user is selected
  await loadConversationHistory(String(user.id))
}

// SEND MESSAGE
const sendMessage = async () => {
  if (!auth.isAuthenticated) {
    showLoginPrompt.value = true
    return
  }

  if (!selectedUser.value || !newMessage.value.trim()) return

  const text = newMessage.value
  const receiverId = String(selectedUser.value.id)
  const time = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })

  // INSTANT UI UPDATE
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

  moveUserToTop(receiverId)

  try {
    await chatApi.sendMessage({
      receiverId,
      content: text,
      type: "text",
    })
  } catch (err) {
    console.error("Send failed", err)
  }
}

// SEND IMAGE
const sendImage = async (file: File) => {
  if (!selectedUser.value) return

  let imageUrl = ''

  try {
    imageUrl = await blobToDataUrl(file)
  } catch (err) {
    console.error('Image conversion failed', err)
    return
  }

  const time = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })

  selectedUser.value.chat.push({
    text: "",
    sender: "me",
    time,
    type: "image",
    imageUrl,
  })

  selectedUser.value.message = "Sent an image"
  selectedUser.value.time = time
  saveUsers()

  try {
    const receiverId = String(selectedUser.value.id)
    await chatApi.sendMessage({
      receiverId,
      content: imageUrl,
      type: "image",
    })
    moveUserToTop(receiverId)
  } catch (err) {
    console.error("Image send failed", err)
  }
}

const sendVoice = async (audioBlob: Blob) => {
  if (!selectedUser.value) return

  let audioUrl = ''

  try {
    audioUrl = await blobToDataUrl(audioBlob)
  } catch (err) {
    console.error('Voice conversion failed', err)
    return
  }

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
    const receiverId = String(selectedUser.value.id)
    await chatApi.sendMessage({
      receiverId,
      content: audioUrl,
      type: "voice",
    })
    moveUserToTop(receiverId)
  } catch (err) {
    console.error("Voice send failed", err)
  }
}

// handle incoming server message
function handleIncomingMessage(msg: any) {
  // msg: { senderId, receiverId, content, type, createdAt, _id }
  const myId = String(auth.user?.id)
  // Ignore messages sent by myself
  if (String(msg.senderId) === myId) {
    return
  }

  const otherId = String(msg.senderId === myId ? msg.receiverId : msg.senderId)

  // find or create user entry
  let u = users.value.find((x) => String(x.id) === otherId)
  if (!u) {
    u = {
      id: otherId,
      name: msg.senderId === myId ? (auth.user?.name || 'Me') : (msg.senderName || 'User'),
      role: 'Seller',
      message: msg.type === 'text'
        ? String(msg.content || '')
        : msg.type === 'voice'
          ? 'Voice message'
          : msg.type === 'image'
            ? 'Sent an image'
            : '',
      time: new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      avatar: normalizeAvatarUrl(msg.senderAvatar || 'https://via.placeholder.com/48'),
      online: true,
      chat: [],
      unreadCount: 0,
    }
    users.value.unshift(u)
  }

  const isCurrentChat =
  selectedUser.value && String(selectedUser.value.id) === otherId

  if (!isCurrentChat) {
    u.unreadCount = (u.unreadCount || 0) + 1
  }

  // optional (you can keep or remove this)
  if (isCurrentChat) {
    selectedUser.value = u
  }

  if (selectedUser.value && String(selectedUser.value.id) === otherId) {
    selectedUser.value = u
  }

  moveUserToTop(otherId)

  const type = String(msg.type || '').toLowerCase()
  const messageText = type === 'text'
    ? String(msg.content ?? '')
    : type === 'voice'
      ? 'Voice message'
      : type === 'image'
        ? 'Sent an image'
        : ''

  const imageUrl = type === 'image'
    ? String(msg.content || msg.imageUrl || '')
    : undefined
  const audioUrl = type === 'voice'
    ? String(msg.content || msg.audioUrl || '')
    : undefined

  const sender: 'me' | 'them' = String(msg.senderId) === myId ? 'me' : 'them'
  const chatEntry: ChatMessage = {
    text: messageText,
    sender,
    time: new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    type: type === 'voice' ? 'voice' : type === 'image' ? 'image' : 'text',
    imageUrl,
    audioUrl,
  }
  // Attach server id (if present) and prevent duplicates using it first
  if (msg._id) (chatEntry as any)._id = String(msg._id)

  // If server-provided id exists, dedupe by id
  let isDuplicate = false
  if (msg._id) {
    isDuplicate = u.chat.some((m: any) => m._id && String(m._id) === String(msg._id))
  }

  // Fallback heuristic for duplicates if no id provided
  if (!isDuplicate) {
    isDuplicate = u.chat.some((m: any) => {
      try {
        return (
          m.text === chatEntry.text &&
          m.sender === chatEntry.sender &&
          m.type === chatEntry.type &&
          Math.abs(new Date(m.time).getTime() - new Date(chatEntry.time).getTime()) < 2000
        )
      } catch {
        return false
      }
    })
  }

  if (!isDuplicate) {
    u.chat.push(chatEntry as any)
    u.message = chatEntry.type === 'voice' ? 'Sent a voice message' : chatEntry.text || (chatEntry.type === 'image' ? 'Sent an image' : '')
    u.time = chatEntry.time

    saveUsers()
    moveUserToTop(otherId)
  }
}

const moveUserToTop = (userId: string) => {
  const index = users.value.findIndex(
    (u) => String(u.id) === String(userId)
  )

  if (index === -1) return

  const user = users.value.splice(index, 1)[0]
  // users.value.unshift(user)
  if (user) {
    users.value.unshift(user);
  } 

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
        :is-active="auth.isAuthenticated"
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