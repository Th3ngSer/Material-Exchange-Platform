<script setup lang="ts">
import { ref } from 'vue'
import { useLanguageStore } from '@/stores/language'

type Message = {
  text: string
  sender: 'me' | 'them'
  time: string
  type?: 'text' | 'image'
  imageUrl?: string
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

const props = defineProps<{
  selectedUser: User | null
  messages: Message[]
  newMessage: string
}>()

const emit = defineEmits<{
  (e: 'send-message'): void
  (e: 'update:newMessage', value: string): void
  (e: 'send-image', file: File): void // ✅ Added: Image send event
}>()

// Current user's avatar
const currentUserAvatar = 'https://api.dicebear.com/7.x/avataaars/svg?seed=CurrentUser'

const fileInput = ref<HTMLInputElement | null>(null)
const languageStore = useLanguageStore()

const handleAttachClick = () => {
  fileInput.value?.click()
}

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  // if (file) {
  //   if (file.type.startsWith('image/')) {
  //     emit('send-image', file)
  //   } else {
  //     alert('Please select an image file')
  //   }
  // }

  if (target) {
    target.value = ''
  }
}
</script>

<template>
  <main class="chat-main">
    <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="handleFileChange" />

    <section v-if="!selectedUser" class="empty-state">
      <div class="empty-icon">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          class="icon-large"
        >
          <path
            fill-rule="evenodd"
            d="M4.804 21.644A6.707 6.707 0 006 21.75a6.721 6.721 0 003.583-1.029c.774.182 1.584.279 2.417.279 5.322 0 9.75-3.97 9.75-9 0-5.03-4.428-9-9.75-9s-9.75 3.97-9.75 9c0 2.409 1.025 4.587 2.674 6.192.232.226.277.428.254.543a3.73 3.73 0 01-.814 1.686.75.75 0 00.44 1.223zM8.25 10.875a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25zM10.875 12a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zm4.875-1.125a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25z"
            clip-rule="evenodd"
          />
        </svg>
      </div>
      <h2><!-- {{ languageStore.t('selectConversation') }} -->Select a conversation</h2>
      <p class="empty-desc">
        A secure and integrated platform that empowers professionals to connect, collaborate, and
        conduct transactions, including the buying, selling, exchanging, lending, and borrowing of
        materials and services.
      </p>
      <button class="new-message-btn"><!-- {{ languageStore.t('newMessage') }} -->New Message</button>
    </section>

    <section v-else class="chat-active">
      <!-- Security Bar -->
      <div class="security-bar">
        <div class="security-left">
          <span class="security-item"><span class="green-dot"></span><!-- {{ languageStore.t('secureConnection') }} -->Secure connection</span>
          <span class="security-divider"></span>
          <span class="security-item">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              class="lock-icon"
            >
              <path
                fill-rule="evenodd"
                d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z"
                clip-rule="evenodd"
              />
            </svg>
            <!-- {{ languageStore.t('endToEndEncrypted') }} -->End-to-end encrypted
          </span>
        </div>
        <div class="security-right">
          <button class="security-icon-btn" title="Help">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              class="sec-icon"
            >
              <path
                fill-rule="evenodd"
                d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm11.378-3.917c-.89-.777-2.366-.777-3.255 0a.75.75 0 01-.988-1.129c1.454-1.272 3.776-1.272 5.23 0 1.513 1.324 1.513 3.518 0 4.842a3.75 3.75 0 01-.837.552c-.676.328-1.028.774-1.028 1.152v.75a.75.75 0 01-1.5 0v-.75c0-1.279 1.06-2.107 1.875-2.502.182-.088.351-.199.503-.331.83-.727.83-1.857 0-2.584zM12 18a.75.75 0 100-1.5.75.75 0 000 1.5z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
          <button class="security-icon-btn" title="Settings">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              class="sec-icon"
            >
              <path
                fill-rule="evenodd"
                d="M11.078 2.25c-.917 0-1.699.663-1.85 1.567L9.05 4.889c-.02.12-.115.26-.297.348a7.493 7.493 0 00-.986.57c-.166.115-.334.126-.45.083L6.3 5.508a1.875 1.875 0 00-2.282.819l-.922 1.597a1.875 1.875 0 00.432 2.385l.84.692c.095.078.17.229.154.43a7.598 7.598 0 000 1.139c.015.2-.059.352-.153.43l-.841.692a1.875 1.875 0 00-.432 2.385l.922 1.597a1.875 1.875 0 002.282.818l1.019-.382c.115-.043.283-.031.45.082.312.214.641.405.985.57.182.088.277.228.297.35l.178 1.071c.151.904.933 1.567 1.85 1.567h1.844c.916 0 1.699-.663 1.85-1.567l.178-1.072c.02-.12.114-.26.297-.349.344-.165.673-.356.985-.57.167-.114.335-.125.45-.082l1.02.382a1.875 1.875 0 002.28-.819l.923-1.597a1.875 1.875 0 00-.432-2.385l-.84-.692c-.095-.078-.17-.229-.154-.43a7.614 7.614 0 000-1.139c-.016-.2.059-.352.153-.43l.84-.692c.708-.582.891-1.59.433-2.385l-.922-1.597a1.875 1.875 0 00-2.282-.818l-1.02.382c-.114.043-.282.031-.449-.083a7.49 7.49 0 00-.985-.57c-.183-.087-.277-.227-.297-.348l-.179-1.072a1.875 1.875 0 00-1.85-1.567h-1.843zM12 15.75a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>

      <!-- Chat Header -->
      <div class="chat-header">
        <div class="header-user">
          <div class="avatar-wrapper">
            <img
              :src="selectedUser.avatar"
              :alt="selectedUser.name"
              class="avatar-img medium"
              @error="
                ($event.target as HTMLImageElement).src =
                  'https://api.dicebear.com/7.x/avataaars/svg?seed=' + selectedUser.name
              "
            />
            <span v-if="selectedUser.online" class="online-dot"></span>
          </div>
          <div class="header-info">
            <h2 class="user-name">{{ selectedUser.name }}</h2>
            <p class="user-role">{{ selectedUser.role }}</p>
          </div>
        </div>
        <div class="header-actions">
          <button class="action-btn" title="Call">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="action-icon"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path
                d="M5 4h4l2 5l-2.5 1.5a11 11 0 0 0 5 5l1.5 -2.5l5 2v4a2 2 0 0 1 -2 2a16 16 0 0 1 -15 -15a2 2 0 0 1 2 -2"
              />
            </svg>
          </button>
          <button class="action-btn" title="Video call">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              class="action-icon"
            >
              <path
                d="M4.5 4.5a3 3 0 00-3 3v9a3 3 0 003 3h8.25a3 3 0 003-3v-9a3 3 0 00-3-3H4.5zM19.94 18.75l-2.69-2.69V7.94l2.69-2.69c.944-.945 2.56-.276 2.56 1.06v11.38c0 1.336-1.616 2.005-2.56 1.06z"
              />
            </svg>
          </button>
          <button class="action-btn" title="Search">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              class="action-icon"
            >
              <path
                fill-rule="evenodd"
                d="M10.5 3.75a6.75 6.75 0 100 13.5 6.75 6.75 0 000-13.5zM2.25 10.5a8.25 8.25 0 1114.59 5.28l4.69 4.69a.75.75 0 11-1.06 1.06l-4.69-4.69A8.25 8.25 0 012.25 10.5z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
          <button class="action-btn" title="More">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              class="action-icon"
            >
              <path
                fill-rule="evenodd"
                d="M10.5 6a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zm0 6a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zm0 6a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
          <button class="action-btn" title="Close">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              class="action-icon"
            >
              <path
                fill-rule="evenodd"
                d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>

      <!-- Messages -->
      <div class="messages-area">
        <div class="date-label"><span>MARCH 24, 2026</span></div>

        <template v-for="(msg, index) in messages" :key="index">
          <!-- RECEIVED (Them): Avatar Left, Bubble Right -->
          <div v-if="msg.sender === 'them'" class="msg-row them">
            <div class="msg-avatar">
              <div class="avatar-wrapper">
                <img
                  :src="selectedUser.avatar"
                  :alt="selectedUser.name"
                  class="avatar-img small"
                  @error="
                    ($event.target as HTMLImageElement).src =
                      'https://api.dicebear.com/7.x/avataaars/svg?seed=' + selectedUser.name
                  "
                />
                <span v-if="selectedUser.online" class="online-dot"></span>
              </div>
            </div>
            <div class="msg-body">
              <!--  Image Message -->
              <div v-if="msg.type === 'image' && msg.imageUrl" class="msg-image-bubble">
                <img :src="msg.imageUrl" alt="Shared image" class="message-image" />
              </div>
              <!-- Text Message -->
              <div v-else class="msg-bubble">{{ msg.text }}</div>
              <div class="msg-info">
                <span class="msg-time">{{ msg.time }}</span>
                <span class="msg-dot">·</span>
                <span class="msg-read">READ</span>
              </div>
            </div>
          </div>

          <div v-if="msg.sender === 'me'" class="msg-row me">
            <div class="msg-body">
              <div v-if="msg.type === 'image' && msg.imageUrl" class="msg-image-bubble">
                <img :src="msg.imageUrl" alt="Sent image" class="message-image" />
              </div>
              <div v-else class="msg-bubble">{{ msg.text }}</div>
              <div class="msg-info">
                <span class="msg-time">{{ msg.time }}</span>
                <span class="msg-dot">·</span>
                <span class="msg-read">READ</span>
              </div>
            </div>
            <div class="msg-avatar">
              <div class="avatar-wrapper">
                <img :src="currentUserAvatar" alt="Me" class="avatar-img small" />
              </div>
            </div>
          </div>
        </template>
      </div>

      <!-- Input Bar -->
      <div class="input-bar">
        <div class="input-inner">
          <button class="input-icon-btn" title="Voice message">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              class="ico"
            >
              <path d="M8.25 4.5a3.75 3.75 0 117.5 0v8.25a3.75 3.75 0 11-7.5 0V4.5z" />
              <path
                d="M6 10.5a.75.75 0 01.75.75v1.5a5.25 5.25 0 1010.5 0v-1.5a.75.75 0 011.5 0v1.5a6.751 6.751 0 01-6 6.709v2.291h3a.75.75 0 010 1.5h-7.5a.75.75 0 010-1.5h3v-2.291a6.751 6.751 0 01-6-6.709v-1.5A.75.75 0 016 10.5z"
              />
            </svg>
          </button>

          <button class="input-icon-btn" title="Attach file" @click="handleAttachClick">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="ico"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path
                d="M15 7l-6.5 6.5a1.5 1.5 0 0 0 3 3l6.5 -6.5a3 3 0 0 0 -6 -6l-6.5 6.5a4.5 4.5 0 0 0 9 9l6.5 -6.5"
              />
            </svg>
          </button>

          <input
            :value="newMessage"
            @input="emit('update:newMessage', ($event.target as HTMLInputElement).value)"
            @keyup.enter="emit('send-message')"
            placeholder="Type your message"
            class="text-input"
          />

          <button class="input-icon-btn" title="Emoji">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              class="ico"
            >
              <path
                fill-rule="evenodd"
                d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-2.625 6c-.54 0-.828.419-.936.634a1.96 1.96 0 00-.189.866c0 .298.059.605.189.866.108.215.395.634.936.634.54 0 .828-.419.936-.634.13-.26.189-.568.189-.866 0-.298-.059-.605-.189-.866-.108-.215-.395-.634-.936-.634zm4.314.634c.108-.215.395-.634.936-.634.54 0 .828.419.936.634.13.26.189.568.189.866 0 .298-.059.605-.189.866-.108.215-.395.634-.936.634-.54 0-.828-.419-.936-.634a1.96 1.96 0 01-.189-.866c0-.298.059-.605.189-.866zm2.023 6.828a.75.75 0 10-1.06-1.06 3.75 3.75 0 01-5.304 0 .75.75 0 00-1.06 1.06 5.25 5.25 0 007.424 0z"
                clip-rule="evenodd"
              />
            </svg>
          </button>

          <button
            class="send-icon-btn"
            @click="emit('send-message')"
            :disabled="!newMessage.trim()"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              class="send-ico"
            >
              <path
                d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z"
              />
            </svg>
          </button>
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

.msg-dot {
  font-size: 10px;
  color: #cbd5e1;
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
