<script setup lang="ts">
import { ref } from 'vue'
import ThreadViewerModal from './ThreadViewerModal.vue'
import LeaveReviewModal from './LeaveReviewModal.vue'
import InvoiceModal from './InvoiceModal.vue'
import type { Notification } from '../types/notification'

defineProps<{
  notification: Notification | null
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'reply', message: string): void
  (e: 'action', label: string): void
}>()

const replyMessage = ref('')
const isReplying = ref(false)
const showThreadViewer = ref(false)
const showLeaveReview = ref(false)
const showInvoice = ref(false)

const handleReply = () => {
  if (replyMessage.value.trim()) {
    emit('reply', replyMessage.value)
    replyMessage.value = ''
    isReplying.value = false
  }
}

const handleAction = (label: string) => {
  if (label.toLowerCase().includes('view thread')) {
    showThreadViewer.value = true
  } else if (label.toLowerCase().includes('leave review')) {
    showLeaveReview.value = true
  } else if (label.toLowerCase().includes('invoice')) {
    showInvoice.value = true
  } else {
    emit('action', label)
  }
}

const handleReview = (review: { rating: number; title: string; content: string }) => {
  console.log('Review submitted:', review)
  showLeaveReview.value = false
  emit('action', 'Leave Review')
}

const closeModal = () => {
  replyMessage.value = ''
  isReplying.value = false
  emit('close')
}
</script>

<template>
  <transition name="modal">
    <div v-if="isOpen && notification" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <!-- Header -->
        <div class="modal-header">
          <h2 class="modal-title">{{ notification.sender }}</h2>
          <button class="close-btn" @click="closeModal" aria-label="Close">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          </button>
        </div>

        <!-- Message Body -->
        <div class="modal-body">
          <div class="message-content">
            <p v-if="notification.richText" v-html="notification.richText" />
            <p v-else>{{ notification.text }}</p>
          </div>

          <!-- Quick Actions -->
          <div v-if="notification.actions.length > 0" class="quick-actions">
            <button
              v-for="action in notification.actions"
              :key="action.label"
              class="action-btn"
              :class="`btn-${action.variant}`"
              @click="handleAction(action.label)"
            >
              {{ action.label }}
            </button>
          </div>

          <!-- Reply Section -->
          <div v-if="notification.type === 'message'" class="reply-section">
            <button v-if="!isReplying" class="reply-toggle" @click="isReplying = true">
              <svg viewBox="0 0 24 24" fill="currentColor" class="icon">
                <path d="M10 15H5v4h5v4l7-7-7-7v4zm-4-2h8l-4-4v2h-4v4z" />
              </svg>
              Reply to this message
            </button>

            <div v-else class="reply-input-group">
              <textarea
                v-model="replyMessage"
                placeholder="Type your reply..."
                class="reply-input"
                rows="3"
                @keydown.escape="isReplying = false"
              />
              <div class="reply-actions">
                <button class="btn-send" @click="handleReply">Send Reply</button>
                <button class="btn-cancel" @click="isReplying = false">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>
  <!-- Thread Viewer Modal -->
  <ThreadViewerModal
    :is-open="showThreadViewer"
    @close="showThreadViewer = false"
  />

  <!-- Leave Review Modal -->
  <LeaveReviewModal
    :is-open="showLeaveReview"
    :seller-name="notification?.sender"
    @close="showLeaveReview = false"
    @submit="handleReview"
  />

  <!-- Invoice Modal -->
  <InvoiceModal
    :is-open="showInvoice"
    @close="showInvoice = false"
    @download="console.log('Download invoice')"
  />
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
  max-height: 80vh;
  overflow-y: auto;
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

.modal-body {
  padding: 24px;
}

.message-content {
  margin-bottom: 24px;
}

.message-content p {
  margin: 0;
  color: #1a1f3c;
  line-height: 1.6;
  font-size: 15px;
}

.message-content :deep(a) {
  color: #ff6b35;
  text-decoration: none;
  font-weight: 600;
}

.message-content :deep(a:hover) {
  text-decoration: underline;
}

/* Quick Actions */
.quick-actions {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  font-size: 13px;
  font-weight: 600;
  padding: 8px 16px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: #ff6b35;
  color: white;
}

.btn-primary:hover {
  background: #ff5722;
  transform: translateY(-2px);
}

.btn-outline {
  background: #f4f5fb;
  color: #1a1f3c;
  border: 1px solid #ddd;
}

.btn-outline:hover {
  background: #e8eaf0;
}

.btn-green {
  background: #22c55e;
  color: white;
}

.btn-green:hover {
  background: #16a34a;
  transform: translateY(-2px);
}

/* Reply Section */
.reply-section {
  border-top: 1px solid #eee;
  padding-top: 20px;
}

.reply-toggle {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  color: #ff6b35;
  font-weight: 600;
  cursor: pointer;
  padding: 8px 0;
  transition: all 0.2s;
}

.reply-toggle:hover {
  color: #ff5722;
}

.icon {
  width: 18px;
  height: 18px;
}

.reply-input-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.reply-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-family: inherit;
  font-size: 14px;
  color: #1a1f3c;
  resize: vertical;
  transition: border-color 0.2s;
}

.reply-input:focus {
  outline: none;
  border-color: #ff6b35;
  box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.1);
}

.reply-actions {
  display: flex;
  gap: 8px;
}

.btn-send {
  flex: 1;
  padding: 10px 16px;
  background: #ff6b35;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-send:hover {
  background: #ff5722;
}

.btn-cancel {
  flex: 1;
  padding: 10px 16px;
  background: #f4f5fb;
  color: #1a1f3c;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel:hover {
  background: #e8eaf0;
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
