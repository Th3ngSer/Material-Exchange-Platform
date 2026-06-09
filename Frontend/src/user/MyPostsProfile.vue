<template>
  <div class="posts-page">
    <Sidebar />

    <div class="content">
      <section class="header-section">
          <div>
            <p class="section-label">{{ languageStore.t('myPosts') }}</p>
            <h1 class="page-title">{{ languageStore.t('myPosts') }}</h1>
          </div>

          <div class="header-actions">
            <span class="posts-count">{{ total }} {{ languageStore.t('postsSaved') || 'Posts' }}</span>
            <button class="btn-refresh" type="button" @click="loadPosts">{{ languageStore.t('refresh') || 'Refresh' }}</button>
          </div>
        </section>

        <div v-if="isLoading" class="message-panel">{{ languageStore.t('loading') || 'Loading posts...' }}</div>
        <div v-else-if="errorMessage" class="message-panel error">{{ errorMessage }}</div>
        <div v-else-if="!hasPosts" class="message-panel empty">{{ languageStore.t('noPosts') || 'You have no posts yet.' }}</div>

        <div v-else class="post-groups">
          <section v-if="postsByType.sell.length > 0" class="category-block">
            <div class="category-heading">
              <span class="category-emoji">📦</span>
              <h2>{{ languageStore.t('forSale') || 'For Sale' }}</h2>
            </div>
            <div class="post-grid">
              <article v-for="post in postsByType.sell" :key="post._id" class="post-card">
                <router-link :to="`/posts/${post._id}`" class="post-link">
                  <img v-if="post.images?.[0]" :src="imageUrl(post.images[0])" :alt="post.title" class="post-image" />
                  <div v-else class="post-image-placeholder">📷</div>
                </router-link>
                <div class="post-meta">
                  <router-link :to="`/posts/${post._id}`" class="post-title">{{ post.title }}</router-link>
                  <p class="post-detail">{{ post.category }} · {{ post.location }}</p>
                  <p class="post-price">{{ formatPrice(post) }}</p>
                  <button class="btn-delete" type="button" @click="deletePost(post._id, post.title)">{{ languageStore.t('delete') || 'Delete' }}</button>
                </div>
              </article>
            </div>
          </section>

          <section v-if="postsByType.exchange.length > 0" class="category-block">
            <div class="category-heading">
              <span class="category-emoji">🔄</span>
              <h2>For Exchange</h2>
            </div>
            <div class="post-grid">
              <article v-for="post in postsByType.exchange" :key="post._id" class="post-card">
                <router-link :to="`/posts/${post._id}`" class="post-link">
                  <img v-if="post.images?.[0]" :src="imageUrl(post.images[0])" :alt="post.title" class="post-image" />
                  <div v-else class="post-image-placeholder">📷</div>
                </router-link>
                <div class="post-meta">
                  <router-link :to="`/posts/${post._id}`" class="post-title">{{ post.title }}</router-link>
                  <p class="post-detail">{{ post.category }} · {{ post.location }}</p>
                  <p class="post-price">{{ formatPrice(post) }}</p>
                  <button class="btn-delete" type="button" @click="deletePost(post._id, post.title)">{{ languageStore.t('delete') || 'Delete' }}</button>
                </div>
              </article>
            </div>
          </section>

          <section v-if="postsByType.lend.length > 0" class="category-block">
            <div class="category-heading">
              <span class="category-emoji">🤝</span>
              <h2>For Lend</h2>
            </div>
            <div class="post-grid">
              <article v-for="post in postsByType.lend" :key="post._id" class="post-card">
                <router-link :to="`/posts/${post._id}`" class="post-link">
                  <img v-if="post.images?.[0]" :src="imageUrl(post.images[0])" :alt="post.title" class="post-image" />
                  <div v-else class="post-image-placeholder">📷</div>
                </router-link>
                <div class="post-meta">
                  <router-link :to="`/posts/${post._id}`" class="post-title">{{ post.title }}</router-link>
                  <p class="post-detail">{{ post.category }} · {{ post.location }}</p>
                  <p class="post-price">{{ formatPrice(post) }}</p>
                  <button class="btn-delete" type="button" @click="deletePost(post._id, post.title)">{{ languageStore.t('delete') || 'Delete' }}</button>
                </div>
              </article>
            </div>
          </section>
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import axios from 'axios'
import api from '@/services/api'
import Sidebar from '../userprofileComponent/Sidebar.vue'
import { useLanguageStore } from '../stores/language'
import { useAuthStore } from '@/stores/auth'

interface UserPost {
  _id: string
  title: string
  category: string
  location: string
  images?: string[]
  type?: string
  price?: number
}

const languageStore = useLanguageStore()
const authStore = useAuthStore()
const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
const posts = ref<UserPost[]>([])
const isLoading = ref(false)
const errorMessage = ref('')

const hasPosts = computed(() => posts.value.length > 0)
const total = computed(() => posts.value.length)

const postsByType = computed<Record<'sell' | 'exchange' | 'lend', UserPost[]>>(() => {
  const grouped: Record<'sell' | 'exchange' | 'lend', UserPost[]> = {
    sell: [],
    exchange: [],
    lend: [],
  }

  for (const post of posts.value) {
    const type = ['sell', 'exchange', 'lend'].includes(String(post.type))
      ? (post.type as 'sell' | 'exchange' | 'lend')
      : 'sell'
    grouped[type].push(post)
  }

  return grouped
})

function imageUrl(filename: string) {
  if (/^https?:\/\//i.test(filename)) return filename
  const uploadBaseUrl = apiBaseUrl.replace(/\/api\/?$/, '')
  const clean = filename.replace(/^\/+/, '')
  if (clean.startsWith('uploads/')) return `${uploadBaseUrl}/${clean}`
  return `${uploadBaseUrl}/uploads/${clean}`
}

function getErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message ?? fallback
  }
  if (error instanceof Error) {
    return error.message
  }
  return fallback
}

async function deletePost(postId: string, title: string) {
  if (!confirm(`${languageStore.t('confirmDelete')} "${title}"? ${languageStore.t('cannotBeUndone')}`)) {
    return
  }

  const isAdmin = authStore.user?.role === 'admin'
  const endpoint = isAdmin ? `/posts/admin/${postId}` : `/posts/${postId}`

  try {
    await api.delete(endpoint)
    await loadPosts()
  } catch (error: unknown) {
    const msg = getErrorMessage(error, languageStore.t('failedToDeletePost'))
    alert(msg)
  }
}

function formatPrice(post: UserPost) {
  if (post.type === 'exchange') return languageStore.t('openToTrade') || 'Open to Trade'
  const suffix = post.type === 'lend' ? ` ${languageStore.t('perDay') || 'per day'}` : ''
  return `$${Number(post.price || 0).toFixed(2)}${suffix}`
}

async function loadPosts() {
  if (!authStore.user?.id) {
    errorMessage.value = languageStore.t('loginRequired') || 'Please log in to view your posts.'
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  try {
    const response = await api.get('/posts', {
      params: { ownerId: authStore.user.id, limit: 100 },
    })
    posts.value = response.data.posts || []
  } catch (error) {
    console.error('Failed to load user posts:', error)
    errorMessage.value = languageStore.t('errorLoadingSavedPosts') || 'Failed to load your posts.'
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  if (!authStore.user) {
    await authStore.initializeAuth()
  }
  await loadPosts()
})
</script>

<style scoped>
.posts-page {
  display: flex;
  min-height: 100vh;
}

.content {
  flex: 1;
  padding: 32px;
  background: #fafafa;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.section-label {
  text-transform: uppercase;
  font-size: 12px;
  color: #0f5e66;
  font-weight: 700;
  letter-spacing: 0.14em;
}

.page-title {
  font-size: 32px;
  font-weight: 800;
  margin: 8px 0 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.posts-count {
  font-weight: 600;
  color: #334155;
}

.btn-refresh {
  background: #ff8c00;
  color: white;
  border: none;
  padding: 0.85rem 1.3rem;
  border-radius: 999px;
  font-weight: 700;
  cursor: pointer;
}

.btn-delete {
  margin-top: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0.65rem 1rem;
  border-radius: 999px;
  border: 1px solid transparent;
  background: #f87171;
  color: white;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s ease;
}

.btn-delete:hover {
  background: #ef4444;
}

.message-panel {
  border-radius: 18px;
  padding: 24px;
  background: white;
  color: #334155;
  margin-bottom: 24px;
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.08);
}

.message-panel.error {
  background: #fee2e2;
  color: #991b1b;
}

.message-panel.empty {
  background: #eff6ff;
  color: #1e40af;
}

.post-groups {
  display: grid;
  gap: 28px;
}

.category-block {
  background: white;
  border-radius: 24px;
  padding: 24px;
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.05);
}

.category-heading {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 18px;
}

.category-emoji {
  font-size: 1.4rem;
}

.category-heading h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 800;
}

.post-grid {
  display: grid;
  gap: 18px;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
}

.post-card {
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  overflow: hidden;
  background: #ffffff;
}

.post-link {
  display: block;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  background: #f8fafc;
}

.post-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.post-image-placeholder {
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
  font-size: 2rem;
  color: #94a3b8;
}

.post-meta {
  padding: 18px;
}

.post-title {
  display: block;
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 8px;
  text-decoration: none;
}

.post-detail {
  margin: 0;
  font-size: 14px;
  color: #64748b;
}

.post-price {
  margin-top: 12px;
  font-size: 15px;
  font-weight: 700;
  color: #111827;
}
</style>
