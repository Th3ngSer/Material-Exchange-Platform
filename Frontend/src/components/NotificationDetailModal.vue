<script setup lang="ts">
import { ref, watch } from 'vue'
import ThreadViewerModal from './ThreadViewerModal.vue'
import LeaveReviewModal from './LeaveReviewModal.vue'
import InvoiceModal from './InvoiceModal.vue'
import type { Notification } from '../types/notification'

const props = defineProps<{
  notification: Notification | null
  isOpen: boolean
  openReview?: boolean
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

watch(
  () => [props.isOpen, props.openReview],
  ([isOpen, openReview]) => {
    if (isOpen && openReview) {
      showLeaveReview.value = true
    }
  }
)

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
  showLeaveReview.value = false
  emit('close')
}
</script>

<template>
  <transition name="modal">
    <div v-if="isOpen && notification" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <!-- Header -->
        <div class="modal-header">
          <h2 class="modal-title">{{ notification.title ?? notification.sender }}</h2>
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
            <p v-else>{{ notification.message ?? notification.text }}</p>
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
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
  padding: 16px;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 600px;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  animation: slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(24px);
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
  padding: 22px 24px;
  border-bottom: 1px solid #e5e7eb;
  background: white;
  position: sticky;
  top: 0;
  z-index: 10;
}

.modal-title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #1a1f3c;
  letter-spacing: -0.3px;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #9ca3af;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.close-btn:hover {
  background: #f3f4f6;
  color: #6b7280;
}

.close-btn svg {
  width: 20px;
  height: 20px;
}

.modal-body {
  padding: 28px 24px;
}

.message-content {
  margin-bottom: 24px;
}

.message-content p {
  margin: 0;
  color: #374151;
  line-height: 1.6;
  font-size: 15px;
}

.message-content :deep(a) {
  color: #f97316;
  text-decoration: none;
  font-weight: 600;
}

.message-content :deep(a:hover) {
  text-decoration: underline;
}

/* Quick Actions */
.quick-actions {
  display: flex;
  gap: 10px;
  margin-bottom: 28px;
  flex-wrap: wrap;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  font-size: 13px;
  font-weight: 600;
  padding: 9px 16px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.btn-primary {
  background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
  color: white;
}

.btn-primary:hover {
  background: linear-gradient(135deg, #ea580c 0%, #dc4a0d 100%);
}

.btn-outline {
  background: white;
  color: #6b7280;
  border: 1.5px solid #d1d5db;
}

.btn-outline:hover {
  background: #f9fafb;
  border-color: #9ca3af;
  color: #4b5563;
}

.btn-green {
  background: #d1fae5;
  color: #065f46;
  border: none;
}

.btn-green:hover {
  background: #a7f3d0;
}

/* Reply Section */
.reply-section {
  border-top: 1px solid #e5e7eb;
  padding-top: 24px;
  margin-top: 24px;
}

.reply-toggle {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  color: #f97316;
  font-weight: 600;
  cursor: pointer;
  padding: 8px 0;
  transition: all 0.2s ease;
  font-size: 14px;
}

.reply-toggle:hover {
  color: #ea580c;
}

.icon {
  width: 18px;
  height: 18px;
}

.reply-input-group {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.reply-input {
  width: 100%;
  padding: 12px 14px;
  border: 1.5px solid #e5e7eb;
  border-radius: 8px;
  font-family: inherit;
  font-size: 14px;
  color: #1a1f3c;
  resize: vertical;
  transition: all 0.2s ease;
}

.reply-input:focus {
  outline: none;
  border-color: #f97316;
  box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
}

.reply-input::placeholder {
  color: #d1d5db;
}

.reply-actions {
  display: flex;
  gap: 10px;
}

.btn-send {
  flex: 1;
  padding: 11px 16px;
  background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-send:hover {
  background: linear-gradient(135deg, #ea580c 0%, #dc4a0d 100%);
  transform: translateY(-1px);
}

.btn-cancel {
  flex: 1;
  padding: 11px 16px;
  background: #f3f4f6;
  color: #6b7280;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-cancel:hover {
  background: #e5e7eb;
  color: #4b5563;
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
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  transform: translateY(24px);
}

/* Responsive */
@media (max-width: 640px) {
  .modal-overlay {
    padding: 12px;
  }

  .modal-header {
    padding: 18px 20px;
  }

  .modal-title {
    font-size: 16px;
  }

  .modal-body {
    padding: 20px;
  }

  .quick-actions {
    gap: 8px;
  }

  .action-btn {
    font-size: 12px;
    padding: 8px 14px;
  }
}
</style>
