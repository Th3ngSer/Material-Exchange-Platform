<script setup lang="ts">
import { getToken } from '@/utils/tokenStorage'
import { computed, onMounted, ref, onBeforeUnmount } from 'vue'
import axios from 'axios'
import { useLanguageStore } from '@/stores/language'
import { useAuthStore } from '@/stores/auth'
import Header from '@/components/layout/Header.vue'
import Footer from '@/components/layout/Footer.vue'

interface Post {
  _id: string
  type: 'sell' | 'exchange' | 'lend'
  title: string
  description: string
  category: string
  condition: 'new' | 'used'
  price: number
  exchangeFor?: string
  contact: string
  location: string
  images: string[]
  ownerId?: string
  listerName?: string
  createdAt?: string
}

type PostsResponse = {
  total: number
  page: number
  posts: Post[]
}

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'
const posts = ref<Post[]>([])
const isLoading = ref(false)
const errorMessage = ref('')
const languageStore = useLanguageStore()
const authStore = useAuthStore()
const hasPosts = computed(() => posts.value.length > 0)
const total = computed(() => posts.value.length)
const visiblePosts = computed(() => posts.value)
const currentUserIdentifiers = computed(() => {
  const user = authStore.user
  if (!user) return []

  return [user.id, user.name, user.username]
    .filter((value): value is string => Boolean(value))
    .map((value) => value.toLowerCase().trim())
})

function formatType(type: Post['type']) {
  return languageStore.t(type)
}

function formatCondition(condition: Post['condition']) {
  return languageStore.t(condition)
}

function formatPrice(post: Post) {
  if (post.type === 'exchange') return languageStore.t('openToTrade')
  const suffix = post.type === 'lend' ? languageStore.t('perDay') : ''
  return `$${Number(post.price || 0).toFixed(2)}${suffix}`
}

function imageUrl(filename: string) {
  if (/^https?:\/\//i.test(filename)) return filename
  const uploadBaseUrl = apiBaseUrl.replace(/\/api\/?$/, '')
  const clean = filename.replace(/^\/+/, '')
  if (clean.startsWith('uploads/')) return `${uploadBaseUrl}/${clean}`
  return `${uploadBaseUrl}/uploads/${clean}`
}

function detailPath(postId: string) {
  return `/posts/${postId}`
}

function editPath(postId: string) {
  return `/posts/${postId}/edit`
}

function canManagePost(post: Post) {
  if (authStore.user?.role === 'admin') return true

  if (post.ownerId && authStore.user?.id === post.ownerId) return true

  const listerName = post.listerName?.toLowerCase().trim()
  return Boolean(listerName && currentUserIdentifiers.value.includes(listerName))
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

async function loadPosts() {
  isLoading.value = true
  errorMessage.value = ''
  posts.value = []

  if (!authStore.user?.id) {
    errorMessage.value = languageStore.t('loginRequired') || 'Please log in to see your posts.'
    isLoading.value = false
    return
  }

  try {
    const { data } = await axios.get<PostsResponse>(`${apiBaseUrl}/posts`, {
      params: { ownerId: authStore.user.id, limit: '100' },
    })
    posts.value = data.posts ?? []
  } catch (error: unknown) {
    errorMessage.value = getErrorMessage(error, languageStore.t('errorLoadingSavedPosts'))
  } finally {
    isLoading.value = false
  }
}

async function deletePost(postId: string, title: string) {
  if (!confirm(`${languageStore.t('confirmDelete')} "${title}"? ${languageStore.t('cannotBeUndone')}`)) {
    return
  }

  const isAdmin = authStore.user?.role === 'admin'
  const endpoint = isAdmin ? `${apiBaseUrl}/posts/admin/${postId}` : `${apiBaseUrl}/posts/${postId}`

  try {
    await axios.delete(endpoint, {
      headers: {
        Authorization: `Bearer ${getToken() ?? ''}`,
      },
    })
    posts.value = posts.value.filter((p) => p._id !== postId)
  } catch (error: unknown) {
    const msg = getErrorMessage(error, languageStore.t('failedToDeletePost'))
    alert(msg)
  }
}

onMounted(() => {
  loadPosts()

  const handleProfileUpdated = (e: Event) => {
    try {
      const detail = (e as CustomEvent).detail as { userId?: string; avatar?: string; username?: string }
      if (!detail) return
      const { userId, avatar, username } = detail
      posts.value = posts.value.map((p) => {
        const ownedById = userId && p.ownerId && String(p.ownerId) === String(userId)
        const ownedByName = username && String(p.listerName || '').trim().toLowerCase() === String(username).trim().toLowerCase()
        if (ownedById || ownedByName) {
          return {
            ...p,
            listerName: username || p.listerName,
            // store avatar path as returned by backend
            // frontend will compute full URL where needed
            listerAvatar: avatar || (p as any)['listerAvatar'],
          }
        }
        return p
      })
    } catch {
      // ignore
    }
  }

  window.addEventListener('profileUpdated', handleProfileUpdated as EventListener)
  ;(window as any).__postsList_handleProfileUpdated = handleProfileUpdated
})

onBeforeUnmount(() => {
  const h = (window as any).__postsList_handleProfileUpdated
  if (h) window.removeEventListener('profileUpdated', h as EventListener)
})
</script>

<template>
  <div class="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.92),_rgba(247,247,250,0.96)_32%,_#f2f2f7_70%),linear-gradient(180deg,_#f5f5f9_0%,_#ffffff_22%,_#ffffff_100%)] text-[#15152d]">
    <Header />

    <main class="mx-auto w-[min(1200px,calc(100%-32px))] max-[768px]:w-[min(100%-20px,100%)] min-h-[calc(100vh-280px)] py-10 font-khmer">
      <section class="px-2 sm:px-0">
        <div class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p class="text-sm font-semibold uppercase tracking-[0.28em] text-[#0f5e66]">
              {{ languageStore.t('savedListings') }}
            </p>
            <h1 class="mt-2 text-3xl font-black text-slate-900 sm:text-4xl">
              {{ languageStore.t('browseSavedPosts') }}
            </h1>
          </div>

          <router-link
            to="/posts/create"
            class="inline-flex items-center justify-center rounded-full bg-[#FF8C00] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600"
          >{{ languageStore.t('createPost') }}
          </router-link>
        </div>

        <div
          class="mb-6 flex items-center justify-between rounded-2xl border border-white/70 bg-white/80 px-4 py-3 shadow-sm backdrop-blur"
        >
          <p class="text-sm text-slate-600">
            <span class="font-semibold text-slate-900">{{ total }}</span>
              {{ languageStore.t('postsSaved') }}
          </p>
          <button
            type="button"
            class="inline-flex items-center justify-center rounded-full bg-[#FF8C00] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600"
            @click="loadPosts">
              {{ languageStore.t('refresh') }}
          </button>
        </div>

        <div
          v-if="isLoading"
          class="rounded-3xl border border-dashed border-slate-300 bg-white/70 p-10 text-center text-slate-500"
        >
          {{ languageStore.t('loadingPosts') }}
        </div>

        <div
          v-else-if="errorMessage"
          class="rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-700"
        >
          {{ errorMessage }}
        </div>

        <div
          v-else-if="!hasPosts"
          class="rounded-3xl border border-dashed border-slate-300 bg-white/70 p-10 text-center"
        >
          <p class="text-lg font-semibold text-slate-900">{{ languageStore.t('noSavedPostsYet') }}</p>
          <p class="mt-2 text-sm text-slate-600">
            {{ languageStore.t('createFirstListing') }}
          </p>
        </div>

        <div v-else class="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          <article
            v-for="post in visiblePosts"
            :key="post._id"
            class="overflow-hidden rounded-3xl border border-white/80 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)]"
          >
            <router-link :to="detailPath(post._id)" class="block aspect-[4/3] bg-slate-100">
              <img
                v-if="post.images?.[0]"
                :src="imageUrl(post.images[0])"
                :alt="post.title"
                class="h-full w-full object-cover"
              />
              <div v-else class="flex h-full items-center justify-center text-5xl text-slate-300">
                📷
              </div>
            </router-link>

            <div class="space-y-4 p-5">
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0 flex-1">
                  <h2 class="text-lg font-bold text-slate-900 truncate">
                    <router-link :to="detailPath(post._id)" class="transition hover:text-[#0f5e66]">
                      {{ post.title }}
                    </router-link>
                  </h2>
                  <p class="mt-1 text-sm text-slate-500 truncate">{{ post.category }} · {{ post.location }}</p>
                </div>
                <span
                  class="shrink-0 rounded-full bg-[#1A174A] px-3 py-1 text-xs font-semibold text-[#FF8C00]"
                >
                  {{ formatType(post.type) }}
                </span>
              </div>

              <p class="line-clamp-3 text-sm leading-6 text-slate-600">
                {{ post.description }}
              </p>

              <div class="flex flex-wrap gap-2 text-xs">
                <span class="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">
                  {{ formatCondition(post.condition) }}
                </span>
                <span class="rounded-full bg-emerald-50 px-3 py-1 font-semibold text-emerald-700">
                  {{ formatPrice(post) }}
                </span>
                <span
                  v-if="post.exchangeFor"
                  class="rounded-full bg-indigo-50 px-3 py-1 font-medium text-indigo-700"
                >
                  {{ languageStore.t('wants') }} {{ post.exchangeFor }}
                </span>
              </div>

              <div class="flex gap-2 border-t border-slate-100 pt-4">
                <router-link
                  v-if="canManagePost(post)"
                  :to="editPath(post._id)"
                  class="flex-1 rounded-lg bg-[#1A174A] px-3 py-2 text-center text-sm font-medium text-[#FF8C00] transition hover:bg-[#221f5a]"
                >
                  {{ languageStore.t('edit') }}
                </router-link>
                <button
                  v-if="canManagePost(post)"
                  type="button"
                  class="flex-1 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-red-700"
                  @click="deletePost(post._id, post.title)"
                >
                  {{ languageStore.t('delete') }}
                </button>
              </div>
            </div>
          </article>
        </div>
      </section>
    </main>
    <Footer />
  </div>
</template>
