<script setup lang="ts">
import { getToken } from '@/utils/tokenStorage'
import { computed, ref, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

import Footer from '@/components/layout/Footer.vue'
import Header from '@/components/layout/Header.vue'
import MaterialDetailGallery from '@/components/materialDetail/MaterialDetailGallery.vue'
import MaterialDetailSellerCard from '@/components/materialDetail/MaterialDetailSellerCard.vue'
import RelatedMaterialCard from '@/components/materialDetail/MaterialCard.vue'
import { defaultMaterials, type MaterialItem, type MaterialTone } from '@/data/materials'
import MaterialMap from '@/components/materialDetail/MaterialMap.vue'
import { useLanguageStore } from '@/stores/language'

const route = useRoute()
const router = useRouter()
const languageStore = useLanguageStore()
const authStore = useAuthStore()
const activeTab = ref<'description' | 'specifications'>('description')
const errorMessage = ref('')
const showDeleteModal = ref(false)

// Scroll to top when route ID changes
watch(
  () => route.params.id,
  () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  },
)

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

const post = ref<any>({
  id: 0,
  title: 'Loading...',
  description: '',
  images: [],
  type: 'Sell',
  price: '',
  location: '',
  condition: 'Used',
})

async function loadPostById(id: string | number | undefined) {
  if (!id) return

  // If the ID is clearly not a MongoDB ObjectID (e.g., our mock data IDs like '1', '2'),
  // just fall back to local mock data immediately to avoid backend 400 errors.
  if (String(id).length !== 24) {
    const mockPost = defaultMaterials.find((m) => String(m.id) === String(id))
    post.value = mockPost || defaultMaterials[0]
    return
  }

  try {
    const { data } = await axios.get(`${apiBaseUrl}/posts/${id}`)
    const p = data as any
    const uploadBase = apiBaseUrl.replace(/\/api\/?$/, '')
    const images = Array.isArray(p.images)
      ? p.images.map((f: string) => (/^https?:\/\//i.test(f) ? f : `${uploadBase}/uploads/${String(f).replace(/^\/+/, '')}`))
      : []

    post.value = {
      id: p._id,
      _id: p._id,
      title: p.title,
      description: p.description,
      images,
      type: p.type === 'sell' ? 'Sell' : p.type === 'exchange' ? 'Exchange' : 'Borrow',
      price: p.price,
      location: p.location,
      category: p.category,
      condition: p.condition === 'new' ? 'New' : 'Used',
      seller: p.listerName ?? 'Marketplace seller',
      avatar: p.listerAvatar,
      postedTime: p.createdAt ?? p.updatedAt,
      exchangeFor: p.exchangeFor,
      lat: p.lat,
      lng: p.lng,
      rating: p.rating,
      ownerId: p.ownerId,
    }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (err) {
    // fallback to default
    post.value = defaultMaterials[0]
  }
}

onMounted(() => loadPostById(String(route.params.id)))

watch(() => route.params.id, (id) => loadPostById(String(id)))

const currentPost = computed(() => post.value as MaterialItem & { _id?: string; ownerId?: string })

// ── Auth / ownership ────────────────────────────────────────────────────────
const isAdmin = computed(() => authStore.user?.role === 'admin')
const isOwner = computed(() => Boolean(currentPost.value?.ownerId && authStore.user?.id === currentPost.value.ownerId))
// Only the original lister (owner) may edit/delete their post.
const canDelete = computed(() => Boolean(currentPost.value && authStore.isAuthenticated && isOwner.value))

// ── Actions ─────────────────────────────────────────────────────────────────
function openDeleteModal() {
  showDeleteModal.value = true
}

function closeDeleteModal() {
  showDeleteModal.value = false
}

async function confirmDeletePost() {
  if (!currentPost.value?._id) return

  try {
    const endpoint = isAdmin.value
      ? `${apiBaseUrl}/posts/admin/${currentPost.value._id}`
      : `${apiBaseUrl}/posts/${currentPost.value._id}`

    await axios.delete(endpoint, {
      headers: {
        Authorization: `Bearer ${getToken() ?? ''}`,
      },
    })
    showDeleteModal.value = false
    await router.push('/posts')
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message
      errorMessage.value = Array.isArray(message) ? message.join(', ') : (message ?? 'Failed to delete post.')
    } else {
      errorMessage.value = 'Failed to delete post.'
    }
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function titleCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function formatPrice(post: MaterialItem) {
  if (post.type === 'Exchange') return languageStore.t('openToTrade')
  if (post.type === 'Borrow') return post.price ? `$${Number(post.price || 0).toFixed(2)}${languageStore.t('perDay')}` : languageStore.t('openToBorrow')
  return `$${Number(post.price || 0).toFixed(2)}`
}

function formatRelativeTime(dateString?: string) {
  if (!dateString) return languageStore.t('justNow')

  const createdAt = new Date(dateString).getTime()
  const difference = Date.now() - createdAt
  const minutes = Math.floor(difference / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (minutes < 1) return languageStore.t('justNow')
  if (minutes < 60) return `${minutes} ${languageStore.t('minutesAgo')}`
  if (hours < 24) return `${hours} ${languageStore.t('hoursAgo')}`
  return `${days} ${languageStore.t('daysAgo')}`
}

const galleryImages = computed(() => (currentPost.value.images as string[]) ?? [])

const hasMapCoordinates = computed(
  () => typeof currentPost.value.lat === 'number' && typeof currentPost.value.lng === 'number',
)

const locationMapSrc = computed(() => {
  const location = String(currentPost.value.location ?? '').trim()
  if (!location) return ''
  return `https://www.google.com/maps?q=${encodeURIComponent(location)}&output=embed`
})

const photoBadge = computed(
  () => `${galleryImages.value.length} ${galleryImages.value.length === 1 ? languageStore.t('photo') : languageStore.t('photos')}`,
)

const statusLabel = computed(() =>
  currentPost.value.type === 'Sell'
    ? languageStore.t('available')
    : currentPost.value.type === 'Exchange'
    ? languageStore.t('exchange')
    : languageStore.t('borrow'),
)

const actionButtonText = computed(() =>
  currentPost.value.type === 'Sell'
    ? languageStore.t('buyNow')
    : currentPost.value.type === 'Exchange'
    ? languageStore.t('contactToExchange')
    : languageStore.t('contactToBorrow'),
)

const relatedCardItems = computed(() =>
  defaultMaterials
    .filter(post => post.id !== currentPost.value.id)
    .slice(0, 4)
    .map((post) => ({
      id: post.id,
      title: post.title,
      price: formatPrice(post),
      location: post.location,
      type: post.type,
      category: post.category,
      tone: post.tone as MaterialTone,
      seller: post.seller || languageStore.t('marketplaceSeller'),
      rating: post.rating ?? 4.9,
      avatar: post.avatar,
      images: post.images,
      postedTime: post.postedTime,
    })),
)

const detailStats = computed(() => [
  { label: languageStore.t('condition'), value: titleCase(currentPost.value.condition ?? 'Used') },
  { label: languageStore.t('category'), value: currentPost.value.category },
  { label: languageStore.t('location'), value: currentPost.value.location },
  { label: languageStore.t('posted'), value: formatRelativeTime(currentPost.value.postedTime) },
])
</script>

<template>
  <div class="min-h-screen bg-white text-[#17173d]">
    <Header />

    <main class="mx-auto w-[min(1440px,calc(100%-32px))] px-0 pb-16 pt-8 sm:px-2 lg:px-4">
      <!-- Back Button -->
      <button
        type="button"
        @click="router.back()"
        class="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[#999] transition hover:text-[#1b1748]"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-chevron-left"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M15 6l-6 6l6 6" /></svg>
        {{ languageStore.t('back') }}
      </button>

      <!-- Error banner -->
      <div v-if="errorMessage" class="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        {{ errorMessage }}
      </div>

      <section class="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
        <!-- Left: Image Gallery -->
        <MaterialDetailGallery
          :title="currentPost.title"
          :images="galleryImages"
          :badge="photoBadge"
          :subtitle="languageStore.t('fastPickupAndExchangeReady')"
        />

        <!-- Right: Product Details -->
        <div class="flex flex-col gap-6">
          <!-- Status Badge -->
          <div class="inline-block w-fit rounded-full bg-[#31d07f] px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#0f3d25]">
            {{ statusLabel }}
          </div>

          <!-- Title & Subtitle -->
          <div>
            <h1 class="text-4xl font-black text-[#1b1748]">{{ currentPost.title }}</h1>
            <p class="mt-2 text-sm text-[#999]">{{ formatRelativeTime(currentPost.postedTime) }}</p>
          </div>

          <!-- Price -->
          <div class="text-4xl font-black text-[#1b1748]">{{ formatPrice(currentPost) }}</div>

          <!-- Action Button (shows only the relevant action per type) -->
          <div>
            <template v-if="currentPost.type === 'Sell'">
              <button type="button" class="rounded-lg bg-[#1b1748] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#29255f]">
                {{ actionButtonText }}
              </button>
            </template>

            <template v-else-if="currentPost.type === 'Exchange'">
              <button type="button" class="rounded-lg border-2 border-[#ff8c00] bg-[#fff6ef] px-4 py-3 text-sm font-bold text-[#ff8c00] transition hover:bg-orange-50">
                {{ actionButtonText }}
              </button>
            </template>

            <template v-else>
              <button type="button" class="rounded-lg border-2 border-[#17173d]/20 bg-white px-4 py-3 text-sm font-bold text-[#17173d] transition hover:bg-gray-50">
                {{ actionButtonText }}
              </button>
            </template>
          </div>

          <!-- Stats Grid (2x2) -->
          <div class="grid gap-3 sm:grid-cols-2">
            <div v-for="stat in detailStats" :key="stat.label" class="rounded-lg bg-[#f5f5f5] px-4 py-3">
              <p class="text-xs font-bold uppercase tracking-wider text-[#999]">{{ stat.label }}</p>
              <p class="mt-2 text-sm font-bold text-[#1b1748]">{{ stat.value }}</p>
            </div>
          </div>

          <!-- Seller Card -->
          <MaterialDetailSellerCard
            :seller-id="currentPost.ownerId"
            :name="currentPost.seller ?? languageStore.t('marketplaceSeller')"
            :rating="currentPost.rating ?? 4.9"
            :response-time="languageStore.t('usuallyRepliesIn1Hour')"
            :location="currentPost.location"
            :avatar="currentPost.avatar"
          />

          <!-- Owner / Admin actions -->
          <div v-if="canDelete" class="flex flex-wrap gap-3 border-t border-[#e5e5e5] pt-5">
            <router-link
              :to="`/posts/${currentPost._id}/edit`"
              class="rounded-lg bg-[#1b1748] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#29255f]"
            >
              Edit post
            </router-link>
            <button
              type="button"
              class="rounded-lg border border-red-200 bg-red-50 px-5 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-100"
              @click="openDeleteModal"
            >
              Delete post
            </button>
          </div>
        </div>
      </section>

      <section class="mt-12">
        <!-- Tabs -->
        <div class="border-b border-[#e5e5e5] pb-4">
          <div class="flex gap-6 text-sm font-semibold">
            <button
              type="button"
              class="pb-3 transition"
              :class="activeTab === 'description' ? 'border-b-2 border-[#1b1748] text-[#1b1748]' : 'text-[#999] hover:text-[#666]'"
              @click="activeTab = 'description'"
            >
              {{ languageStore.t('description') }}
            </button>
            <button
              type="button"
              class="pb-3 transition"
              :class="activeTab === 'specifications' ? 'border-b-2 border-[#1b1748] text-[#1b1748]' : 'text-[#999] hover:text-[#666]'"
              @click="activeTab = 'specifications'"
            >
              {{ languageStore.t('specifications') }}
            </button>
          </div>
        </div>

        <div class="mt-6 grid gap-8 lg:grid-cols-3">
          <div class="lg:col-span-2">
            <template v-if="activeTab === 'description'">
              <h2 class="text-2xl font-black text-[#1b1748]">{{ currentPost.title }}</h2>
              <p class="mt-4 text-base leading-relaxed text-[#666]">{{ currentPost.description }}</p>
            </template>

            <template v-else-if="activeTab === 'specifications'">
              <h2 class="text-2xl font-black text-[#1b1748]">{{ languageStore.t('specifications') }}</h2>
              <ul class="mt-4 space-y-3 text-base leading-relaxed text-[#666]">
                <li class="flex justify-between border-b border-[#f0f0f0] pb-3">
                  <span class="font-semibold">{{ languageStore.t('category') }}:</span>
                  <span>{{ currentPost.category }}</span>
                </li>
                <li class="flex justify-between border-b border-[#f0f0f0] pb-3">
                  <span class="font-semibold">{{ languageStore.t('condition') }}:</span>
                  <span>{{ titleCase(currentPost.condition ?? 'Used') }}</span>
                </li>
                <li class="flex justify-between border-b border-[#f0f0f0] pb-3">
                  <span class="font-semibold">{{ languageStore.t('location') }}:</span>
                  <span>{{ currentPost.location }}</span>
                </li>
                <li v-if="currentPost.exchangeFor" class="flex justify-between border-b border-[#f0f0f0] pb-3">
                  <span class="font-semibold">{{ languageStore.t('exchangeTarget') }}:</span>
                  <span>{{ currentPost.exchangeFor }}</span>
                </li>
                <li class="flex justify-between">
                  <span class="font-semibold">{{ languageStore.t('posted') }}:</span>
                  <span>{{ formatRelativeTime(currentPost.postedTime) }}</span>
                </li>
              </ul>
            </template>
          </div>

          <!-- Location Map -->
          <div class="rounded-lg bg-[#e8f4f7] p-4">
            <div class="flex items-center justify-between rounded-full bg-white px-3 py-2 text-xs font-semibold text-[#1f245e] shadow-sm mb-3">
              <span>{{ currentPost.location }}</span>
              <span>{{ formatRelativeTime(currentPost.postedTime) }}</span>
            </div>

            <div class="relative min-h-[300px] overflow-hidden rounded-lg bg-[#eef6f8]">
              <div v-if="hasMapCoordinates">
                <MaterialMap :lat="currentPost.lat" :lng="currentPost.lng" :location="currentPost.location" />
              </div>
              <div v-else-if="locationMapSrc" class="h-[300px]">
                <iframe
                  :src="locationMapSrc"
                  :title="`Map for ${currentPost.location}`"
                  class="h-full w-full rounded-lg border-0"
                  loading="lazy"
                  referrerpolicy="no-referrer-when-downgrade"
                />
              </div>
              <div v-else class="flex h-[300px] items-center justify-center">
                <div class="text-lg font-semibold text-[#6b7280]">
                  {{ languageStore.t('mapUnavailable') }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div v-if="showDeleteModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
        <div class="w-full max-w-md rounded-3xl bg-white p-6 text-center shadow-[0_25px_70px_rgba(15,23,42,0.25)]">
          <h3 class="text-2xl font-bold text-[#1e1b4b]">Confirm Delete</h3>

          <p class="mt-3 text-sm leading-6 text-slate-600">
            Are you sure you want to delete "{{ currentPost.title }}"? This action cannot be undone.
          </p>

          <div class="mt-6 flex justify-center gap-3">
            <button
              type="button"
              class="rounded-lg bg-slate-200 px-5 py-2.5 font-semibold text-slate-700 transition hover:bg-slate-300"
              @click="closeDeleteModal"
            >
              Cancel
            </button>

            <button
              type="button"
              class="rounded-lg bg-[#1e1b4b] px-5 py-2.5 font-semibold text-white transition hover:bg-[#2a2566]"
              @click="confirmDeletePost"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      <!-- Related Listings -->
      <section class="mt-16">
        <div class="mb-8 flex items-center justify-between">
          <div>
            <p class="text-xs font-semibold uppercase tracking-widest text-[#999]">{{ languageStore.t('relatedListings') }}</p>
            <h2 class="mt-2 text-3xl font-black text-[#1b1748]">{{ languageStore.t('moreMaterialsYouMayLike') }}</h2>
          </div>
          <a href="#" class="text-sm font-semibold text-[#ff8c00] no-underline transition hover:text-[#e67e00]">
            {{ languageStore.t('viewCategory') }} →
          </a>
        </div>

        <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <RelatedMaterialCard
            v-for="card in relatedCardItems"
            :key="card.id"
            :item="card"
          />
        </div>
      </section>
    </main>

    <Footer />
  </div>
</template>
