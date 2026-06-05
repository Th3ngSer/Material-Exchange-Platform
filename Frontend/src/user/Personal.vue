<template>
  <div class="personal-page">
    <Header v-if="!isOwnProfile" />

    <div class="personal-info">
      <Sidebar v-if="isOwnProfile" />

      <div class="content">
      <div v-if="!isOwnProfile" class="back-button-container">
        <button class="back-btn" @click="goBack">← {{ languageStore.t('back') || 'Back' }}</button>
      </div>

      <div v-if="displayUser && !isOwnProfile" class="profile-hero rounded-lg bg-white p-6 shadow-sm mb-6">
        <div class="hero-inner flex items-center gap-6">
          <div class="hero-avatar flex-shrink-0">
            <img :src="avatarUrl" alt="profile photo" class="w-36 h-36 rounded-full object-cover" @error="onAvatarError" />
          </div>

          <div class="hero-meta">
            <h1 class="text-3xl font-extrabold text-slate-900">{{ displayFirstName }} {{ displayLastName }}</h1>
            <p class="mt-1 text-sm text-slate-600">@{{ displayUsername }}</p>

            <div class="profile-rating-summary mt-4 flex flex-wrap items-center gap-3">
              <div class="rating-score flex items-end gap-1">
                <span class="rating-value">{{ ratingValue }}</span>
                <span class="rating-out-of">/5</span>
              </div>

              <span v-for="star in 5" :key="star" class="rating-star" :class="{ filled: star <= Math.round(displayUser?.rating || 0) }">★</span>

              <div class="rating-stat text-sm text-slate-500">{{ ratingText }}</div>

              <button v-if="!isOwnProfile" class="btn-rate-user" @click="handleRateClick">★ Rate this seller</button>
            </div>

            <div v-if="!isOwnProfile" class="profile-action-buttons mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                @click="goToChat"
                class="profile-action-button chat"
              >
                {{ languageStore.t('message' as any) || 'Message' }}
              </button>
            </div>
          </div>
        </div>

        <div class="extra-info mt-6 grid grid-cols-1 gap-2 text-sm text-slate-700">
          <div><strong>{{ languageStore.t('email') }}:</strong> {{ displayUser?.email || '-' }}</div>
          <div><strong>{{ languageStore.t('phoneNumber') }}:</strong> {{ displayUser?.phone || '-' }}</div>
          <div><strong>{{ languageStore.t('nationality') }}:</strong> {{ displayUser?.nationality || '-' }}</div>
        </div>
      </div>

      <div v-if="!isOwnProfile" class="posts-section">
        <div class="posts-title">{{ languageStore.t('userPosts' as any) || 'Posts' }}</div>

        <div v-if="isLoadingPosts" class="message-panel">{{ languageStore.t('loading') || 'Loading posts...' }}</div>
        <div v-else-if="postsError" class="message-panel error">{{ postsError }}</div>
        <div v-else-if="!hasProfilePosts" class="message-panel empty">{{ languageStore.t('noPosts') || 'This user has no posts yet.' }}</div>

        <div v-else>
          <section v-if="postsByType.sell.length > 0" class="post-category-section">
            <div class="category-title"><span>📦</span> {{ languageStore.t('forSale') || 'For Sale' }}</div>
            <div class="posts-grid">
              <article v-for="post in postsByType.sell" :key="post._id" class="post-card">
                <router-link :to="`/posts/${post._id}`" class="post-image-link">
                  <img v-if="post.images?.[0]" :src="imageUrl(post.images[0])" :alt="post.title" class="post-image" />
                </router-link>
                <div class="post-meta p-4">
                  <router-link :to="`/posts/${post._id}`" class="post-title">{{ post.title }}</router-link>
                  <p class="post-detail">{{ post.category }} · {{ post.location }}</p>
                  <p class="post-price">{{ formatPrice(post) }}</p>
                </div>
              </article>
            </div>
          </section>

          <section v-if="postsByType.exchange.length > 0" class="post-category-section">
            <div class="category-title"><span>🔄</span> {{ languageStore.t('forExchange' as any) || 'For Exchange' }}</div>
            <div class="posts-grid">
              <article v-for="post in postsByType.exchange" :key="post._id" class="post-card">
                <router-link :to="`/posts/${post._id}`" class="post-image-link">
                  <img v-if="post.images?.[0]" :src="imageUrl(post.images[0])" :alt="post.title" class="post-image" />
                </router-link>
                <div class="post-meta p-4">
                  <router-link :to="`/posts/${post._id}`" class="post-title">{{ post.title }}</router-link>
                  <p class="post-detail">{{ post.category }} · {{ post.location }}</p>
                  <p class="post-price">{{ formatPrice(post) }}</p>
                </div>
              </article>
            </div>
          </section>

          <section v-if="postsByType.lend.length > 0" class="post-category-section">
            <div class="category-title"><span>🤝</span> {{ languageStore.t('forLend' as any) || 'For Lend' }}</div>
            <div class="posts-grid">
              <article v-for="post in postsByType.lend" :key="post._id" class="post-card">
                <router-link :to="`/posts/${post._id}`" class="post-image-link">
                  <img v-if="post.images?.[0]" :src="imageUrl(post.images[0])" :alt="post.title" class="post-image" />
                </router-link>
                <div class="post-meta p-4">
                  <router-link :to="`/posts/${post._id}`" class="post-title">{{ post.title }}</router-link>
                  <p class="post-detail">{{ post.category }} · {{ post.location }}</p>
                  <p class="post-price">{{ formatPrice(post) }}</p>
                </div>
              </article>
            </div>
          </section>
        </div>
      </div>

      <section id="recent-reviews">
        <RatingStats
          v-if="!isOwnProfile && profileUser"
          :stats="ratingStats"
          :is-loading="isLoadingRatings"
          :show-recent-reviews="true"
          :expanded="showAllReviews"
          class="mb-8"
          @rate="handleRateClick"
          @see-more="handleSeeMore"
        />
      </section>

      <div v-if="isOwnProfile" class="info-form">
        <div class="form-column">
          <div class="field"><span>{{ languageStore.t('firstName') }}</span><p>{{ form.firstName }}</p></div>
          <div class="field"><span>{{ languageStore.t('birthDate') }}</span><p>{{ form.birthDate }}</p></div>
          <div class="field"><span>{{ languageStore.t('nationality') }}</span><p>{{ form.nationality }}</p></div>
          <div class="field"><span>{{ languageStore.t('username') }}</span><p>{{ form.username }}</p></div>
        </div>

        <div class="form-column">
          <div class="field"><span>{{ languageStore.t('lastName') }}</span><p>{{ form.lastName }}</p></div>
          <div class="field"><span>{{ languageStore.t('gender') }}</span><p>{{ form.gender }}</p></div>
          <div class="field"><span>{{ languageStore.t('phoneNumber') }}</span><p>{{ form.phone }}</p></div>
          <div class="field"><span>{{ languageStore.t('email') }}</span><p>{{ form.email }}</p></div>
        </div>
      </div>

      <div class="form-actions"><button v-if="isOwnProfile" class="btn edit" type="button" @click="goToEdit">{{ languageStore.t('editProfile') }}</button></div>

      <RatingModal v-if="showRatingModal && profileUser" :user-id="profileUser.id" :user-name="profileUser.name" @submit="handleRatingSubmit" @close="showRatingModal = false" />
    </div>
  </div>

    <Footer v-if="!isOwnProfile" />
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted, computed, ref, watch, onBeforeUnmount, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import axios from 'axios'
import Sidebar from '../userprofileComponent/Sidebar.vue'
import Header from '@/components/layout/Header.vue'
import Footer from '@/components/layout/Footer.vue'
import RatingStats from '@/components/RatingStats.vue'
import RatingModal from '@/components/RatingModal.vue'
import { useLanguageStore } from '../stores/language'
import { useAuthStore } from '@/stores/auth'
import { ratingsApi } from '@/services/ratings'
import type { User } from '@/types/auth'

interface UserPost {
  _id: string
  title: string
  category: string
  location: string
  images?: string[]
  type?: string
  price?: number
}

const router = useRouter()
const route = useRoute()
const languageStore = useLanguageStore()
const authStore = useAuthStore()

const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
const DEFAULT_AVATAR = '/userprofileImage/avatar.png'

const profileUser = ref<User | null>(null)
const viewedUsername = ref<string | null>(null)
const showRatingModal = ref(false)
const showAllReviews = ref(false)
const allRatings = ref<any[] | null>(null)

const handleSeeMore = async () => {
  const userId = profileUser.value?.id || ''
  if (!userId) return
  isLoadingRatings.value = true
  try {
    const resp = await ratingsApi.getAllRatingsForUser(userId)
    const fetched = resp.data || resp || []
    console.log('handleSeeMore: fetched ratings count =', (fetched && fetched.length) || 0)
    try { console.log('handleSeeMore: fetched ids =', (fetched || []).map((r: any) => r._id)) } catch (e) {}
    // put fetched reviews into the recentRatings shown by RatingStats
    if (!ratingStats.value) ratingStats.value = { averageScore: 0, totalRatings: fetched.length, distribution: {1:0,2:0,3:0,4:0,5:0}, recentRatings: [] }
    ratingStats.value.recentRatings = fetched
    console.log('handleSeeMore: ratingStats after set recentRatings, totalRatings=', ratingStats.value?.totalRatings, 'recentRatings.length=', (ratingStats.value?.recentRatings || []).length)
    showAllReviews.value = true
    console.log('handleSeeMore: populated recentRatings with', (fetched && fetched.length) || 0)
    await nextTick()
    const el = document.getElementById('recent-reviews')
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  } catch (err) {
    console.error('Failed to load all ratings:', err)
    ratingStats.value = ratingStats.value || { averageScore: 0, totalRatings: 0, distribution: {1:0,2:0,3:0,4:0,5:0}, recentRatings: [] }
    ratingStats.value.recentRatings = []
    showAllReviews.value = true
    console.log('handleSeeMore: error fetching ratings')
    await nextTick()
    const el = document.getElementById('recent-reviews')
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  } finally {
    isLoadingRatings.value = false
  }
}
const ratingStats = ref<any>(null)
const isLoadingRatings = ref(false)
const profilePosts = ref<UserPost[]>([])
const isLoadingPosts = ref(false)
const postsError = ref('')

const displayUser = computed<User | null>(() => profileUser.value || authStore.user || null)

const displayFirstName = computed(() => {
  const name = (displayUser.value?.name || '').trim()
  if (!name) return displayUser.value?.username?.split(/\s+/)[0] ?? ''
  return name.split(/\s+/)[0]
})

const displayLastName = computed(() => {
  const name = (displayUser.value?.name || '').trim()
  if (!name) return ''
  const parts = name.split(/\s+/)
  parts.shift()
  return parts.join(' ')
})

const displayUsername = computed(() => displayUser.value?.username || '')
const routeUserName = computed(() => {
  const raw = route.query.user
  if (Array.isArray(raw)) return raw[0] || ''
  return String(raw || '').trim()
})
const profileIdentifier = computed(() => profileUser.value?.username || profileUser.value?.id || viewedUsername.value || routeUserName.value || '')
const profileFullName = computed(() => profileUser.value?.name || displayUser.value?.name || displayUser.value?.username || profileIdentifier.value)

const chatQuery = computed(() => ({
  sellerId: profileUser.value?.id || profileIdentifier.value,
  sellerName: profileFullName.value,
  sellerAvatar: avatarUrl.value,
  sellerLocation: (profileUser.value as any)?.location || '',
}))

const goToChat = () => {
  const query = chatQuery.value
  if (!query.sellerName || !query.sellerId) {
    return
  }
  router.push({ name: 'chat', query })
}

const ratingValue = computed(() => {
  if (displayUser.value?.rating !== undefined && displayUser.value?.rating !== null) {
    return displayUser.value.rating.toFixed(1)
  }
  return '0.0'
})
const ratingText = computed(() => {
  if (displayUser.value?.rating !== undefined && displayUser.value?.rating !== null) {
    return 'Average rating from users'
  }
  return 'No ratings yet'
})

const postsByType = computed<Record<'sell' | 'exchange' | 'lend', UserPost[]>>(() => {
  const grouped: Record<'sell' | 'exchange' | 'lend', UserPost[]> = {
    sell: [],
    exchange: [],
    lend: [],
  }

  for (const post of profilePosts.value) {
    const type = ['sell', 'exchange', 'lend'].includes(String(post.type))
      ? (post.type as 'sell' | 'exchange' | 'lend')
      : 'sell'
    grouped[type].push(post)
  }

  return grouped
})

const hasProfilePosts = computed(() => profilePosts.value.length > 0)
const avatarUrl = ref<string>(DEFAULT_AVATAR)

function normalizeAvatarPath(avatar?: string | null) {
  if (!avatar) return DEFAULT_AVATAR
  if (/^https?:\/\//i.test(avatar)) return avatar
  // backend returns paths like 'uploads/xxx'
  const base = apiBaseUrl.replace(/\/api\/?$/, '')
  const clean = avatar.replace(/^\/+/, '')
  if (clean.startsWith('uploads/')) return `${base}/${clean}`
  return `${base}/uploads/${clean}`
}

watch(displayUser, (val) => {
  avatarUrl.value = normalizeAvatarPath(val?.avatar)
}, { immediate: true })

const onAvatarError = () => {
  avatarUrl.value = DEFAULT_AVATAR
}

async function loadProfilePosts(userId: string) {
  profilePosts.value = []
  postsError.value = ''
  isLoadingPosts.value = true

  try {
    const response = await axios.get(`${apiBaseUrl}/posts`, {
      params: { ownerId: userId, limit: '100' },
    })
    profilePosts.value = response.data.posts ?? []
  } catch (error: unknown) {
    console.error('Failed to load user posts:', error)
    postsError.value =
      languageStore.t('errorLoadingSavedPosts') || 'Failed to load posts for this user.'
  } finally {
    isLoadingPosts.value = false
  }
}

const form = reactive({
  firstName: '',
  lastName: '',
  birthDate: '',
  nationality: '',
  username: '',
  gender: '',
  phone: '',
  email: '',
})

const isOwnProfile = computed(() => {
  if (!viewedUsername.value) return true
  const currentUser = authStore.user
  if (!currentUser) return false

  const normalizedViewed = String(viewedUsername.value).trim().toLowerCase()
  const currentIdentities = [currentUser.username, currentUser.name]
    .filter(Boolean)
    .map((value) => String(value).trim().toLowerCase())

  return currentIdentities.includes(normalizedViewed)
})

function formatPrice(post: UserPost) {
  if (post.type === 'exchange') return languageStore.t('openToTrade') || 'Open to Trade'
  const suffix = post.type === 'lend' ? ` ${languageStore.t('perDay') || 'per day'}` : ''
  return `$${Number(post.price || 0).toFixed(2)}${suffix}`
}

function imageUrl(filename: string) {
  if (/^https?:\/\//i.test(filename)) return filename
  const uploadBaseUrl = apiBaseUrl.replace(/\/api\/?$/, '')
  const clean = filename.replace(/^\/+/, '')
  if (clean.startsWith('uploads/')) return `${uploadBaseUrl}/${clean}`
  return `${uploadBaseUrl}/uploads/${clean}`
}

const fillFromAuthUser = () => {
  if (!authStore.user) return
  const fullName = authStore.user.name || ''
  const [firstName, ...rest] = fullName.split(' ')
  const lastName = rest.join(' ')

  form.firstName = firstName || ''
  form.lastName = lastName || ''
  form.email = authStore.user.email || ''
  form.username = authStore.user.username || authStore.user.name || authStore.user.email || ''
  form.birthDate = authStore.user.birthDate || ''
  form.nationality = authStore.user.nationality || ''
  form.gender = authStore.user.gender || ''
  form.phone = authStore.user.phone || ''
}

const fillFromUser = (user: User | null) => {
  if (!user) return
  const fullName = user.name || ''
  const [firstName, ...rest] = fullName.split(' ')
  const lastName = rest.join(' ')

  form.firstName = firstName || ''
  form.lastName = lastName || ''
  form.email = user.email || ''
  form.username = user.username || user.name || user.email || ''
  form.birthDate = user.birthDate || ''
  form.nationality = user.nationality || ''
  form.gender = user.gender || ''
  form.phone = user.phone || ''
}

const loadUserProfile = async (userName: string) => {
  try {
    const objectIdPattern = /^[0-9a-fA-F]{24}$/
    const isObjectId = objectIdPattern.test(userName)
    const url = isObjectId
      ? `${apiBaseUrl}/auth/user/id/${encodeURIComponent(userName)}`
      : `${apiBaseUrl}/auth/user/${encodeURIComponent(userName)}`

    const response = await axios.get(url)
    profileUser.value = response.data
    fillFromUser(response.data)
    return response.data.id
  } catch (error) {
    console.error('Failed to load user profile:', error)
    alert(`User "${userName}" not found`)
    router.push('/browse')
    return null
  }
}

const loadRatingStats = async (userId: string) => {
  if (!userId) return
  isLoadingRatings.value = true
  // reset expanded view when reloading stats
  showAllReviews.value = false
  try {
    const response = await ratingsApi.getUserRatingStats(userId)
    ratingStats.value = response.data || response

    // If the stats endpoint doesn't already include recent ratings, populate them from the full ratings list.
    if (ratingStats.value && !ratingStats.value.recentRatings) {
      const recentResponse = await ratingsApi.getAllRatingsForUser(userId)
      const recentRatings = recentResponse.data || recentResponse || []
      ratingStats.value = {
        ...ratingStats.value,
        recentRatings,
      }
    }
  } catch (error) {
    console.error('Failed to load rating stats:', error)
    ratingStats.value = null
  } finally {
    isLoadingRatings.value = false
  }
}

const handleRateClick = () => {
  if (!authStore.isAuthenticated) {
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

const handleRatingSubmit = async (payload: {score: number; comment?: string; tags?: string[]}) => {
  try {
    const viewedUserId = profileUser.value?.id || ''
    await ratingsApi.submitRating({
      userId: viewedUserId,
      score: payload.score,
      comment: payload.comment,
      tags: payload.tags,
    })
    
    // Refresh rating stats
    await loadRatingStats(viewedUserId)
    showRatingModal.value = false
    alert('Thank you for your rating!')
  } catch (error) {
    console.error('Failed to submit rating:', error)
    alert('Failed to submit rating. Please try again.')
  }
}

const loadProfile = async () => {
  const rawUserName = route.query.user
  const userName = Array.isArray(rawUserName) ? rawUserName[0] : rawUserName

  const normalizedUserName = String(userName || '').trim().toLowerCase()
  const currentUser = authStore.user
  const isSameUser = currentUser
    ? [currentUser.username, currentUser.name]
        .filter(Boolean)
        .map((value) => String(value).trim().toLowerCase())
        .includes(normalizedUserName)
    : false

  if (userName && !isSameUser) {
    // Viewing another user's profile
    viewedUsername.value = userName
    const userId = await loadUserProfile(userName)
    if (userId) {
      await loadRatingStats(userId)
      await loadProfilePosts(userId)
    }
  } else {
    // Viewing own profile
    viewedUsername.value = null
    if (!authStore.user) {
      await authStore.refreshUser()
    }
    fillFromAuthUser()
  }
}

const goToEdit = () => {
  router.push('/profile/edit')
}

const goBack = () => {
  router.back()
}

watch(
  () => authStore.user,
  () => {
    fillFromAuthUser()
  },
  { immediate: true, deep: true }
)

watch(
  () => route.query.user,
  async () => {
    await loadProfile()
  }
)

onMounted(async () => {
  await loadProfile()
  // react to profile updates for this user and update avatar + posts
  const handleProfileUpdated = async (e: Event) => {
    try {
      const detail = (e as CustomEvent).detail as { userId?: string; avatar?: string; username?: string }
      if (!detail) return
      const { userId, avatar, username } = detail
      // if this profile belongs to the updated user, refresh avatar and posts + ratings
      const isThisProfile = (() => {
        if (!profileUser.value) return false
        if (profileUser.value.id && userId) return String(profileUser.value.id) === String(userId)
        if (profileUser.value.username && username) return String(profileUser.value.username).trim().toLowerCase() === String(username).trim().toLowerCase()
        return false
      })()
      if (isThisProfile) {
        if (avatar) profileUser.value = { ...(profileUser.value as any), avatar }
        const id = profileUser.value?.id || ''
        if (id) {
          try {
            await loadRatingStats(id)
          } catch {}
          try {
            await loadProfilePosts(id)
          } catch {}
        }
      }
    } catch {
      // ignore
    }
  }
  window.addEventListener('profileUpdated', handleProfileUpdated as EventListener)
  ;(window as any).__personal_handleProfileUpdated = handleProfileUpdated
})

onBeforeUnmount(() => {
  const h = (window as any).__personal_handleProfileUpdated
  if (h) window.removeEventListener('profileUpdated', h as EventListener)
})
</script>

<style scoped>
.personal-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.personal-info {
  display: flex;
  flex: 1;
}

.content {
  flex: 1;
  padding: 32px;
}

.back-button-container {
  margin-bottom: 20px;
}

.back-btn {
  background: none;
  border: none;
  color: #1e1b4b;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: color 0.2s;
}

.back-btn:hover {
  color: #ff4b42;
}

.profile-action-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.profile-action-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 120px;
  padding: 0.75rem 1.25rem;
  border-radius: 9999px;
  font-size: 0.9rem;
  font-weight: 600;
  text-align: center;
  transition: background-color 0.2s ease, color 0.2s ease, transform 0.2s ease;
}

.profile-action-button.chat {
  background: #ff8c00;
  color: white;
}

.profile-action-button.chat:hover {
  background: #ff9d21;
}

.profile-action-button.report {
  background: white;
  color: #1e1b4b;
  border: 1px solid #e0e2f3;
}

.profile-action-button.report:hover {
  background: #f5f6ff;
}

.profile-action-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 24px;
}

.info-form {
  display: flex;
  gap: 32px;
}

.form-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.field span {
  font-size: 13px;
  color: gray;
}

.field p {
  margin: 6px 0 0;
  font-size: 14px;
  font-weight: 500;
}

/* button */
.form-actions {
  margin-top: 32px;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 4px;
  font-weight: bold;
  background: #1e1b4b;
  color: white;
  cursor: pointer;
  transition: background 0.2s;
}

.btn:hover {
  background: #2d2963;
}

.profile-rating-summary {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 16px;
}

.rating-score {
  display: flex;
  align-items: flex-end;
  gap: 4px;
}

.rating-value {
  font-size: 32px;
  font-weight: 700;
  color: #111827;
}

.rating-out-of {
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 2px;
}

.rating-stars {
  display: flex;
  gap: 2px;
}

.rating-star {
  font-size: 16px;
  color: #cbd5e1;
}

.rating-star.filled {
  color: #f59e0b;
}

.rating-stat {
  color: #6b7280;
}

.btn-rate-user {
  padding: 8px 16px;
  background: #fbbf24;
  color: #1f2937;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-rate-user:hover {
  background: #f59e0b;
}

/* Posts Section */
.posts-section {
  margin-top: 48px;
  padding-top: 32px;
  border-top: 1px solid #e2e8f0;
}

.posts-title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #1e1b4b;
}

.post-category-section {
  margin-bottom: 32px;
}

.category-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #374151;
  display: flex;
  align-items: center;
  gap: 8px;
}

.posts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}

.post-card {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
  transition: box-shadow 0.2s;
}

.post-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.post-image-link {
  display: block;
  overflow: hidden;
  aspect-ratio: 4 / 3;
  background: #f1f5f9;
}

.post-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.post-image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
}

.post-info {
  padding: 12px;
}

.post-title-link {
  text-decoration: none;
  color: inherit;
}

.post-title-link h4 {
  margin: 0 0 8px;
  font-size: 14px;
  font-weight: 600;
  color: #1e1b4b;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.post-title-link:hover h4 {
  color: #ff4b42;
}

.post-category {
  margin: 0 0 8px;
  font-size: 12px;
  color: #64748b;
}

.post-price {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #1e1b4b;
}

.no-posts {
  text-align: center;
  padding: 40px 20px;
  color: #64748b;
}

.loading {
  text-align: center;
  padding: 40px 20px;
  color: #64748b;
}
</style>
