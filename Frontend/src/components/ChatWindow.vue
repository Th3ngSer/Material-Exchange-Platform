<script setup lang="ts">
import { ref } from "vue"

type Message = {
  text: string
  sender: "me" | "them"
  time: string
  type?: "text" | "image"
  imageUrl?: string
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

defineProps<{
  selectedUser: User | null
  messages: Message[]
  newMessage: string
}>()

const emit = defineEmits<{
  (e: "send-message"): void
  (e: "update:newMessage", value: string): void
  (e: "send-image", file: File): void
}>()

const fileInput = ref<HTMLInputElement | null>(null)

const handleAttachClick = () => {
  fileInput.value?.click()
}

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (file && file.type.startsWith("image/")) {
    emit("send-image", file)
  }

  target.value = ""
}
</script>

<template>
  <main class="chat-main">

    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      class="hidden"
      @change="handleFileChange"
    />

    <section v-if="!selectedUser" class="empty-state">
      <h2>Select a conversation</h2>
    </section>

    <section v-else class="chat-active">

      <!-- messages -->
      <div class="messages-area">
        <template v-for="(msg, index) in messages" :key="index">

          <!-- THEM -->
          <div v-if="msg.sender === 'them'" class="msg-row them">
            <div class="msg-body">

              <div v-if="msg.type === 'image'" class="msg-image-bubble">
                <img :src="msg.imageUrl" class="message-image" />
              </div>

              <div v-else class="msg-bubble">
                {{ msg.text }}
              </div>

              <div class="msg-info">
                <span class="msg-time">{{ msg.time }}</span>
              </div>

            </div>
          </div>

          <!-- ME -->
          <div v-else class="msg-row me">
            <div class="msg-body">

              <div v-if="msg.type === 'image'" class="msg-image-bubble">
                <img :src="msg.imageUrl" class="message-image" />
              </div>

              <div v-else class="msg-bubble">
                {{ msg.text }}
              </div>

              <div class="msg-info">
                <span class="msg-time">{{ msg.time }}</span>
              </div>

            </div>
          </div>

        </template>
      </div>

      <!-- input -->
      <div class="input-bar">
        <div class="input-inner">

          <button @click="handleAttachClick">📎</button>

          <input
            :value="newMessage"
            @input="emit('update:newMessage', ($event.target as HTMLInputElement).value)"
            @keyup.enter="emit('send-message')"
            placeholder="Type message"
            class="text-input"
          />

          <button @click="emit('send-message')">Send</button>

        </div>
      </div>

    </section>
  </main>
</template>

<style scoped>
.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  height: 100%;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
}

.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  text-align: center;
}

.empty-icon {
  width: 96px;
  height: 96px;
  background: #e2e8f0;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
}

.icon-large {
  width: 40px;
  height: 40px;
  color: #64748b;
}

.empty-state h2 {
  margin: 0 0 12px;
  font-size: 20px;
  font-weight: 700;
  color: #0f172a;
}

.empty-desc {
  margin: 0 0 28px;
  font-size: 14px;
  color: #64748b;
  line-height: 1.6;
  max-width: 420px;
}

.new-message-btn {
  background: #0f172a;
  color: #ffffff;
  border: none;
  padding: 10px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.new-message-btn:hover {
  background: #1e293b;
}

.chat-active {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.security-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 24px;
  background: #f8fafc;
  border-bottom: 1px solid #e8ecf1;
}

.security-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.security-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 600;
  color: #94a3b8;
  letter-spacing: 0.8px;
}

.green-dot {
  width: 6px;
  height: 6px;
  background: #22c55e;
  border-radius: 50%;
}

.lock-icon {
  width: 11px;
  height: 11px;
  color: #94a3b8;
}

.security-divider {
  width: 4px;
  height: 4px;
  background: #cbd5e1;
  border-radius: 50%;
}

.security-right {
  display: flex;
  align-items: center;
  gap: 4px;
}

.security-icon-btn {
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 6px;
  border-radius: 6px;
  transition: all 0.15s;
}

.security-icon-btn:hover {
  background: #e8ecf1;
  color: #64748b;
}

.sec-icon {
  width: 18px;
  height: 18px;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 24px;
  background: #ffffff;
  border-bottom: 1px solid #e8ecf1;
}

.header-user {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar-wrapper {
  position: relative;
  flex-shrink: 0;
}

.avatar-img {
  border-radius: 50%;
  object-fit: cover;
  background: #3b82f6;
}

.avatar-img.medium {
  width: 40px;
  height: 40px;
}

.avatar-img.small {
  width: 34px;
  height: 34px;
}

.online-dot {
  position: absolute;
  bottom: 0px;
  right: 0px;
  width: 11px;
  height: 11px;
  background: #22c55e;
  border-radius: 50%;
  border: 2px solid #ffffff;
  z-index: 2;
}

.header-info {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.user-name {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.2;
}

.user-role {
  margin: 0;
  font-size: 11px;
  font-weight: 500;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.6px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 2px;
}

.action-btn {
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.15s;
}

.action-btn:hover {
  background: #f1f5f9;
  color: #0f172a;
}

.action-icon {
  width: 18px;
  height: 18px;
  stroke: currentColor;
  fill: none;
}

.messages-area {
  flex: 1;
  overflow-y: auto;
  padding: 24px 32px;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.date-label {
  text-align: center;
  margin: 8px 0 16px;
}

.date-label span {
  font-size: 10px;
  font-weight: 700;
  color: #64748b;
  letter-spacing: 1.2px;
  text-transform: uppercase;
}

.msg-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  max-width: 70%;
  animation: fadeUp 0.3s ease-out;
}

.msg-row.them {
  align-self: flex-start;
}

.msg-row.me {
  align-self: flex-end;
}

.msg-body {
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-width: 100%;
}

.msg-bubble {
  padding: 12px 16px;
  border-radius: 16px;
  font-size: 14px;
  line-height: 1.5;
  color: #1e293b;
  word-break: break-word;
  background: #f1f5f9;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}

.msg-image-bubble {
  padding: 8px;
  border-radius: 16px;
  background: #f1f5f9;
  margin-bottom: 4px;
}

.message-image {
  max-width: 240px;
  max-height: 240px;
  border-radius: 12px;
  object-fit: cover;
  cursor: pointer;
  transition: transform 0.2s;
}

.msg-info {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 0 4px;
}

.msg-row.me .msg-info {
  justify-content: flex-end;
}

.msg-time {
  font-size: 11px;
  color: #94a3b8;
  font-weight: 500;
}

.msg-avatar {
  flex-shrink: 0;
  width: 34px;
  height: 34px;
}

.msg-dot { 
  font-size: 10px; 
  color: #CBD5E1; 
}

.msg-read {
  font-size: 10px;
  color: #94a3b8;
  font-weight: 600;
  letter-spacing: 0.3px;
}

.input-bar {
  padding: 16px 24px;
  background: #ffffff;
  border-top: 1px solid #e8ecf1;
}

.input-inner {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #e8ecf1;
  border-radius: 12px;
  padding: 8px 8px 8px 12px;
}

.ico {
  width: 20px;
  height: 20px;
  stroke: currentColor;
  fill: none;
}

.text-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 14px;
  color: #0f172a;
  outline: none;
  padding: 4px 0;
  min-width: 0;
}

.send-icon-btn {
  background: #f97316;
  border: none;
  color: #ffffff;
  cursor: pointer;
  padding: 10px;
  border-radius: 10px;
  transition: all 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.send-icon-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.send-ico {
  width: 18px;
  height: 18px;
}

.hidden {
  display: none;
}
</style>
