<script setup lang="ts">
import { ref } from "vue"
import ChatSidebar from "../components/ChatSidebar.vue"
import ChatWindow from "../components/ChatWindow.vue"
import { useChatStore } from "../stores/chat"

type Message = {
  text: string
  sender: "me" | "them"
  time: string
}

type User = {
  id: number
  name: string
  role: string
  message: string
  time: string
  avatar: string
  online?: boolean
  chat: Message[]
}

const users = ref<User[]>([
  {
    id: 1,
    name: "Meng Leang",
    role: "Senior Site Engineer",
    message: "The structural blueprints for the atrium are...",
    time: "12:49 PM",
    avatar: "ML",
    online: true,
    chat: [
      {
        text: "Good morning. I've reviewed the specifications for the selected clothing items, and the fabric quality and sizing appear suitable for our needs. Could you please confirm the availability of 200 units by next Tuesday?",
        sender: "them",
        time: "10:15 AM"
      },
      {
        text: "Absolutely. We currently have 240 items available in our local stock. I can reserve 200 units for your order immediately.",
        sender: "me",
        time: "10:20 AM"
      }
    ]
  },
  {
    id: 2,
    name: "Tola Seng",
    role: "Project Manager",
    message: "Can we discuss the load-bearing requireme...",
    time: "Just now",
    avatar: "TS",
    online: true,
    chat: []
  },
  {
    id: 3,
    name: "Sok Sambath",
    role: "Consultant",
    message: "Thank you for the consultation on the facad...",
    time: "Yesterday",
    avatar: "SS",
    online: false,
    chat: []
  },
  {
    id: 4,
    name: "Keang SreyLak",
    role: "Logistics",
    message: "The equipment has been shipped to the site.",
    time: "Monday",
    avatar: "KS",
    online: false,
    chat: []
  },
  {
    id: 5,
    name: "Sreynea Em",
    role: "Designer",
    message: "Let's look at the color palette for the interior.",
    time: "Oct 10",
    avatar: "SE",
    online: true,
    chat: []
  }
])

const chatStore = useChatStore()
const selectedUser = ref<User | null>(null)
const newMessage = ref("")

const selectUser = (user: User) => {
  selectedUser.value = user
}

const sendMessage = () => {
  if (!selectedUser.value || !newMessage.value.trim()) return

  const now = new Date()
  const timeString = now.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  })

  selectedUser.value.chat.push({
    text: newMessage.value,
    sender: "me",
    time: timeString
  })

  const msg = newMessage.value
  newMessage.value = ""

  // Fake auto-reply after 1 second (for demo)
  // setTimeout(() => {
  //   const replyTime = new Date().toLocaleTimeString([], { 
  //     hour: '2-digit', 
  //     minute: '2-digit' 
  //   })
  //   selectedUser.value?.chat.push({
  //     text: "Thanks for your message! I'll get back to you soon.",
  //     sender: "them",
  //     time: replyTime
  //   })
  // }, 1000)
}
const formatTime = (time: string) => time
</script>

<template>
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
      @update:new-message="newMessage = $event"
    />
    
  </div>
</template>

<style scoped>
.layout { 
  display: flex; 
  height: calc(100vh - 60px); 
  font-family: 'Inter', system-ui, sans-serif; 
}
</style>