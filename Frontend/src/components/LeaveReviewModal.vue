<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  isOpen: boolean
  sellerName?: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'submit', review: { rating: number; title: string; content: string }): void
}>()

const rating = ref(5)
const title = ref('')
const content = ref('')

const submitReview = () => {
  if (title.value.trim() && content.value.trim()) {
    emit('submit', {
      rating: rating.value,
      title: title.value,
      content: content.value,
    })
    resetForm()
  }
}

const resetForm = () => {
  rating.value = 5
  title.value = ''
  content.value = ''
}

const closeModal = () => {
  resetForm()
  emit('close')
}
</script>

<template>
  <transition name="modal">
    <div v-if="isOpen" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <!-- Header -->
        <div class="modal-header">
          <h2 class="modal-title">Leave a Review</h2>
          <button class="close-btn" @click="closeModal" aria-label="Close">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          </button>
        </div>

        <!-- Form -->
        <div class="modal-body">
          <!-- Rating -->
          <div class="form-group">
            <label class="form-label">Rating</label>
            <div class="rating-stars">
              <button
                v-for="star in 5"
                :key="star"
                type="button"
                class="star"
                :class="{ active: star <= rating }"
                @click="rating = star"
                :aria-label="`Rate ${star} stars`"
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2l-2.81 6.63L2 9.24l5.46 4.73L5.82 21z" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Title -->
          <div class="form-group">
            <label for="review-title" class="form-label">Review Title *</label>
            <input
              id="review-title"
              v-model="title"
              type="text"
              placeholder="e.g., Great quality and fast delivery"
              class="form-input"
              maxlength="100"
            />
            <span class="char-count">{{ title.length }}/100</span>
          </div>

          <!-- Content -->
          <div class="form-group">
            <label for="review-content" class="form-label">Your Review *</label>
            <textarea
              id="review-content"
              v-model="content"
              placeholder="Share your experience with this seller..."
              class="form-textarea"
              rows="5"
              maxlength="500"
            />
            <span class="char-count">{{ content.length }}/500</span>
          </div>

          <!-- Seller Info -->
          <div v-if="sellerName" class="seller-info">
            <p><strong>Reviewing:</strong> {{ sellerName }}</p>
          </div>
        </div>

        <!-- Footer -->
        <div class="modal-footer">
          <button class="btn-cancel" @click="closeModal">Cancel</button>
          <button
            class="btn-submit"
            @click="submitReview"
            :disabled="!title.trim() || !content.trim()"
          >
            Submit Review
          </button>
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
  max-height: 90vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
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
  flex: 1;
  padding: 24px;
}

/* Form */
.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-weight: 600;
  color: #1a1f3c;
  margin-bottom: 8px;
  font-size: 14px;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-family: inherit;
  font-size: 14px;
  color: #1a1f3c;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #ff6b35;
  box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 120px;
}

.char-count {
  display: block;
  margin-top: 4px;
  font-size: 12px;
  color: #8b90a7;
  text-align: right;
}

/* Rating Stars */
.rating-stars {
  display: flex;
  gap: 8px;
}

.star {
  background: none;
  border: none;
  cursor: pointer;
  width: 36px;
  height: 36px;
  padding: 0;
  color: #ddd;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.star svg {
  width: 28px;
  height: 28px;
}

.star:hover,
.star.active {
  color: #ffc107;
  transform: scale(1.2);
}

/* Seller Info */
.seller-info {
  background: #f4f5fb;
  padding: 12px;
  border-radius: 8px;
  margin-top: 20px;
}

.seller-info p {
  margin: 0;
  font-size: 14px;
  color: #1a1f3c;
}

/* Footer */
.modal-footer {
  display: flex;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid #eee;
  background: #f9f9fb;
}

.btn-cancel,
.btn-submit {
  flex: 1;
  padding: 12px 16px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
}

.btn-cancel {
  background: #f4f5fb;
  color: #1a1f3c;
}

.btn-cancel:hover {
  background: #e8eaf0;
}

.btn-submit {
  background: #ff6b35;
  color: white;
}

.btn-submit:hover:not(:disabled) {
  background: #ff5722;
  transform: translateY(-2px);
}

.btn-submit:disabled {
  background: #ccc;
  cursor: not-allowed;
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
