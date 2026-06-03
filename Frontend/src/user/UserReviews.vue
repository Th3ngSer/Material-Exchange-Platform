<template>
  <div class="user-reviews-page">
    <Sidebar />

    <div class="content">
      <section class="page-header">
        <h1>{{ languageStore.t('Reviews') || 'Reviews' }}</h1>
        <p class="subtitle">View recent feedback from other users.</p>
      </section>

      <div v-if="!userId" class="notification">No user selected. Please log in or select a profile.</div>

      <div v-else class="reviews-layout">
        <div class="stats-panel">
          <RatingStats :stats="ratingStats" :is-loading="isLoading" :show-recent-reviews="false" />
        </div>

        <div class="reviews-panel">
          <div v-if="isLoadingReviews" class="notification">Loading reviews...</div>
          <div v-else>
            <div v-if="allReviews.length === 0" class="notification">No reviews found.</div>

            <div class="reviews-list">
              <div v-for="r in allReviews" :key="r._id" class="review-card">
                <div class="review-card-header">
                  <div class="reviewer-meta">
                    <img v-if="r.raterAvatar" :src="normalizeAvatarUrl(r.raterAvatar)" class="reviewer-avatar" />
                    <div>
                      <p class="reviewer-name">{{ r.raterName || 'Anonymous' }}</p>
                      <p class="review-date">{{ formatDate(r.createdAt) }}</p>
                    </div>
                  </div>
                  <div class="review-score">{{ r.score }} ★</div>
                </div>

                <p v-if="r.comment" class="review-comment">{{ r.comment }}</p>

                <div v-if="r.tags && r.tags.length" class="review-tags">
                  <span v-for="tag in r.tags" :key="tag" class="tag-pill">{{ tag }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import Sidebar from '@/userprofileComponent/Sidebar.vue'
import RatingStats from '@/components/RatingStats.vue'
import { useLanguageStore } from '@/stores/language'
import { useAuthStore } from '@/stores/auth'
import { ratingsApi } from '@/services/ratings'
import axios from 'axios'

const route = useRoute()
const languageStore = useLanguageStore()
const authStore = useAuthStore()

const ratingStats = ref<any>(null)
const allReviews = ref<any[]>([])
const isLoading = ref(false)
const isLoadingReviews = ref(false)
const userId = ref<string | null>(null)

const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
const apiRoot = String(apiBaseUrl).replace(/\/api\/?$/, '')

const usernameFromQuery = computed(() => {
  const value = route.query.user
  return Array.isArray(value) ? value[0] : value
})

const normalizeAvatarUrl = (avatar?: string) => {
  if (!avatar) return ''
  if (/^https?:\/\//i.test(avatar)) return avatar
  const cleaned = String(avatar).replace(/^\/+/, '')
  return `${apiRoot}/${cleaned}`
}

const formatDate = (dateString?: string) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString()
}

const loadStats = async (id: string) => {
  isLoading.value = true
  try {
    const response = await ratingsApi.getUserRatingStats(id)
    ratingStats.value = response.data || response
  } catch {
    ratingStats.value = null
  } finally {
    isLoading.value = false
  }
}

const loadAllRatings = async (id: string) => {
  isLoadingReviews.value = true
  try {
    const response = await ratingsApi.getAllRatingsForUser(id)
    allReviews.value = response.data || response || []
  } catch {
    allReviews.value = []
  } finally {
    isLoadingReviews.value = false
  }
}

const resolveUserId = async (): Promise<string | null> => {
  if (usernameFromQuery.value) {
    try {
      const response = await axios.get(
        `${apiRoot}/api/auth/user/${encodeURIComponent(usernameFromQuery.value)}`,
      )
      return response.data?.id || response.data?._id || null
    } catch {
      return null
    }
  }
  return authStore.user?.id || null
}

onMounted(async () => {
  if (!authStore.user) {
    await authStore.initializeAuth()
  }

  const resolvedId = await resolveUserId()
  if (resolvedId) {
    userId.value = resolvedId
    await loadStats(resolvedId)
    await loadAllRatings(resolvedId)
  }
})
</script>

<style scoped>
.user-reviews-page {
  display: flex;
  min-height: 100vh;
}

.content {
  flex: 1;
  padding: 32px;
  background: #fff;
}

.page-header h1 {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 8px;
}

.subtitle {
  color: #6b7280;
  margin-bottom: 24px;
}

.notification {
  color: #6b7280;
  padding: 16px 0;
}

.reviews-layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
}

.stats-panel {
  display: flex;
  flex-direction: column;
  gap: 0px;
  width: 100%;
  min-width: 0;
}

.reviews-panel {
  width: 100%;
  min-width: 0;
}

.loading-text,
.empty-text,
.notification {
  color: #6b7280;
}

.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.review-card {
  padding: 20px;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  background: #f9fafb;
}

.review-card-header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
  margin-bottom: 12px;
}

.reviewer-meta {
  display: flex;
  gap: 12px;
  align-items: center;
}

.reviewer-avatar {
  width: 44px;
  height: 44px;
  border-radius: 9999px;
  object-fit: cover;
}

.reviewer-name {
  font-weight: 700;
}

.review-date {
  color: #6b7280;
  font-size: 12px;
}

.review-score {
  font-weight: 700;
  color: #f59e0b;
}

.review-comment {
  color: #374151;
  line-height: 1.7;
  margin-bottom: 12px;
}

.review-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-pill {
  background: #fde68a;
  color: #92400e;
  padding: 6px 10px;
  border-radius: 9999px;
  font-size: 12px;
}
</style>
