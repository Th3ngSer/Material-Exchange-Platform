<template>
  <div class="profile-page">
    <Header />

    <div class="personal-info">
      <Sidebar v-if="isOwnProfile" />

      <div class="content">
      <div v-if="!isOwnProfile" class="back-button-container">
        <button class="back-btn" @click="goBack">
          ← {{ languageStore.t('back') || 'Back' }}
        </button>
      </div>

      <div v-if="displayUser && !isOwnProfile" class="profile-hero rounded-lg bg-white p-6 shadow-sm mb-6">
        <div class="hero-inner flex items-center gap-6">
          <div class="hero-avatar flex-shrink-0">
            <img
              :src="avatarUrl"
              alt="profile photo"
              class="w-36 h-36 rounded-full object-cover"
              @error="onAvatarError"
            />
          </div>
          <div class="hero-meta">
            <h1 class="text-3xl font-extrabold text-slate-900">
              {{ displayFirstName }} {{ displayLastName }}
            </h1>
            <p class="mt-1 text-sm text-slate-600">@{{ displayUsername }}</p>
          </div>
        </div>

        <div class="extra-info mt-6 grid grid-cols-1 gap-2 text-sm text-slate-700">
          <div><strong>{{ languageStore.t('email') }}:</strong> {{ displayUser?.email || '-' }}</div>
          <div><strong>{{ languageStore.t('phoneNumber') }}:</strong> {{ displayUser?.phone || '-' }}</div>
          <div><strong>{{ languageStore.t('nationality') }}:</strong> {{ displayUser?.nationality || '-' }}</div>
        </div>
      </div>

      
      <div v-if="isOwnProfile" class="info-form">
        <!-- Left column -->
        <div class="form-column">
          <div class="field">
            <span>{{ languageStore.t('firstName') }}</span>
            <p>{{ form.firstName }}</p>
          </div>

          <div class="field">
            <span>{{ languageStore.t('birthDate') }}</span>
            <p>{{ form.birthDate }}</p>
          </div>

          <div class="field">
            <span>{{ languageStore.t('nationality') }}</span>
            <p>{{ form.nationality }}</p>
          </div>

          <div class="field">
            <span>{{ languageStore.t('username') }}</span>
            <p>{{ form.username }}</p>
          </div>
        </div>

        <!-- Right column -->
        <div class="form-column">
          <div class="field">
            <span>{{ languageStore.t('lastName') }}</span>
            <p>{{ form.lastName }}</p>
          </div>

          <div class="field">
            <span>{{ languageStore.t('gender') }}</span>
            <p>{{ form.gender }}</p>
          </div>

          <div class="field">
            <span>{{ languageStore.t('phoneNumber') }}</span>
            <p>{{ form.phone }}</p>
          </div>

          <div class="field">
            <span>{{ languageStore.t('email') }}</span>
            <p>{{ form.email }}</p>
          </div>
        </div>
      </div>

      <div class="form-actions">
        <button v-if="isOwnProfile" class="btn edit" type="button" @click="goToEdit">{{ languageStore.t('editProfile') }}</button>
      </div>

      <!-- User's Posts Section -->
      <div v-if="userPosts.length > 0" class="posts-section">
        <h3 class="posts-title">{{ isOwnProfile ? languageStore.t('myPosts') : `${profileUser?.name}'s Posts` }}</h3>
        <div class="posts-grid">
          <div v-for="post in userPosts" :key="post._id" class="post-card">
            <router-link :to="`/posts/${post._id}`" class="post-image-link">
              <img 
                v-if="post.images?.[0]"
                :src="imageUrl(post.images[0])"
                :alt="post.title"
                class="post-image"
              />
              <div v-else class="post-image-placeholder">📷</div>
            </router-link>
            <div class="post-info">
              <router-link :to="`/posts/${post._id}`" class="post-title-link">
                <h4>{{ post.title }}</h4>
              </router-link>
              <p class="post-category">{{ post.category }} · {{ post.location }}</p>
              <p class="post-price">{{ formatPrice(post) }}</p>
            </div>
          </div>
        </div>
      </div>
      <div v-else-if="!isLoadingPosts" class="no-posts">
        <p>{{ isOwnProfile ? languageStore.t('noPosts') : `${profileUser?.name} has no posts yet.` }}</p>
      </div>
      <div v-if="isLoadingPosts" class="loading">
        <p>{{ languageStore.t('loading') || 'Loading posts...' }}</p>
      </div>
    </div>
    </div>

    <Footer />
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted, computed, ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import axios from 'axios'
import Header from '@/components/layout/Header.vue'
import Footer from '@/components/layout/Footer.vue'
import Sidebar from '../userprofileComponent/Sidebar.vue'
import { useLanguageStore } from '../stores/language'
import { useAuthStore } from '@/stores/auth'
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
const userPosts = ref<UserPost[]>([])
const isLoadingPosts = ref(false)
const viewedUsername = ref<string | null>(null)

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
    const response = await axios.get(`${apiBaseUrl}/auth/user/${encodeURIComponent(userName)}`)
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

const loadUserPosts = async (userId: string) => {
  if (!userId) return
  isLoadingPosts.value = true
  try {
    const response = await axios.get(`${apiBaseUrl}/posts`, {
      params: { ownerId: userId, limit: 100 }
    })
    userPosts.value = response.data.posts || []
    console.log(`Loaded ${userPosts.value.length} posts for user ${userId}`)
  } catch (error) {
    console.error('Failed to load user posts:', error)
    userPosts.value = []
  } finally {
    isLoadingPosts.value = false
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
      await loadUserPosts(userId)
    }
  } else {
    // Viewing own profile
    viewedUsername.value = null
    if (!authStore.user) {
      await authStore.refreshUser()
    }
    fillFromAuthUser()
    // Load own posts by ID
    if (authStore.user?.id) {
      await loadUserPosts(authStore.user.id)
    }
  }
}

const goToEdit = () => {
  router.push('/profile/edit')
}

const goBack = () => {
  router.back()
}

onMounted(async () => {
  await loadProfile()
})
</script>

<style scoped>
.personal-info {
  display: flex;
  min-height: 100vh;
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
