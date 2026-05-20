<script setup lang="ts">
import { ref } from "vue"
import ChatSidebar from "../components/ChatSidebar.vue"
import ChatWindow from "../components/ChatWindow.vue"
import Header from "../components/layout/Header.vue"

import { useAuthStore } from "../stores/auth"

const auth = useAuthStore()

// login user (fallback localStorage)
const currentUser = auth.user || JSON.parse(localStorage.getItem("user") || "null")

type Message = {
  text: string
  sender: "me" | "them"
  time: string
  type?: "text" | "image"
  imageUrl?: string
}

type User = {
  id: string
  name: string
  role: string
  message: string
  time: string
  avatar: string
  online?: boolean
  chat: Message[]
}

// ❌ NO FAKE USERS
const users = ref<User[]>([])

const selectedUser = ref<User | null>(null)
const newMessage = ref("")

const selectUser = (user: User) => {
  selectedUser.value = user
}

const sendMessage = () => {
  if (!selectedUser.value || !newMessage.value.trim()) return

  const now = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })

  selectedUser.value.chat.push({
    text: newMessage.value,
    sender: "me",
    time: now,
  })

  newMessage.value = ""
}

const sendImage = (file: File) => {
  if (!selectedUser.value) return

  const imageUrl = URL.createObjectURL(file)

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
        @update:newMessage="newMessage = $event"
      />
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