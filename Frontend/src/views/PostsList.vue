<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import axios from 'axios'

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
  createdAt?: string
}

type PostsResponse = {
  total: number
  page: number
  posts: Post[]
}

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
const posts = ref<Post[]>([])
const total = ref(0)
const isLoading = ref(false)
const errorMessage = ref('')

const hasPosts = computed(() => posts.value.length > 0)

function formatType(type: Post['type']) {
  return type.charAt(0).toUpperCase() + type.slice(1)
}

function formatCondition(condition: Post['condition']) {
  return condition.charAt(0).toUpperCase() + condition.slice(1)
}

function formatPrice(post: Post) {
  if (post.type === 'exchange') return 'Open to trade'
  const suffix = post.type === 'lend' ? '/day' : ''
  return `$${Number(post.price || 0).toFixed(2)}${suffix}`
}

function imageUrl(filename: string) {
  return `${apiBaseUrl}/uploads/${filename}`
}

async function loadPosts() {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const { data } = await axios.get<PostsResponse>(`${apiBaseUrl}/posts`)
    posts.value = data.posts ?? []
    total.value = data.total ?? posts.value.length
  } catch (error: any) {
    errorMessage.value = error?.response?.data?.message ?? 'Error loading saved posts.'
  } finally {
    isLoading.value = false
  }
}

async function deletePost(postId: string, title: string) {
  if (!confirm(`Delete "${title}"? This action cannot be undone.`)) {
    return
  }

  try {
    await axios.delete(`${apiBaseUrl}/posts/${postId}`)
    posts.value = posts.value.filter((p) => p._id !== postId)
    total.value = Math.max(0, total.value - 1)
  } catch (error: any) {
    const msg = error?.response?.data?.message ?? 'Failed to delete post.'
    alert(msg)
  }
}

onMounted(loadPosts)
</script>

<template>
  <main class="min-h-screen bg-gradient-to-b from-[#f7fdfd] via-white to-[#eef6f9]">
    <section class="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p class="text-sm font-semibold uppercase tracking-[0.28em] text-[#0f5e66]">
            <!-- {{ languageStore.t('savedListings') }} -->Saved listings
          </p>
          <h1 class="mt-2 text-3xl font-black text-slate-900 sm:text-4xl">
            <!-- {{ languageStore.t('browseSavedPosts') }} -->Browse saved posts
          </h1>
        </div>

        <router-link
          to="/create"
          class="inline-flex items-center justify-center rounded-full bg-[#FF8C00] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600"
        >
          <!-- {{ languageStore.t('createPost') }} -->Create post
        </router-link>
      </div>

      <div
        class="mb-6 flex items-center justify-between rounded-2xl border border-white/70 bg-white/80 px-4 py-3 shadow-sm backdrop-blur"
      >
        <p class="text-sm text-slate-600">
          <span class="font-semibold text-slate-900">{{ total }}</span>
          <!-- {{ languageStore.t('postsSaved') }} -->posts saved
        </p>
        <button
          type="button"
          class="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          @click="loadPosts"
        >
          <!-- {{ languageStore.t('refresh') }} -->Refresh
        </button>
      </div>

      <div
        v-if="isLoading"
        class="rounded-3xl border border-dashed border-slate-300 bg-white/70 p-10 text-center text-slate-500"
      >
        <!-- {{ languageStore.t('loadingPosts') }} -->Loading posts...
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
        <p class="text-lg font-semibold text-slate-900"><!-- {{ languageStore.t('noSavedPostsYet') }} -->No saved posts yet</p>
        <p class="mt-2 text-sm text-slate-600">
          <!-- {{ languageStore.t('createFirstListing') }} -->Create your first listing
        </p>
      </div>

      <div v-else class="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        <article
          v-for="post in posts"
          :key="post._id"
          class="overflow-hidden rounded-3xl border border-white/80 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)]"
        >
          <div class="aspect-[4/3] bg-slate-100">
            <img
              v-if="post.images?.[0]"
              :src="imageUrl(post.images[0])"
              :alt="post.title"
              class="h-full w-full object-cover"
            />
            <div v-else class="flex h-full items-center justify-center text-5xl text-slate-300">
              📷
            </div>
          </div>

          <div class="space-y-4 p-5">
            <div class="flex items-start justify-between gap-3">
              <div>
                <h2 class="text-lg font-bold text-slate-900">{{ post.title }}</h2>
                <p class="mt-1 text-sm text-slate-500">{{ post.category }} · {{ post.location }}</p>
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
                <!-- {{ languageStore.t('wants') }} -->Wants {{ post.exchangeFor }}
              </span>
            </div>

            <div class="flex gap-2 border-t border-slate-100 pt-4">
              <router-link
                :to="`/edit/${post._id}`"
                class="flex-1 rounded-lg bg-[#1A174A] px-3 py-2 text-center text-sm font-medium text-[#FF8C00] transition hover:bg-[#221f5a]"
              >
                <!-- {{ languageStore.t('edit') }} -->Edit
              </router-link>
              <button
                type="button"
                class="flex-1 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-red-700"
                @click="deletePost(post._id, post.title)"
              >
                <!-- {{ languageStore.t('delete') }} -->Delete
              </button>
            </div>
          </div>
        </article>
      </div>
    </section>
  </main>
</template>
