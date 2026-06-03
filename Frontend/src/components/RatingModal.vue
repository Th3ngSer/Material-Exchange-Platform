<script setup lang="ts">
import { ref, computed } from 'vue'
import StarRating from './StarRating.vue'

const props = defineProps<{
  userId: string
  userName?: string
}>()

const emit = defineEmits<{
  (e: 'submit', payload: { score: number; comment?: string; tags?: string[] }): void
  (e: 'close'): void
}>()

const score = ref(0)
const comment = ref('')
const selectedTags = ref<string[]>([])
const isSubmitting = ref(false)

const predefinedTags = [
  { value: 'trustworthy', label: '✓ Trustworthy' },
  { value: 'fast-delivery', label: '⚡ Fast Delivery' },
  { value: 'good-condition', label: '📦 Good Condition' },
  { value: 'communicative', label: '💬 Good Communicator' },
  { value: 'fair-price', label: '💰 Fair Price' },
]

const canSubmit = computed(() => score.value > 0)

const toggleTag = (tag: string) => {
  const idx = selectedTags.value.indexOf(tag)
  if (idx > -1) {
    selectedTags.value.splice(idx, 1)
  } else {
    selectedTags.value.push(tag)
  }
}

const handleSubmit = async () => {
  if (!canSubmit.value) return

  isSubmitting.value = true
  try {
    emit('submit', {
      score: score.value,
      comment: comment.value || undefined,
      tags: selectedTags.value.length > 0 ? selectedTags.value : undefined,
    })
  } finally {
    isSubmitting.value = false
  }
}

const handleClose = () => {
  emit('close')
}
</script>

<template>
  <div class="modal-overlay" @click="handleClose">
    <div class="modal" @click.stop>
      <div class="modal-header">
        <h3>Rate {{ userName || 'User' }}</h3>
        <button class="close-btn" @click="handleClose">✕</button>
      </div>

      <div class="modal-body">
        <!-- Star Selection -->
        <div class="rating-section">
          <label>Your Rating</label>
          <StarRating
            :score="score"
            size="lg"
            interactive
            @select="(s) => (score = s)"
          />
          <p v-if="score > 0" class="score-text">{{ score }} out of 5 stars</p>
        </div>

        <!-- Predefined Tags -->
        <div class="tags-section">
          <label>What was great? (Optional)</label>
          <div class="tags-grid">
            <button
              v-for="tag in predefinedTags"
              :key="tag.value"
              class="tag-btn"
              :class="{ active: selectedTags.includes(tag.value) }"
              @click="toggleTag(tag.value)"
            >
              {{ tag.label }}
            </button>
          </div>
        </div>

        <!-- Comment -->
        <div class="comment-section">
          <label for="comment">Your Review (Optional)</label>
          <textarea
            id="comment"
            v-model="comment"
            placeholder="Share your experience... (max 500 characters)"
            maxlength="500"
            rows="4"
          />
          <p class="char-count">{{ comment.length }} / 500</p>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn-cancel" @click="handleClose">Cancel</button>
        <button
          class="btn-submit"
          :disabled="!canSubmit || isSubmitting"
          @click="handleSubmit"
        >
          {{ isSubmitting ? 'Submitting...' : 'Submit Rating' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}

.modal {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #6b7280;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #1f2937;
}

.modal-body {
  padding: 24px;
}

.rating-section {
  margin-bottom: 24px;
}

.rating-section label {
  display: block;
  font-weight: 600;
  font-size: 14px;
  color: #1f2937;
  margin-bottom: 12px;
}

.score-text {
  margin-top: 12px;
  color: #6b7280;
  font-size: 14px;
}

.tags-section {
  margin-bottom: 24px;
}

.tags-section label {
  display: block;
  font-weight: 600;
  font-size: 14px;
  color: #1f2937;
  margin-bottom: 12px;
}

.tags-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.tag-btn {
  padding: 8px 12px;
  border: 2px solid #e5e7eb;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  font-size: 14px;
  color: #6b7280;
  transition: all 0.2s;
}

.tag-btn:hover {
  border-color: #fbbf24;
}

.tag-btn.active {
  background: #fef3c7;
  border-color: #fbbf24;
  color: #1f2937;
}

.comment-section {
  margin-bottom: 24px;
}

.comment-section label {
  display: block;
  font-weight: 600;
  font-size: 14px;
  color: #1f2937;
  margin-bottom: 8px;
}

textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
}

textarea:focus {
  outline: none;
  border-color: #fbbf24;
  box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.1);
}

.char-count {
  margin-top: 4px;
  font-size: 12px;
  color: #9ca3af;
}

.modal-footer {
  display: flex;
  gap: 12px;
  padding: 24px;
  border-top: 1px solid #e5e7eb;
  justify-content: flex-end;
}

.btn-cancel,
.btn-submit {
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel {
  background: #f3f4f6;
  color: #1f2937;
}

.btn-cancel:hover {
  background: #e5e7eb;
}

.btn-submit {
  background: #fbbf24;
  color: #1f2937;
}

.btn-submit:hover:not(:disabled) {
  background: #f59e0b;
}

.btn-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
