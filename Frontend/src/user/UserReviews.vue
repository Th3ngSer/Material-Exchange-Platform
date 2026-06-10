<template>
  <div class="user-reviews-page">
    <Header v-if="!isOwnProfile" />

    <div class="personal-info">
      <Sidebar v-if="isOwnProfile" />

      <div class="content" :class="{ 'public-content': !isOwnProfile }">
        <!-- Back Button -->
        <div v-if="!isOwnProfile" class="back-button-container">
          <button @click="goBack" class="back-button">
            <img src="/userprofileImage/back.png" alt="Back" />
            <span>{{ languageStore.t('back' as any) || 'Back' }}</span>
          </button>
        </div>

        <section class="page-header">
          <h1>{{ languageStore.t('reviews') }}</h1>
          <p class="subtitle">View recent feedback from other users.</p>
        </section>

        <div v-if="!userId" class="notification">No user selected. Please log in or select a profile.</div>

        <div v-else class="reviews-layout">
          <div class="stats-panel">
            <RatingStats
              :stats="ratingStats"
              :is-loading="isLoading"
              :show-recent-reviews="false"
              @rate="handleRateClick"
            />
            <button
              v-if="!isOwnProfile && ratingStats && ratingStats.totalRatings > 0"
              @click="handleRateClick"
              class="rate-seller-btn"
            >
              ★ Rate Seller
            </button>
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

    <RatingModal
      v-if="showRatingModal && profileUser"
      :userId="userId || ''"
      :userName="profileUser.name || profileUser.username"
      @close="showRatingModal = false"
      @submit="handleRatingSubmit"
    />

    <Footer v-if="!isOwnProfile" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Sidebar from '@/userprofileComponent/Sidebar.vue'
import RatingStats from '@/components/RatingStats.vue'
import Header from '@/components/layout/Header.vue'
import Footer from '@/components/layout/Footer.vue'
import RatingModal from '@/components/RatingModal.vue'
import { useLanguageStore } from '@/stores/language'
import { useAuthStore } from '@/stores/auth'
import { ratingsApi } from '@/services/ratings'
import api from '@/services/api'

const route = useRoute()
const router = useRouter()
const languageStore = useLanguageStore()
const authStore = useAuthStore()

const isOwnProfile = computed(() => {
  if (!usernameFromQuery.value) return true
  const currentUser = authStore.user
  if (!currentUser) return false

  const normalizedQuery = String(usernameFromQuery.value).trim().toLowerCase()
  const currentIdentities = [currentUser.username, currentUser.name, currentUser.id, currentUser.email]
    .filter(Boolean)
    .map((value) => String(value).trim().toLowerCase())

  return currentIdentities.includes(normalizedQuery)
})

const goBack = () => {
  router.back()
}

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

const profileUser = ref<any>(null)
const showRatingModal = ref(false)

const resolveUserId = async (): Promise<string | null> => {
  if (usernameFromQuery.value) {
    try {
      const objectIdPattern = /^[0-9a-fA-F]{24}$/
      const isObjectId = objectIdPattern.test(usernameFromQuery.value)
      const url = isObjectId
        ? `/auth/user/id/${encodeURIComponent(usernameFromQuery.value)}`
        : `/auth/user/${encodeURIComponent(usernameFromQuery.value)}`

      const response = await api.get(url)
      profileUser.value = response.data
      return response.data?.id || response.data?._id || null
    } catch {
      return null
    }
  }
  profileUser.value = authStore.user
  return authStore.user?.id || null
}

const handleRateClick = () => {
  if (!authStore.user) {
    alert('Please log in to rate this user')
    router.push({ name: 'login', query: { redirect: route.fullPath } })
    return
  }

  if (isOwnProfile.value) {
    alert("You can't rate your own profile")
    return
  }

  showRatingModal.value = true
}

const handleRatingSubmit = async (payload: { score: number; comment?: string; tags?: string[] }) => {
  try {
    const viewedUserId = userId.value || ''
    await ratingsApi.submitRating({
      userId: viewedUserId,
      score: payload.score,
      comment: payload.comment,
      tags: payload.tags,
    })

    // Refresh rating stats and list
    await loadStats(viewedUserId)
    await loadAllRatings(viewedUserId)
    showRatingModal.value = false
    alert('Thank you for your rating!')
  } catch (error) {
    console.error('Failed to submit rating:', error)
    alert('Failed to submit rating. Please try again.')
  }
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
  flex-direction: column;
  min-height: 100vh;
  background-color: #f8fafc;
}

.personal-info {
  display: flex;
  flex: 1;
}

.content {
  flex: 1;
  padding: 32px;
  margin-left: 350px;
  background: #fff;
}

.content.public-content {
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  border-radius: 24px;
  background: #ffffff;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
  margin-top: 32px;
  margin-bottom: 48px;
  padding: 40px;
}

.back-button-container {
  margin-bottom: 24px;
}

.back-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  color: #64748b;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.back-button:hover {
  background-color: #f1f5f9;
  color: #0f172a;
}

.back-button img {
  width: 16px;
  height: 16px;
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

.rate-seller-btn {
  margin-top: 16px;
  width: 100%;
  padding: 12px;
  background: #fbbf24;
  color: #1f2937;
  border: none;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
}

.rate-seller-btn:hover {
  background: #f59e0b;
}
</style>
