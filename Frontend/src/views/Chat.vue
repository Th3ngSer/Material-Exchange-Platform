<script setup lang="ts">
import { ref, onMounted, watch, computed } from "vue"
import { useRoute, useRouter } from "vue-router"
import { useAuthStore } from '../stores/auth'
import LoginPromptModal from '../components/LoginPromptModal.vue'
import { connectSocket, getSocket, disconnectSocket, sendMessageViaSocket } from '../services/socket'
import { chatApi } from '../services/chat'
import type { ChatUser, ChatMessage } from '../types/chat'

import ChatSidebar from "../components/ChatSidebar.vue"
import ChatWindow from "../components/ChatWindow.vue"
import Header from "../components/layout/Header.vue"

/* ---------------- STATE ---------------- */
const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const users = ref<ChatUser[]>([])
const selectedUser = ref<ChatUser | null>(null)
const newMessage = ref("")
const showLoginPrompt = ref(false)

const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
const API_URL = apiBaseUrl.replace(/\/api\/?$/, '')

/* ---------------- STORAGE KEYS ---------------- */
const storageKey = computed(() => `chat_users_${auth.user?.id ?? 'guest'}`)
const hiddenStorageKey = computed(() => `hidden_chat_${auth.user?.id ?? 'guest'}`)

/* ================================================
   INDEXEDDB — stores base64 blobs by key
   so localStorage never gets overloaded
   ================================================ */
const DB_NAME = 'chat_media_db'
const DB_STORE = 'media'
let _db: IDBDatabase | null = null

const openMediaDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (_db) { resolve(_db); return }
    const req = indexedDB.open(DB_NAME, 1)
    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(DB_STORE)) {
        db.createObjectStore(DB_STORE)
      }
    }
    req.onsuccess = (e) => {
      _db = (e.target as IDBOpenDBRequest).result
      resolve(_db)
    }
    req.onerror = () => reject(req.error)
  })
}

const saveMediaToIDB = async (key: string, dataUrl: string): Promise<void> => {
  const db = await openMediaDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DB_STORE, 'readwrite')
    tx.objectStore(DB_STORE).put(dataUrl, key)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

const getMediaFromIDB = async (key: string): Promise<string | null> => {
  const db = await openMediaDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DB_STORE, 'readonly')
    const req = tx.objectStore(DB_STORE).get(key)
    req.onsuccess = () => resolve(req.result ?? null)
    req.onerror = () => reject(req.error)
  })
}

const deleteMediaFromIDB = async (key: string): Promise<void> => {
  const db = await openMediaDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DB_STORE, 'readwrite')
    tx.objectStore(DB_STORE).delete(key)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

/* Restore all imageUrl / audioUrl in a user's chat from IndexedDB */
const restoreMediaForUser = async (user: ChatUser) => {
  for (const msg of user.chat) {
    if (msg.type === 'image' && msg.imageUrl?.startsWith('idb://')) {
      const key = msg.imageUrl.replace('idb://', '')
      const dataUrl = await getMediaFromIDB(key)
      if (dataUrl) msg.imageUrl = dataUrl
    }
    if (msg.type === 'voice' && msg.audioUrl?.startsWith('idb://')) {
      const key = msg.audioUrl.replace('idb://', '')
      const dataUrl = await getMediaFromIDB(key)
      if (dataUrl) msg.audioUrl = dataUrl
    }
  }
}

/* Before saving to localStorage, replace big base64 with idb:// reference */
const persistMediaForUser = async (user: ChatUser): Promise<ChatUser> => {
  const chat = await Promise.all(
    user.chat.map(async (msg) => {
      const m = { ...msg }

      if (m.type === 'image' && m.imageUrl && m.imageUrl.startsWith('data:')) {
        const key = `img_${user.id}_${Date.now()}_${Math.random().toString(36).slice(2)}`
        await saveMediaToIDB(key, m.imageUrl)
        m.imageUrl = `idb://${key}`
      }

      if (m.type === 'voice' && m.audioUrl && m.audioUrl.startsWith('data:')) {
        const key = `aud_${user.id}_${Date.now()}_${Math.random().toString(36).slice(2)}`
        await saveMediaToIDB(key, m.audioUrl)
        m.audioUrl = `idb://${key}`
      }

      return m
    })
  )
  return { ...user, chat }
}

/* ---------------- UTILS ---------------- */
const normalizeAvatarUrl = (value: string | undefined | null) => {
  const v = String(value || '').trim()
  if (!v || ['null', 'undefined'].includes(v.toLowerCase())) {
    return 'https://via.placeholder.com/48'
  }
  if (v.startsWith('http')) return v
  if (v.startsWith('/')) return `${API_URL}${v}`
  return `${API_URL}/${v}`
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

const dedupeUsers = (arr: any[]) => {
  const seen = new Set<string>()
  const out: any[] = []
  for (const u of arr) {
    const id = String(u.id || u._id || '')
    if (!id || seen.has(id)) continue
    seen.add(id)
    out.push({ ...u, id })
  }
  return out
}

const blobToDataUrl = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : null
      result ? resolve(result) : reject(new Error('Unable to convert to data URL.'))
    }
    reader.onerror = () => reject(reader.error || new Error('Unable to read blob.'))
    reader.readAsDataURL(blob)
  })
}

/* ---------------- HIDDEN IDS ---------------- */
const getHiddenIds = (): string[] => {
  try {
    const raw = localStorage.getItem(hiddenStorageKey.value)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.map(String) : []
  } catch {
    return []
  }
}

const addHiddenIds = (ids: string[]) => {
  const merged = Array.from(new Set([...getHiddenIds(), ...ids.map(String)]))
  try {
    localStorage.setItem(hiddenStorageKey.value, JSON.stringify(merged))
  } catch (err) {
    console.warn('Failed to persist hidden ids', err)
  }
}

const isHidden = (id: string) => getHiddenIds().includes(String(id))

/* ---------------- LOCAL STORAGE ---------------- */
const saveUsers = async () => {
  try {
    const unique = dedupeUsers(users.value)
    const filtered = unique.filter(u => !isHidden(String(u.id)))

    // Replace base64 with idb:// references before saving
    const prepared = await Promise.all(filtered.map(u => persistMediaForUser(u)))
    localStorage.setItem(storageKey.value, JSON.stringify(prepared))
  } catch (err) {
    console.warn('Failed to save users', err)
  }
}

const loadUsers = async () => {
  const saved = localStorage.getItem(storageKey.value)
  if (!saved) { users.value = []; return }

  try {
    const parsed = JSON.parse(saved)
    if (!Array.isArray(parsed)) { users.value = []; return }

    const loaded = dedupeUsers(
      parsed
        .filter((u: any) => !isHidden(String(u.id)))
        .map((u: any) => ({
          ...u,
          id: String(u.id),
          unreadCount: typeof u.unreadCount === 'number' ? u.unreadCount : 0,
          chat: Array.isArray(u.chat) ? u.chat.map(normalizeChatMessage) : []
        }))
    )

    // Restore idb:// media references back to real data URLs
    await Promise.all(loaded.map(u => restoreMediaForUser(u)))

    users.value = loaded
  } catch {
    users.value = []
  }
}

/* ---------------- RESTORE SELECTED USER ---------------- */
const restoreSelectedUser = () => {
  if (!selectedUser.value) return
  const found = users.value.find(u => String(u.id) === String(selectedUser.value?.id))
  if (found) selectedUser.value = found
}

/* ---------------- FETCH USERS ---------------- */
const fetchUsersFromBackend = async () => {
  try {
    const { data } = await chatApi.getUsers()
    if (!Array.isArray(data)) return

    const backendUsers: ChatUser[] = data
      .filter((u: any) => !isHidden(String(u._id)))
      .map((u: any) => ({
        id: String(u._id),
        name: u.name || u.username || u.email || 'User',
        role: u.role || 'Member',
        message: '',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        avatar: normalizeAvatarUrl(u.avatar),
        online: true,
        chat: [],
        unreadCount: 0,
      }))

    const merged = backendUsers.map(backendUser => {
      const existing = users.value.find(u => String(u.id) === String(backendUser.id))
      if (existing) {
        return {
          ...backendUser,
          chat: existing.chat,
          message: existing.message,
          time: existing.time,
          unreadCount: existing.unreadCount ?? 0,
        }
      }
      return backendUser
    })

    users.value = dedupeUsers(merged)
    restoreSelectedUser()
    await saveUsers()
  } catch (err) {
    console.error('Failed to fetch users', err)
  }
}

/* ---------------- CONVERSATION HISTORY ---------------- */
const loadConversationHistory = async (userId: string) => {
  try {
    const { data } = await chatApi.getConversation(userId)
    const user = users.value.find(u => String(u.id) === String(userId))
    if (!user || !Array.isArray(data)) return

    const currentUserId = String(auth.user?.id)
    user.chat = data.map((msg: any) => {
      const type = String(msg.type || '').toLowerCase()
      const sender: 'me' | 'them' = String(msg.senderId) === currentUserId ? 'me' : 'them'
      return {
        text: type === 'text' ? String(msg.content || '') : type === 'voice' ? 'Voice message' : type === 'image' ? 'Sent an image' : '',
        sender,
        time: new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: type === 'voice' ? 'voice' : type === 'image' ? 'image' : 'text',
        imageUrl: type === 'image' ? String(msg.content || msg.imageUrl || '') : undefined,
        audioUrl: type === 'voice' ? String(msg.content || msg.audioUrl || '') : undefined,
      } as ChatMessage
    })

    await saveUsers()
  } catch (err) {
    console.error('Failed to load conversation history', err)
  }
}

/* ---------------- ROUTE: SELECT SELLER ---------------- */
const selectSellerFromRoute = async () => {
  const sellerId = String(route.query.sellerId || '').trim()
  const sellerName = String(route.query.sellerName || '').trim()

  if (!sellerId || !sellerName) return false
  if (isHidden(sellerId)) return false

  const existing = users.value.find(u => String(u.id) === String(sellerId))
  if (existing) {
    const sellerAvatar = String(route.query.sellerAvatar || '').trim()
    if (sellerAvatar) {
      existing.avatar = normalizeAvatarUrl(sellerAvatar)
      existing.name = sellerName
      await saveUsers()
    }
    selectedUser.value = existing
    return true
  }

  let resolvedId = sellerId
  if (sellerId === sellerName) {
    try {
      const { data } = await chatApi.getUsers()
      const matched = (data as any[]).find(item => {
        const itemName = String(item.name || item.username || item.email || '').trim()
        return itemName === sellerName
      })
      if (matched?._id) resolvedId = String(matched._id)
    } catch { /* ignore */ }
  }

  const sellerUser: ChatUser = {
    id: resolvedId,
    name: sellerName,
    role: 'Seller',
    message: 'Hi, I am interested in your listing.',
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    avatar: normalizeAvatarUrl(String(route.query.sellerAvatar || '')),
    online: true,
    chat: [],
    unreadCount: 0,
  }

  users.value.unshift(sellerUser)
  selectedUser.value = sellerUser
  await saveUsers()
  return true
}

/* ---------------- INIT CHAT ---------------- */
const initChat = async () => {
  if (users.value.length === 0) await loadUsers()

  const hasSeller = await selectSellerFromRoute()
  if (hasSeller) {
    if (selectedUser.value) await loadConversationHistory(String(selectedUser.value.id))
    return
  }

  const userId = route.params.id
  if (userId) {
    selectedUser.value = users.value.find(u => String(u.id) === String(userId)) || null
    if (selectedUser.value) await loadConversationHistory(String(userId))
    return
  }

  if (users.value.length > 0) {
    selectedUser.value = users.value[0] || null
    if (selectedUser.value) await loadConversationHistory(String(selectedUser.value.id))
  }
}

/* ---------------- MOVE USER TO TOP ---------------- */
const moveUserToTop = async (userId: string) => {
  const index = users.value.findIndex(u => String(u.id) === String(userId))
  if (index === -1) return
  const user = users.value.splice(index, 1)[0]
  if (user) users.value.unshift(user)
  await saveUsers()
}

/* ---------------- SELECT USER ---------------- */
const selectUser = async (user: ChatUser) => {
  selectedUser.value = user
  user.unreadCount = 0
  await loadConversationHistory(String(user.id))
}

/* ---------------- DELETE USERS ---------------- */
const deleteUsers = async (userIds: string[]) => {
  if (!Array.isArray(userIds) || userIds.length === 0) return

  // 1. Persist hidden IDs first
  addHiddenIds(userIds.map(String))

  // 2. Clean up IndexedDB media for deleted users
  for (const userId of userIds) {
    const user = users.value.find(u => String(u.id) === String(userId))
    if (user) {
      for (const msg of user.chat) {
        if (msg.type === 'image' && msg.imageUrl?.startsWith('idb://')) {
          await deleteMediaFromIDB(msg.imageUrl.replace('idb://', ''))
        }
        if (msg.type === 'voice' && msg.audioUrl?.startsWith('idb://')) {
          await deleteMediaFromIDB(msg.audioUrl.replace('idb://', ''))
        }
      }
    }
  }

  // 3. Remove from UI
  users.value = users.value.filter(u => !userIds.includes(String(u.id)))

  // 4. Clear selection if needed
  if (selectedUser.value && userIds.includes(String(selectedUser.value.id))) {
    selectedUser.value = users.value[0] || null
  }

  await saveUsers()

  // 5. Backend delete (best-effort)
  try {
    await Promise.allSettled(
      userIds.map(id => chatApi.deleteConversation(String(id)))
    )
  } catch (err) {
    console.warn('Backend delete error', err)
  }
}

/* ---------------- SEND MESSAGE ---------------- */
const sendMessage = async () => {
  if (!auth.isAuthenticated) { showLoginPrompt.value = true; return }
  if (!selectedUser.value || !newMessage.value.trim()) return

  const text = newMessage.value.trim()
  const receiverId = String(selectedUser.value.id)
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  selectedUser.value.chat.push({ text, sender: 'me', time, type: 'text' })
  selectedUser.value.message = text
  selectedUser.value.time = time
  newMessage.value = ""
  await moveUserToTop(receiverId)

  try {
    const s = getSocket()
    if (s?.connected) {
      sendMessageViaSocket({ receiverId, content: text, type: 'text' })
    } else {
      await chatApi.sendMessage({ receiverId, content: text, type: 'text' })
    }
  } catch (err) {
    console.error('Send failed', err)
  }
}

/* ---------------- SEND IMAGE ---------------- */
const sendImage = async (file: File) => {
  if (!selectedUser.value) return

  let imageUrl = ''
  try {
    imageUrl = await blobToDataUrl(file)
  } catch (err) {
    console.error('Image conversion failed', err); return
  }

  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  const receiverId = String(selectedUser.value.id)

  // Push real data URL into UI immediately so it shows right away
  selectedUser.value.chat.push({ text: '', sender: 'me', time, type: 'image', imageUrl })
  selectedUser.value.message = 'Sent an image'
  selectedUser.value.time = time

  // saveUsers() will automatically move base64 → idb://
  await moveUserToTop(receiverId)

  try {
    const s = getSocket()
    if (s?.connected) {
      sendMessageViaSocket({ receiverId, content: imageUrl, type: 'image' })
    } else {
      await chatApi.sendMessage({ receiverId, content: imageUrl, type: 'image' })
    }
  } catch (err) {
    console.error('Image send failed', err)
  }
}

/* ---------------- SEND VOICE ---------------- */
const sendVoice = async (audioBlob: Blob) => {
  if (!selectedUser.value) return

  let audioUrl = ''
  try {
    audioUrl = await blobToDataUrl(audioBlob)
  } catch (err) {
    console.error('Voice conversion failed', err); return
  }

  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  const receiverId = String(selectedUser.value.id)

  selectedUser.value.chat.push({ text: 'Voice message', sender: 'me', time, type: 'voice', audioUrl })
  selectedUser.value.message = 'Sent a voice message'
  selectedUser.value.time = time

  await moveUserToTop(receiverId)

  try {
    const s = getSocket()
    if (s?.connected) {
      sendMessageViaSocket({ receiverId, content: audioUrl, type: 'voice' })
    } else {
      await chatApi.sendMessage({ receiverId, content: audioUrl, type: 'voice' })
    }
  } catch (err) {
    console.error('Voice send failed', err)
  }
}

/* ---------------- INCOMING SOCKET MESSAGE ---------------- */
const handleIncomingMessage = async (msg: any) => {
  const myId = String(auth.user?.id)
  if (String(msg.senderId) === myId) return

  const otherId = String(msg.senderId)
  if (isHidden(otherId)) return

  let u = users.value.find(x => String(x.id) === otherId)
  if (!u) {
    u = {
      id: otherId,
      name: msg.senderName || 'User',
      role: 'Seller',
      message: '',
      time: new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      avatar: normalizeAvatarUrl(msg.senderAvatar || ''),
      online: true,
      chat: [],
      unreadCount: 0,
    }
    users.value.unshift(u)
  }

  const isCurrentChat = selectedUser.value && String(selectedUser.value.id) === otherId
  if (!isCurrentChat) u.unreadCount = (u.unreadCount || 0) + 1
  if (isCurrentChat) selectedUser.value = u

  const type = String(msg.type || '').toLowerCase()
  const chatEntry: ChatMessage = {
    text: type === 'text' ? String(msg.content ?? '') : type === 'voice' ? 'Voice message' : 'Sent an image',
    sender: 'them',
    time: new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    type: type === 'voice' ? 'voice' : type === 'image' ? 'image' : 'text',
    imageUrl: type === 'image' ? String(msg.content || msg.imageUrl || '') : undefined,
    audioUrl: type === 'voice' ? String(msg.content || msg.audioUrl || '') : undefined,
  }

  if (msg._id) (chatEntry as any)._id = String(msg._id)

  const isDuplicate = msg._id
    ? u.chat.some((m: any) => m._id && String(m._id) === String(msg._id))
    : u.chat.some((m: any) => {
        try {
          return (
            m.text === chatEntry.text &&
            m.sender === chatEntry.sender &&
            m.type === chatEntry.type &&
            Math.abs(new Date(m.time).getTime() - new Date(chatEntry.time).getTime()) < 2000
          )
        } catch { return false }
      })

  if (!isDuplicate) {
    u.chat.push(chatEntry as any)
    u.message = type === 'voice' ? 'Sent a voice message' : type === 'image' ? 'Sent an image' : chatEntry.text
    u.time = chatEntry.time
    await moveUserToTop(otherId)
  }
}

/* ---------------- SOCKET ---------------- */
const bindSocket = () => {
  const s = getSocket()
  if (!s) return
  s.off('message', handleIncomingMessage)
  s.on('message', handleIncomingMessage)
}

/* ---------------- LIFECYCLE ---------------- */
onMounted(async () => {
  if (!auth.isAuthenticated) {
    showLoginPrompt.value = true
    return
  }

  await loadUsers()
  await fetchUsersFromBackend()
  connectSocket()
  bindSocket()
  await initChat()
})

watch(() => route.query, async () => { await initChat() }, { deep: true })

watch(() => auth.isAuthenticated, async (val) => {
  if (val) {
    showLoginPrompt.value = false
    await loadUsers()
    await fetchUsersFromBackend()
    connectSocket()
    bindSocket()
    await initChat()
  } else {
    users.value = []
    selectedUser.value = null
    disconnectSocket()
  }
})
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
        @delete-users="deleteUsers"
      />

      <ChatWindow
        :selected-user="selectedUser"
        :messages="selectedUser?.chat || []"
        :new-message="newMessage"
        @send-message="sendMessage"
        @send-image="sendImage"
        @send-voice="sendVoice"
        @update:newMessage="newMessage = $event"
        @delete-conversation="(id: string) => deleteUsers([id])"
      />

      <LoginPromptModal
        v-if="showLoginPrompt"
        @login="() => router.push({ name: 'login', query: { redirect: '/chat' } })"
        @close="showLoginPrompt = false"
      />
    </div>
    <Footer />
  </div>
</template>

<style scoped>
.layout {
  display: flex;
  height: calc(100vh - 60px);
  font-family: 'Inter', system-ui, sans-serif;
}
</style>  