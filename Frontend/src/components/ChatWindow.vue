<script setup lang="ts">
import { ref, computed, watch, nextTick } from "vue"
import { useAuthStore } from "../stores/auth"
import type { ChatMessage, ChatUser } from '@/types/chat'

const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
const API_URL = apiBaseUrl.replace(/\/api\/?$/, '')

const props = defineProps<{
  selectedUser: ChatUser | null
  messages: ChatMessage[]
  newMessage: string
}>()

const emit = defineEmits<{
  (e: "send-message"): void
  (e: "update:newMessage", value: string): void
  (e: "send-image", file: File): void
  (e: "send-voice", audio: Blob): void
}>()

const fileInput = ref<HTMLInputElement | null>(null)
const messagesArea = ref<HTMLElement | null>(null)
const mediaRecorder = ref<MediaRecorder | null>(null)
const audioChunks = ref<Blob[]>([])
const isRecording = ref(false)
const voiceAudio = ref<HTMLAudioElement | null>(null)
const activeVoiceIndex = ref<number | null>(null)
const voiceProgress = ref(0)
const voiceDuration = ref(0)
const voiceCurrentTime = ref(0)
const recordingElapsed = ref(0)
let recordingInterval: number | null = null
const shouldSendRecording = ref(true)

const authStore = useAuthStore()
const currentUserName = computed(() => authStore.user?.name || 'You')
const normalizeAvatarUrl = (value: string | undefined | null, fallbackName = 'User') => {
  const normalized = String(value || '').trim()
  if (!normalized || normalized.toLowerCase() === 'null' || normalized.toLowerCase() === 'undefined') {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(fallbackName)}&background=0D8ABC&color=fff`
  }
  if (normalized.startsWith('http')) {
    return normalized
  }
  if (normalized.startsWith('/')) {
    return `${API_URL}${normalized}`
  }
  return `${API_URL}/${normalized}`
}

const currentUserAvatar = computed(() => {
  const savedAvatar = authStore.user?.id
    ? localStorage.getItem(`avatar_${authStore.user.id}`)
    : null

  return normalizeAvatarUrl(
    authStore.user?.avatar || savedAvatar,
    authStore.user?.name || 'User',
  )
})

const getAvatarFromStore = (user: ChatUser | null) => {
  if (!user) {
    return 'https://via.placeholder.com/48'
  }

  if (user.avatar) {
    return normalizeAvatarUrl(user.avatar, user.name)
  }

  const stored = localStorage.getItem(`avatar_${String(user.id)}`)
  if (stored) {
    return normalizeAvatarUrl(stored, user.name)
  }

  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    user.name || 'User'
  )}&background=0D8ABC&color=fff`
}

const updateNewMessage = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit("update:newMessage", target.value)
}

// Auto-scroll to bottom when messages change
const scrollToBottom = async () => {
  await nextTick()
  if (messagesArea.value) {
    messagesArea.value.scrollTop = messagesArea.value.scrollHeight
  }
}
watch(
  () => props.messages,
  () => {
    scrollToBottom()
  },
  { deep: true }
)

//Scroll when user changes
watch(
  () => props.selectedUser,
  () => {
    scrollToBottom()
  }
)

// ATTACH FILE
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

const startRecording = async () => {
  if (!navigator.mediaDevices?.getUserMedia) {
    window.alert('Voice recording is not supported in this browser.')
    return
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const recorder = new MediaRecorder(stream)
    mediaRecorder.value = recorder
    audioChunks.value = []

    recorder.ondataavailable = (event: BlobEvent) => {
      if (event.data.size > 0) {
        audioChunks.value.push(event.data)
      }
    }

    recorder.onstop = () => {
      const audioBlob = new Blob(audioChunks.value, { type: 'audio/webm' })
      if (shouldSendRecording.value) {
        emit('send-voice', audioBlob)
      }
      stream.getTracks().forEach((track) => track.stop())
      isRecording.value = false
      recordingElapsed.value = 0
      if (recordingInterval !== null) {
        window.clearInterval(recordingInterval)
        recordingInterval = null
      }
      audioChunks.value = []
      shouldSendRecording.value = true
    }

    recorder.start()
    isRecording.value = true
    recordingElapsed.value = 0
    shouldSendRecording.value = true
    recordingInterval = window.setInterval(() => {
      recordingElapsed.value += 1
    }, 1000)
  } catch (err) {
    console.error('Recording failed', err)
    window.alert('Unable to start audio recording.')
  }
}

const stopRecording = () => {
  if (mediaRecorder.value?.state === 'recording') {
    // by default, stopping will send the recording
    shouldSendRecording.value = true
    mediaRecorder.value.stop()
  }
}

const cancelRecording = () => {
  // stop and discard the recording
  if (mediaRecorder.value?.state === 'recording') {
    shouldSendRecording.value = false
    mediaRecorder.value.stop()
  }
  audioChunks.value = []
  isRecording.value = false
  recordingElapsed.value = 0
  if (recordingInterval !== null) {
    window.clearInterval(recordingInterval)
    recordingInterval = null
  }
}

const toggleRecording = () => {
  if (isRecording.value) {
    stopRecording()
  } else {
    startRecording()
  }
}

const formatSeconds = (value: number) => {
  const seconds = Math.floor(value)
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const stopVoice = () => {
  if (voiceAudio.value) {
    voiceAudio.value.pause()
    voiceAudio.value.currentTime = 0
  }
  activeVoiceIndex.value = null
  voiceProgress.value = 0
  voiceCurrentTime.value = 0
  voiceDuration.value = 0
}

const playVoice = (msg: ChatMessage, index: number) => {
  if (!msg.audioUrl) return

  if (activeVoiceIndex.value === index) {
    stopVoice()
    return
  }

  stopVoice()

  const audio = new Audio(msg.audioUrl)
  voiceAudio.value = audio
  activeVoiceIndex.value = index

  audio.onloadedmetadata = () => {
    voiceDuration.value = audio.duration || 0
  }

  audio.ontimeupdate = () => {
    voiceCurrentTime.value = audio.currentTime
    voiceProgress.value = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0
  }

  audio.onended = () => {
    stopVoice()
  }

  audio.play().catch((err) => {
    console.error('Voice playback failed', err)
    stopVoice()
  })
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

    <section v-if="!props.selectedUser" class="empty-state">
      <h2>Select a conversation</h2>
    </section>

    <section v-else class="chat-active">

      <!-- Chat Header -->
      <div class="chat-header">
        <div class="header-user">
          <div class="avatar-wrapper">
            <img 
              :src="getAvatarFromStore(props.selectedUser)"
              :alt="props.selectedUser?.name || ''"
              class="avatar-img medium"
            />
            <div v-if="props.selectedUser?.online" class="online-dot"></div>
          </div>
          <div class="header-info">
            <p class="user-name">{{ props.selectedUser?.name }}</p>
            <p class="user-role">{{ props.selectedUser?.role }}</p>
          </div>
        </div>
      </div>

      <!-- messages -->
      <div ref="messagesArea" class="messages-area">

        <div v-for="(msg, index) in props.messages" :key="index" class="msg-row-container">

          <!-- THEM -->
          <div v-if="msg.sender === 'them'" class="msg-row them">
            <img
              class="msg-avatar"
              :src="getAvatarFromStore(props.selectedUser)"
              :alt="props.selectedUser?.name || 'Sender'"
            />
            <div class="msg-body">
              <div class="msg-meta">
                <span class="msg-sender">{{ props.selectedUser?.name || 'Seller' }}</span>
              </div>

              <!-- FIX 2: SAFE IMAGE -->
              <div v-if="msg.type === 'image' && msg.imageUrl">
                <img :src="msg.imageUrl" class="message-image" />
              </div>

              <div v-else-if="msg.type === 'voice' && msg.audioUrl" :class="['voice-bubble','voice-them',{playing: activeVoiceIndex === index}]">
                <button
                  type="button"
                  class="voice-play-button"
                  @click="playVoice(msg, index)"
                >
                  <span v-if="activeVoiceIndex === index">❚❚</span>
                  <span v-else>▶</span>
                </button>
                <div class="voice-content">
                  <div class="voice-track">
                    <div
                      class="voice-progress"
                      :style="{ width: activeVoiceIndex === index ? `${voiceProgress}%` : '0%' }"
                    />
                  </div>
                  <div class="voice-meta">
                    <!-- LEFT: total duration -->
                    <!-- <span class="voice-duration-left">
                      {{ formatSeconds(voiceDuration) }}
                    </span> -->

                    <!-- RIGHT: current playing time -->
                    <span class="voice-duration-right">
                      {{ activeVoiceIndex === index
                        ? formatSeconds(voiceCurrentTime)
                        : formatSeconds(voiceDuration) }}
                    </span>
                  </div>
                </div>
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
              <div class="msg-meta msg-meta-right">
                <span class="msg-sender">{{ currentUserName }}</span>
              </div>

              <!-- FIX 2: SAFE IMAGE -->
              <div v-if="msg.type === 'image' && msg.imageUrl">
                <img :src="msg.imageUrl" class="message-image" />
              </div>

              <div v-else-if="msg.type === 'voice' && msg.audioUrl" :class="['voice-bubble','voice-me',{playing: activeVoiceIndex === index}]">
                <button
                  type="button"
                  class="voice-play-button"
                  @click="playVoice(msg, index)"
                >
                  <span v-if="activeVoiceIndex === index">❚❚</span>
                  <span v-else>▶</span>
                </button>
                <div class="voice-content">
                  <div class="voice-track">
                    <div
                      class="voice-progress"
                      :style="{ width: activeVoiceIndex === index ? `${voiceProgress}%` : '0%' }"
                    />
                  </div>
                  <div class="voice-meta">
                    <!-- LEFT: total duration -->
                    <!-- <span class="voice-duration-left">
                      {{ formatSeconds(voiceDuration) }}
                    </span> -->

                    <!-- RIGHT: current playing time -->
                    <span class="voice-duration-right">
                      {{ activeVoiceIndex === index
                        ? formatSeconds(voiceCurrentTime)
                        : formatSeconds(voiceDuration) }}
                    </span>
                  </div>
                </div>
              </div>

              <div v-else class="msg-bubble">
                {{ msg.text }}
              </div>

              <div class="msg-info">
                <span class="msg-time">{{ msg.time }}</span>
              </div>

            </div>
            <img
              class="msg-avatar"
              :src="currentUserAvatar"
              :alt="currentUserName"
            />
          </div>

        </div>

      </div>

      <!-- input -->
      <div v-if="isRecording" class="recording-overlay">
        <div class="recording-inner">
          <div class="recording-left">
            <div class="recording-dot">●</div>
            <div class="recording-time">{{ formatSeconds(recordingElapsed) }}</div>
          </div>
          <div class="recording-actions">
            <button @click="cancelRecording" class="record-btn cancel">Cancel</button>
            <button @click="stopRecording" class="record-btn stop">Stop</button>
          </div>
        </div>
      </div>

      <div class="input-bar">
        <div class="input-inner">
          <button @click="handleAttachClick" title="Attach image" class="p-2 rounded-ful hover:bg-grey-100 cursor-pointer ">
            
            <!-- Paperclip icon -->
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" stroke-width="1.8"
                stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 12.5l-8.6 8.6a5.5 5.5 0 01-7.8-7.8l9.2-9.2a3.8 3.8 0 015.4 5.4l-9.2 9.2a2.2 2.2 0 01-3.1-3.1l8.6-8.6"/>
            </svg>

          </button>

          <button
            @click="toggleRecording"
            type="button"
            class="voice-btn"
            :class="{ recording: isRecording }"
            title="Record voice message"
          >
            <!-- Mic icon (Telegram style) -->
            <svg
              v-if="!isRecording"
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
              <line x1="12" y1="19" x2="12" y2="23"/>
            </svg>

            <!-- Recording icon -->
            <span v-else class="recording-dot">●</span>
          </button>

          <input
            :value="props.newMessage"
            @input="updateNewMessage"
            @keyup.enter="emit('send-message')"
            placeholder="វាយសារ"
            class="text-input"
          />

          <button @click="emit('send-message')" type="button" class="send-icon-btn" title="Send message">
            <!-- Send Icon (same style as voice icon) -->
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
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
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
}

.avatar-img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  overflow: hidden;
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

.message-audio {
  width: 100%;
  max-width: 240px;
  border-radius: 12px;
}

.voice-bubble {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  border-radius: 20px;
  max-width: 360px;
}

/* Incoming (left) */
.voice-bubble.voice-them {
  background: #f3f4f6;
  color: #0f172a;
  flex-direction: row; /* play button left */
}

.voice-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #e8ecf1;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
}

.voice-btn.recording {
  background: #ff3b30;
  color: white;
}

.record-dot {
  color: white;
  font-size: 18px;
}

.voice-meta {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-top: 4px;
  font-size: 11px;
  width: 100%;
}
/* 
.voice-duration-left {
  opacity: 0.7;
}

.voice-duration-right {
  font-weight: 600;
} */

/* Outgoing (right) - Telegram blue */
.voice-bubble.voice-me {
  background: linear-gradient(90deg,#2a9df4,#1b85e6);
  color: #fff;
  flex-direction: row; /* play button left */
}

/* play button */
.voice-play-button {
  width: 36px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  font-size: 14px;
}

.voice-bubble.voice-them .voice-play-button {
  background: #ffffff;
  color: #1e88f0;
  box-shadow: 0 1px 2px rgba(0,0,0,0.06);
}

.voice-bubble.voice-me .voice-play-button {
  background: rgba(255,255,255,0.18);
  color: #fff;
}

/* waveform track */
.voice-track {
  width: 220px;
  height: 36px;
  border-radius: 8px;
  position: relative;
  overflow: hidden;
  background: repeating-linear-gradient(90deg, rgba(255,255,255,0.06) 0 6px, rgba(255,255,255,0.02) 6px 12px);
}

.voice-bubble.voice-them .voice-track {
  background: repeating-linear-gradient(90deg, rgba(15,23,42,0.04) 0 6px, rgba(15,23,42,0.02) 6px 12px);
}

.voice-progress {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 0%;
  transition: width 0.12s linear;
}

.voice-bubble.voice-me .voice-progress {
  background: linear-gradient(90deg, rgba(255,255,255,0.25), rgba(255,255,255,0.12));
}

.voice-bubble.voice-them .voice-progress {
  background: linear-gradient(90deg, rgba(37,99,235,0.18), rgba(96,165,250,0.06));
}

.voice-bubble.playing .voice-play-button {
  transform: scale(0.98);
  box-shadow: 0 0 8px rgba(0,0,0,0.08) inset;
}

.voice-label {
  font-size: 12px;
  color: inherit;
}

.input-inner button.recording {
  background: #ef4444;
  color: white;
}

.recording-overlay {
  padding: 10px 16px;
  background: rgba(15,23,42,0.02);
  border-radius: 12px;
  margin: 12px 24px;
}

.recording-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.recording-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* .recording-dot {
  color: #ef4444;
  font-size: 18px;
} */

.recording-time {
  font-weight: 700;
}

.recording-actions {
  display: flex;
  gap: 8px;
}

.record-btn {
  padding: 6px 10px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
}

.record-btn.cancel {
  background: transparent;
  color: #ef4444;
}

.record-btn.stop {
  background: #ef4444;
  color: white;
}

.msg-info {
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
  width: 40px;
  height: 40px;
  min-width: 40px;
  min-height: 40px;
  border-radius: 50%;
  object-fit: cover;
  overflow: hidden;
  border: 2px solid #e2e8f0;
  background: #cbd5e1;
}

.msg-row-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.msg-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 11px;
  color: #64748b;
}

.msg-meta-right {
  justify-content: flex-end;
}

.msg-sender {
  font-weight: 700;
  color: #1e293b;
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
