<template>
  <Transition name="modal-fade">
    <div v-if="isOpen" class="modal-overlay" @click.self="$emit('close')">
      <div class="modal-card reviews-modal">
        <div class="modal-header">
          <h3 class="modal-title">Reviews</h3>
          <button class="close-btn" @click="$emit('close')">✕</button>
        </div>
        <div class="modal-content">
          <div v-if="isLoading" class="loading">Loading...</div>
          <div v-else-if="!ratings || ratings.length === 0" class="empty">No reviews yet.</div>
          <div v-else class="reviews-list">
            <div v-for="r in ratings" :key="r._id" class="review-row">
              <img
                v-if="r.raterAvatar"
                :src="normalize(r.raterAvatar)"
                class="avatar"
                @error="onImageError"
              />
              <div class="review-body">
                <div class="review-head">
                  <strong class="name">{{ r.raterName || 'Anonymous' }}</strong>
                  <span class="score">{{ r.score }} ★</span>
                </div>
                <div class="comment" v-if="r.comment">{{ r.comment }}</div>
                <div class="tags" v-if="r.tags && r.tags.length">
                  <span v-for="t in r.tags" :key="t" class="tag">{{ t }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
const props = defineProps<{
  isOpen: boolean
  ratings: Array<any> | null
  isLoading?: boolean
}>()
const emit = defineEmits(['close'])

const isLoading = computed(() => !!props.isLoading)

const API_BASE_URL = import.meta.env.VITE_API_URL
  ? String(import.meta.env.VITE_API_URL).replace(/\/api\/?$/, '')
  : 'http://localhost:3000'

const normalize = (avatar?: string) => {
  if (!avatar) return ''
  const trimmed = avatar.trim()
  if (!trimmed) return ''
  if (/^https?:\/\//i.test(trimmed)) {
    const separator = trimmed.includes('?') ? '&' : '?'
    return `${trimmed}${separator}t=${Date.now()}`
  }
  const url = trimmed.startsWith('/') ? `${API_BASE_URL}${trimmed}` : `${API_BASE_URL}/${trimmed}`
  const sep = url.includes('?') ? '&' : '?'
  return `${url}${sep}t=${Date.now()}`
}

const onImageError = (e: Event) => {
  const t = e.currentTarget as HTMLImageElement | null
  if (t) t.src = 'https://via.placeholder.com/48'
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(10,10,10,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal-card.reviews-modal {
  width: min(720px, 95%);
  max-height: 80vh;
  overflow: auto;
  background: white;
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.12);
  padding: 16px;
}
.modal-header {
  display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;
}
.modal-title {font-size:18px;font-weight:700}
.close-btn{background:none;border:none;font-size:18px;cursor:pointer}
.reviews-list{display:flex;flex-direction:column;gap:12px}
.review-row{display:flex;gap:12px;padding:8px;border-radius:8px;border:1px solid #eee}
.avatar{width:48px;height:48px;border-radius:50%;object-fit:cover}
.review-head{display:flex;justify-content:space-between;align-items:center}
.name{font-weight:600}
.score{color:#f59e0b;font-weight:700}
.comment{margin-top:6px}
.tag{display:inline-block;background:#fef3c7;color:#92400e;padding:4px 8px;border-radius:4px;margin-right:6px;font-size:12px}
</style>
