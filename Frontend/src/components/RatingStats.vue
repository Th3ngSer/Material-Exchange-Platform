<script setup lang="ts">
import { computed, watch, onMounted } from 'vue'
import StarRating from './StarRating.vue'

const API_BASE_URL = import.meta.env.VITE_API_URL
  ? String(import.meta.env.VITE_API_URL).replace(/\/api\/?$/, '')
  : 'http://localhost:3000'

interface Rating {
  _id: string
  score: number
  comment?: string
  tags?: string[]
  raterName?: string
  raterAvatar?: string
  createdAt?: string
}

interface RatingStats {
  averageScore: number
  totalRatings: number
  distribution: { [key: number]: number }
  recentRatings: Rating[]
}

const props = defineProps<{
  stats?: RatingStats
  isLoading?: boolean
  expanded?: boolean
  showRecentReviews?: boolean
  distributionFullWidth?: boolean
}>()

const showRecentReviews = computed(() => props.showRecentReviews !== false)

const emit = defineEmits<{
  (e: 'see-more'): void
  (e: 'rate'): void
}>()

const stats = computed(() => props.stats)
const expanded = computed(() => !!props.expanded)

const displayedReviews = computed(() => {
  const list = stats.value?.recentRatings || []
  // default: show only 3 reviews unless expanded
  return expanded.value ? list : list.slice(0, 3)
})

const remainingCount = computed(() => {
  const total = stats.value?.totalRatings || 0
  const shown = expanded.value ? (stats.value?.recentRatings?.length || 0) : Math.min(3, stats.value?.recentRatings?.length || 0)
  return Math.max(0, total - shown)
})

// Debug: log received recentRatings length to help trace UI updates
onMounted(() => {
  try {
    console.log('RatingStats mounted: recentRatings length =', (stats.value?.recentRatings || []).length)
  } catch (e) {}
})

watch(stats, (val) => {
  try {
    console.log('RatingStats: stats changed, recentRatings length =', (val?.recentRatings || []).length)
  } catch (e) {}
})

watch(remainingCount, (val) => {
  try {
    console.log('RatingStats: remainingCount =', val)
  } catch (e) {}
})

// log when expanded prop changes to help diagnose rendering
watch(() => expanded.value, (val) => {
  try {
    console.log('RatingStats: expanded changed =', val, 'displayedReviews.length =', (displayedReviews.value || []).length)
  } catch (e) {}
})

const normalizeAvatarUrl = (avatar?: string) => {
  if (!avatar) return ''
  const trimmed = avatar.trim()
  if (!trimmed) return ''
  const cacheBuster = `t=${Date.now()}`
  if (/^https?:\/\//i.test(trimmed)) {
    const separator = trimmed.includes('?') ? '&' : '?'
    return `${trimmed}${separator}${cacheBuster}`
  }
  const url = trimmed.startsWith('/') ? `${API_BASE_URL}${trimmed}` : `${API_BASE_URL}/${trimmed}`
  const separator = url.includes('?') ? '&' : '?'
  return `${url}${separator}${cacheBuster}`
}

const getPercentage = (count: number) => {
  if (!stats.value || stats.value.totalRatings === 0) return 0
  return Math.round((count / stats.value.totalRatings) * 100)
}

const handleAvatarError = (event: Event) => {
  const target = event.currentTarget as HTMLImageElement | null
  if (target) {
    target.src = 'https://via.placeholder.com/48'
  }
}

const formatDate = (dateString?: string) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  return `${Math.floor(diffDays / 30)} months ago`
}
</script>

<template>
  <div class="rating-stats">
    <div v-if="isLoading" class="loading">Loading ratings...</div>

    <div v-else-if="!stats || stats.totalRatings === 0" class="no-ratings">
      <p>No ratings yet</p>
      <button class="btn-rate" @click="emit('rate')">Be the first to rate</button>
    </div>

    <div v-else>
      <div class="rating-content">
        <div class="statistics-column">
          <!-- Average Score on Left -->
          <div class="average-section">
            <div class="average-score">
              <span class="score-number">{{ stats.averageScore }}</span>
              <span class="score-label">/ 5</span>
            </div>
            <StarRating :score="Math.round(stats.averageScore)" size="md" readonly />
            <p class="rating-count">{{ stats.totalRatings }} rating{{ stats.totalRatings !== 1 ? 's' : '' }}</p>
          </div>
          <!-- optionally render distribution inside the left column -->
          <div v-if="!props.distributionFullWidth" class="distribution-section">
            <div v-for="i in [5, 4, 3, 2, 1]" :key="i" class="distribution-row">
              <span class="stars-label">{{ i }} ★</span>
              <div class="bar-container">
                <div
                  class="bar-fill"
                  :style="{
                    width: `${getPercentage(stats.distribution[i] ?? 0)}%`,
                  }"
                />
              </div>
              <span class="count">{{ stats.distribution[i] }}</span>
            </div>
          </div>
        </div>

        <!-- Distribution can instead span full width when requested -->
        <div v-if="props.distributionFullWidth" class="distribution-section distribution-full">
          <div v-for="i in [5, 4, 3, 2, 1]" :key="i" class="distribution-row">
            <span class="stars-label">{{ i }} ★</span>
            <div class="bar-container">
              <div
                class="bar-fill"
                :style="{
                  width: `${getPercentage(stats.distribution[i] ?? 0)}%`,
                }"
              />
            </div>
            <span class="count">{{ stats.distribution[i] }}</span>
          </div>
        </div>

        <!-- Recent Reviews -->
        <div v-if="showRecentReviews && stats.recentRatings.length > 0" :class="['recent-reviews', { expanded: expanded }]">
          <h4>Recent Reviews</h4>
          <div class="reviews-list">
            <template v-for="review in displayedReviews" :key="review._id">
              <div class="review-card">
                <div class="review-header">
                  <div class="reviewer-info">
                    <img
                      v-if="review.raterAvatar"
                      :src="normalizeAvatarUrl(review.raterAvatar)"
                      :alt="review.raterName"
                      class="reviewer-avatar"
                      @error="handleAvatarError"
                    />
                    <div v-else class="avatar-placeholder">
                      {{ (review.raterName || 'U').charAt(0).toUpperCase() }}
                    </div>
                    <div>
                      <p class="reviewer-name">{{ review.raterName || 'Anonymous' }}</p>
                      <p class="review-date">{{ formatDate(review.createdAt) }}</p>
                    </div>
                  </div>
                  <StarRating :score="review.score" size="sm" readonly />
                </div>

                <div v-if="review.comment" class="review-comment">
                  {{ review.comment }}
                </div>

                <div v-if="review.tags && review.tags.length > 0" class="review-tags">
                  <span v-for="tag in review.tags" :key="tag" class="tag">{{ tag }}</span>
                </div>
              </div>
            </template>
          </div>
          <!-- See more link inside Recent Reviews (bottom-right) -->
          <div class="see-more-inline" v-if="remainingCount > 0">
            <button class="see-more-link" @click="emit('see-more')">See more ({{ remainingCount }} more)</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.rating-stats {
  background: #f9fafb;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid #e5e7eb;
}

.loading {
  text-align: center;
  padding: 40px 20px;
  color: #6b7280;
}

.no-ratings {
  text-align: center;
  padding: 40px 20px;
}

.no-ratings p {
  color: #6b7280;
  margin-bottom: 16px;
}

.btn-rate {
  background: #fbbf24;
  color: #1f2937;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-rate:hover {
  background: #f59e0b;
}

.rating-content {
  display: grid;
  grid-template-columns: minmax(260px, 1fr) minmax(320px, 1.5fr);
  gap: 32px;
  align-items: start;
}

.statistics-column {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.average-section {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-bottom: 0;
  padding-bottom: 0;
}

.average-score {
  display: flex;
  align-items: baseline;
  gap: 4px;
  margin-bottom: 12px;
}

.score-number {
  font-size: 48px;
  font-weight: 700;
  color: #1f2937;
}

.score-label {
  font-size: 24px;
  color: #6b7280;
}

.rating-count {
  margin-top: 8px;
  color: #6b7280;
  font-size: 14px;
}

.distribution-section {
  margin-bottom: 0;
}

.distribution-full {
  grid-column: 1 / -1;
  width: 100%;
  margin-top: 8px;
}

.distribution-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.stars-label {
  width: 40px;
  font-size: 14px;
  color: #6b7280;
  text-align: right;
}

.bar-container {
  flex: 1;
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background: #fbbf24;
  transition: width 0.3s ease;
}

.count {
  width: 30px;
  text-align: right;
  font-size: 14px;
  color: #6b7280;
}

.recent-reviews {
  margin-top: 24px;
}

.recent-reviews h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 16px;
}

.see-more-wrapper {
  display: flex;
  justify-content: flex-end;
}

.see-more-inline {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
}

.see-more-link {
  background: transparent;
  border: none;
  color: #2563eb;
  text-decoration: underline;
  cursor: pointer;
  font-weight: 600;
  padding: 0;
}

/* See more wrapper and scroll behavior */
.see-more-wrapper {
  display: flex;
  justify-content: flex-end;
}

.recent-reviews .reviews-list {
  /* default: no height constraint so it doesn't show a scrollbar */
  max-height: none;
  overflow: visible;
}

.recent-reviews.expanded .reviews-list {
  /* when expanded, constrain height and allow scrolling
     increase to 60vh so at least three review cards are visible before scrollbar */
  max-height: 60vh;
  overflow-y: auto;
  padding-right: 8px; /* prevent content touching scrollbar */
}

.see-more-wrapper .btn-see-more {
  width: auto; /* allow button to size to content so it's right-aligned */
  padding: 10px 20px;
}

.review-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.reviewer-info {
  display: flex;
  gap: 12px;
  flex: 1;
}

.reviewer-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #dbeafe;
  color: #1e40af;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  flex-shrink: 0;
}

.reviewer-name {
  margin: 0;
  font-weight: 600;
  font-size: 14px;
  color: #1f2937;
}

.review-date {
  margin: 2px 0 0 0;
  font-size: 12px;
  color: #9ca3af;
}

.review-comment {
  font-size: 14px;
  color: #4b5563;
  line-height: 1.5;
  margin-bottom: 8px;
}

.review-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag {
  display: inline-block;
  background: #fef3c7;
  color: #92400e;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.btn-see-more {
  width: auto;
  padding: 12px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  color: #6b7280;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-see-more:hover {
  background: #f3f4f6;
  border-color: #d1d5db;
}
</style>
