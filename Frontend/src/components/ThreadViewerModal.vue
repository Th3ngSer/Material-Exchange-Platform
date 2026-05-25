<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  isOpen: boolean
  threadId?: number
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

// Mock thread data
const messages = ref([
  {
    id: 1,
    sender: 'You',
    time: '2h ago',
    content: 'Hi, are the aluminum sheets still available?',
    avatar: '👤',
  },
  {
    id: 2,
    sender: 'Alex Rivet',
    time: '1h 45m ago',
    content: 'Yes, they are! All 50 sheets in stock. Perfect condition, just received them last week.',
    avatar: '👨',
  },
  {
    id: 3,
    sender: 'You',
    time: '1h 30m ago',
    content: 'Great! Can I pick them up tomorrow around 2 PM?',
    avatar: '👤',
  },
  {
    id: 4,
    sender: 'Alex Rivet',
    time: '1h ago',
    content: 'That works perfectly! I\'ll have them ready. What\'s your phone number for the day?',
    avatar: '👨',
  },
])

const newMessage = ref('')

const sendMessage = () => {
  if (newMessage.value.trim()) {
    messages.value.push({
      id: messages.value.length + 1,
      sender: 'You',
      time: 'now',
      content: newMessage.value,
      avatar: '👤',
    })
    newMessage.value = ''
  }
}

const closeModal = () => {
  emit('close')
}
</script>

<template>
  <transition name="modal">
    <div v-if="isOpen" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <!-- Header -->
        <div class="modal-header">
          <h2 class="modal-title">Conversation Thread</h2>
          <button class="close-btn" @click="closeModal" aria-label="Close">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          </button>
        </div>

        <!-- Messages -->
        <div class="messages-container">
          <div v-for="msg in messages" :key="msg.id" class="message" :class="msg.sender === 'You' ? 'own' : 'other'">
            <div class="message-avatar">{{ msg.avatar }}</div>
            <div class="message-body">
              <div class="message-header">
                <span class="message-sender">{{ msg.sender }}</span>
                <span class="message-time">{{ msg.time }}</span>
              </div>
              <p class="message-content">{{ msg.content }}</p>
            </div>
          </div>
        </div>

        <!-- Input -->
        <div class="input-section">
          <div class="input-group">
            <textarea
              v-model="newMessage"
              placeholder="Type your message..."
              class="message-input"
              rows="2"
              @keydown.enter.ctrl="sendMessage"
            />
            <button class="send-btn" @click="sendMessage" :disabled="!newMessage.trim()">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M16.6915026,12.4744748 L3.50612381,13.2599618 C3.19218622,13.2599618 3.03521743,13.4170592 3.03521743,13.5741566 L1.15159189,20.0151496 C0.8376543,20.8006365 0.99,21.89 1.77946707,22.52 C2.41,22.99 3.50612381,23.1 4.13399899,22.8429026 L21.714504,14.0454487 C22.6563168,13.5741566 23.1272231,12.6315722 22.9702544,11.6889879 L4.13399899,3.20647893 C3.34915502,2.89612269 2.40734225,3.0532201 1.77946707,3.52088021 C0.994623095,4.13399899 0.837654326,5.06399899 1.15159189,5.84915502 L3.03521743,12.2901479 C3.03521743,12.4472453 3.2922148,12.6043427 3.50612381,12.6043427 L16.6915026,13.3898296 C16.6915026,13.3898296 17.1624089,13.3898296 17.1624089,12.9185375 L17.1624089,12.4744748 C17.1624089,12.0314047 16.6915026,12.4744748 16.6915026,12.4744748 Z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  height: 80vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #eee;
}

.modal-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1a1f3c;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #8b90a7;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #f4f5fb;
  color: #1a1f3c;
}

.close-btn svg {
  width: 20px;
  height: 20px;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message {
  display: flex;
  gap: 12px;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message.own {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f4f5fb;
  font-size: 20px;
  flex-shrink: 0;
}

.message-body {
  flex: 1;
  min-width: 0;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.message-sender {
  font-weight: 600;
  color: #1a1f3c;
  font-size: 14px;
}

.message-time {
  font-size: 12px;
  color: #8b90a7;
}

.message-content {
  margin: 0;
  color: #1a1f3c;
  line-height: 1.5;
  font-size: 14px;
  background: #f4f5fb;
  padding: 12px;
  border-radius: 8px;
}

.message.own .message-content {
  background: #ff6b35;
  color: white;
}

.input-section {
  padding: 16px 24px;
  border-top: 1px solid #eee;
  background: #f9f9fb;
}

.input-group {
  display: flex;
  gap: 8px;
}

.message-input {
  flex: 1;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-family: inherit;
  font-size: 14px;
  color: #1a1f3c;
  resize: none;
  transition: border-color 0.2s;
}

.message-input:focus {
  outline: none;
  border-color: #ff6b35;
  box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.1);
}

.send-btn {
  width: 42px;
  height: 42px;
  background: #ff6b35;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
}

.send-btn:hover:not(:disabled) {
  background: #ff5722;
  transform: translateY(-2px);
}

.send-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.send-btn svg {
  width: 18px;
  height: 18px;
}

/* Modal transition */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-content,
.modal-leave-active .modal-content {
  transition: transform 0.3s ease;
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  transform: translateY(20px);
}
</style>
