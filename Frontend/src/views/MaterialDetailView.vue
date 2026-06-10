<script setup lang="ts">
import { computed, ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import api from '@/services/api'
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

const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
const apiError = ref<string | null>(null)

const post = ref<any>({
  id: 0,
  title: 'Loading...',
  description: '',
  images: [],
  type: 'Sell',
  price: '',
  contact: '',
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
    const { data } = await api.get(`/posts/${id}`)
    const p = data as any
    const uploadBase = apiBaseUrl.replace(/\/api\/?$/, '')
    let images = Array.isArray(p.images)
      ? p.images.map((f: string) => (/^https?:\/\//i.test(f) ? f : `${uploadBase}/uploads/${String(f).replace(/^\/+/, '')}?t=${Date.now()}`))
      : []
    if (images.length === 0) {
      images = ['https://via.placeholder.com/600x400?text=No+Image+Available']
    }

    post.value = {
      id: p._id,
      _id: p._id,
      title: p.title,
      description: p.description,
      images,
      type: p.type === 'sell' ? 'Sell' : p.type === 'exchange' ? 'Exchange' : 'Borrow',
      price: p.price,
      contact: p.contact,
      location: p.location,
      category: p.category,
      condition: p.condition === 'new' ? 'New' : 'Used',
      seller: p.listerName ?? 'Marketplace seller',
      avatar: p.listerAvatar ? normalizeAvatarUrl(p.listerAvatar) : undefined,
      postedTime: p.createdAt ?? p.updatedAt,
      exchangeFor: p.exchangeFor,
      lat: p.lat !== undefined && p.lat !== null ? Number(p.lat) : undefined,
      lng: p.lng !== undefined && p.lng !== null ? Number(p.lng) : undefined,
      rating: p.rating,
      ownerId: p.ownerId,
    }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (err) {
    // fallback to default
    post.value = defaultMaterials[0]
    apiError.value = 'Failed to load details from server. Showing demo data.'
    setTimeout(() => {
      apiError.value = null
    }, 6000)
  }
}

function normalizeAvatarUrl(avatar: string) {
  const uploadBase = apiBaseUrl.replace(/\/api\/?$/, '')
  if (/^https?:\/\//i.test(avatar)) {
    const separator = avatar.includes('?') ? '&' : '?'
    return `${avatar}${separator}t=${Date.now()}`
  }
  const clean = String(avatar).replace(/^\/+/, '')
  const basePath = clean.startsWith('uploads/') ? `${uploadBase}/${clean}` : `${uploadBase}/uploads/${clean}`
  return `${basePath}?t=${Date.now()}`
}

const handleProfileUpdated = (e: Event) => {
  try {
    const detail = (e as CustomEvent).detail as { userId?: string; avatar?: string; username?: string }
    if (!detail) return

    const { userId, avatar, username } = detail
    const ownedById = userId && String(post.value.ownerId) === String(userId)
    const ownedByName = username && String(post.value.seller || '').trim().toLowerCase() === String(username).trim().toLowerCase()
    if (ownedById || ownedByName) {
      post.value.seller = username || post.value.seller
      post.value.avatar = avatar ? normalizeAvatarUrl(avatar) : post.value.avatar
    }
  } catch {
    // ignore
  }
}

onMounted(() => {
  loadPostById(String(route.params.id))
  window.addEventListener('profileUpdated', handleProfileUpdated as EventListener)
})

watch(() => route.params.id, (id) => loadPostById(String(id)))

onBeforeUnmount(() => {
  window.removeEventListener('profileUpdated', handleProfileUpdated as EventListener)
})

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
      ? `/posts/admin/${currentPost.value._id}`
      : `/posts/${currentPost.value._id}`

    await api.delete(endpoint)
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
  if (post.type === 'Borrow') return post.price ? `$${Number(post.price || 0).toFixed(2)}/wk` : languageStore.t('openToBorrow')
  return `$${Number(post.price || 0).toFixed(2)}`
}

function formatBorrowWeeklyPrice(post: MaterialItem) {
  if (post.type !== 'Borrow') return '-'
  return post.price ? `$${Number(post.price || 0).toFixed(2)}/wk` : '-'
}

function extractContact(post: MaterialItem & { contact?: string }) {
  const explicitContact = String(post.contact ?? '').trim()
  if (explicitContact) return explicitContact

  const maybePhone = String((post as any).phone ?? '').trim()
  const maybeEmail = String((post as any).email ?? '').trim()
  const merged = [maybePhone, maybeEmail].filter(Boolean).join(' | ')
  return merged || '-'
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

const contactInfo = computed(() => extractContact(currentPost.value as MaterialItem & { contact?: string }))

// Checkout modal state
const showCheckoutModal = ref(false)
const paymentMethod = ref<'card' | 'qr'>('card')

const cardNo = ref('')
const cardExpiry = ref('')
const cardCvv = ref('')
const cardName = ref('')

const slipFile = ref<File | null>(null)
const slipPreview = ref('')

const itemPrice = computed(() => {
  return Number(String(currentPost.value?.price || '').replace(/[^0-9.]/g, '')) || 0
})

const categoryRates: Record<string, number> = {
  electronics: 0.10, // 10%
  vehicles: 0.10,    // 10%
  furniture: 0.08,   // 8%
  'home & garden': 0.08, // 8%
  sports: 0.07,      // 7%
  clothing: 0.05,    // 5%
  books: 0.05,       // 5%
  toys: 0.05,        // 5%
  default: 0.05      // 5%
}

const commissionRate = computed<number>(() => {
  const cat = String(currentPost.value?.category || '').toLowerCase()
  const rate = categoryRates[cat]
  return typeof rate === 'number' ? rate : 0.05
})

const platformFee = computed(() => {
  return Number((itemPrice.value * commissionRate.value).toFixed(2))
})

const securityDeposit = computed(() => {
  const typeStr = String(currentPost.value?.type || '').toLowerCase()
  if (typeStr === 'borrow' || typeStr === 'exchange') {
    return Number((itemPrice.value * 0.5).toFixed(2)) // 50% deposit
  }
  return 0
})

const totalAmount = computed(() => {
  return Number((itemPrice.value + platformFee.value + securityDeposit.value).toFixed(2))
})

async function handleTransactionClick() {
  if (!authStore.isAuthenticated) {
    void router.push({ name: 'login', query: { redirect: route.fullPath } })
    return
  }
  showCheckoutModal.value = true
}

function handleSlipUpload(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    slipFile.value = target.files[0]
    slipPreview.value = URL.createObjectURL(target.files[0])
  }
}

async function processCheckout() {
  if (paymentMethod.value === 'card') {
    if (!cardNo.value || !cardExpiry.value || !cardCvv.value || !cardName.value) {
      alert('Please fill in all credit card fields.')
      return
    }
    const cleanNo = cardNo.value.replace(/\s+/g, '')
    if (cleanNo.length < 15 || cleanNo.length > 16) {
      alert('Invalid credit card number format.')
      return
    }
  } else {
    if (!slipFile.value) {
      alert('Please upload your payment slip receipt.')
      return
    }
  }

  try {
    const payload = {
      name: currentPost.value.title,
      status: paymentMethod.value === 'card' ? 'Accepted' : 'Pending',
      buyerName: authStore.user?.username || authStore.user?.name || 'Buyer',
      sellerName: currentPost.value.seller || 'Seller',
      itemTitle: currentPost.value.title,
      amount: itemPrice.value,
      type: currentPost.value.type.toLowerCase(),
      transactionStatus: 'active',
      paymentMethod: paymentMethod.value,
      serviceFee: platformFee.value,
      deposit: securityDeposit.value,
      totalPaid: totalAmount.value,
      paymentSlip: slipPreview.value || undefined
    }

    await api.post('/trackitemuser', payload)

    showCheckoutModal.value = false
    void router.push({ name: 'trackItem' })
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message
      errorMessage.value = Array.isArray(message) ? message.join(', ') : (message ?? 'Failed to complete checkout payment.')
    } else {
      errorMessage.value = 'Failed to complete checkout payment.'
    }
  }
}
</script>

<template>
  <div class="min-h-screen bg-white text-[#17173d]">
    <Header />

    <!-- Toast notification for API connection error -->
    <Transition name="fade">
      <div v-if="apiError" class="fixed top-24 left-1/2 -translate-x-1/2 z-[9999] bg-[#dc2626] text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 font-semibold text-sm transition-all duration-300">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <span>{{ apiError }}</span>
        <button @click="apiError = null" class="ml-2 hover:opacity-80 transition-opacity">✕</button>
      </div>
    </Transition>

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

          <div class="flex flex-wrap gap-2">
            <span class="rounded-full bg-[#f5f5f5] px-3 py-1.5 text-sm font-semibold text-[#1b1748]">
              Contact: {{ contactInfo }}
            </span>
            <span
              v-if="currentPost.type === 'Borrow'"
              class="rounded-full bg-[#eff9ff] px-3 py-1.5 text-sm font-semibold text-[#0b4f7a]"
            >
              Price / week: {{ formatBorrowWeeklyPrice(currentPost) }}
            </span>
            <span
              v-if="currentPost.type === 'Exchange' && currentPost.exchangeFor"
              class="rounded-full bg-[#fff3e7] px-3 py-1.5 text-sm font-semibold text-[#a35600]"
            >
              Exchange for: {{ currentPost.exchangeFor }}
            </span>
          </div>

          <!-- Action Button (shows only the relevant action per type) -->
          <div>
            <template v-if="currentPost.type === 'Sell'">
              <button
                type="button"
                @click="handleTransactionClick"
                class="rounded-lg bg-[#1b1748] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#29255f]"
              >
                {{ actionButtonText }}
              </button>
            </template>

            <template v-else-if="currentPost.type === 'Exchange'">
              <button
                type="button"
                @click="handleTransactionClick"
                class="rounded-lg border-2 border-[#ff8c00] bg-[#fff6ef] px-4 py-3 text-sm font-bold text-[#ff8c00] transition hover:bg-orange-50"
              >
                {{ actionButtonText }}
              </button>
            </template>

            <template v-else>
              <button
                type="button"
                @click="handleTransactionClick"
                class="rounded-lg border-2 border-[#17173d]/20 bg-white px-4 py-3 text-sm font-bold text-[#17173d] transition hover:bg-gray-50"
              >
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
                <li class="flex justify-between border-b border-[#f0f0f0] pb-3">
                  <span class="font-semibold">Contact:</span>
                  <span>{{ contactInfo }}</span>
                </li>
                <li v-if="currentPost.type === 'Borrow'" class="flex justify-between border-b border-[#f0f0f0] pb-3">
                  <span class="font-semibold">Price / week:</span>
                  <span>{{ formatBorrowWeeklyPrice(currentPost) }}</span>
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

    <!-- Payment Checkout Modal -->
    <div v-if="showCheckoutModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div class="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl transition-all duration-300">
        <div class="mb-4 flex items-center justify-between border-b border-gray-100 pb-3">
          <h3 class="text-xl font-bold text-[#1b1748]">Secure Checkout</h3>
          <button @click="showCheckoutModal = false" class="text-gray-400 hover:text-gray-600">
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Platform Fee Notice -->
        <div class="mb-4 rounded-xl bg-amber-50/70 border border-amber-200/80 p-3.5 flex gap-2.5 text-xs text-amber-900">
          <span class="text-sm">ℹ️</span>
          <div>
            <strong class="font-bold">Platform Fee Notice:</strong> Commission rates are dynamically calculated based on the product category (10% for Electronics/Vehicles, 8% for Furniture/Home, 7% for Sports, and 5% for Toys/Clothing/Books).
          </div>
        </div>

        <!-- Price Breakdown -->
        <div class="mb-6 rounded-xl bg-gray-50 p-4">
          <h4 class="mb-2 text-sm font-semibold uppercase tracking-wider text-gray-500">Order Summary</h4>
          <div class="space-y-2 text-sm text-gray-600">
            <div class="flex justify-between">
              <span>{{ currentPost.title }}</span>
              <span>${{ itemPrice.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between">
              <span>Platform Commission Fee ({{ Math.round(commissionRate * 100) }}%)</span>
              <span>${{ platformFee.toFixed(2) }}</span>
            </div>
            <div v-if="securityDeposit > 0" class="flex justify-between">
              <span>Refundable Security Deposit (50%)</span>
              <span>${{ securityDeposit.toFixed(2) }}</span>
            </div>
            <div class="border-t border-gray-200 pt-2 flex justify-between font-bold text-gray-900 text-base">
              <span>Total Amount Due</span>
              <span>${{ totalAmount.toFixed(2) }}</span>
            </div>
          </div>
        </div>

        <!-- Payment Method Selection -->
        <div class="mb-6">
          <label class="block text-sm font-bold text-gray-700 mb-2">Select Payment Method</label>
          <div class="grid grid-cols-2 gap-3">
            <button
              type="button"
              @click="paymentMethod = 'card'"
              :class="['flex items-center justify-center gap-2 rounded-lg border-2 py-3 text-sm font-bold transition', 
                paymentMethod === 'card' ? 'border-[#ff8c00] bg-orange-50/50 text-[#ff8c00]' : 'border-gray-200 text-gray-600 hover:bg-gray-50']"
            >
              💳 Card
            </button>
            <button
              type="button"
              @click="paymentMethod = 'qr'"
              :class="['flex items-center justify-center gap-2 rounded-lg border-2 py-3 text-sm font-bold transition', 
                paymentMethod === 'qr' ? 'border-[#ff8c00] bg-orange-50/50 text-[#ff8c00]' : 'border-gray-200 text-gray-600 hover:bg-gray-50']"
            >
              📱 QR transfer
            </button>
          </div>
        </div>

        <!-- Payment Method Details Form -->
        <div class="mb-6">
          <!-- Credit Card Form -->
          <div v-if="paymentMethod === 'card'" class="space-y-3">
            <div>
              <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Cardholder Name</label>
              <input v-model="cardName" type="text" placeholder="John Doe" class="w-full rounded-lg border border-gray-200 p-2.5 text-sm outline-none focus:border-[#ff8c00]" />
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Card Number</label>
              <input v-model="cardNo" type="text" placeholder="xxxx xxxx xxxx xxxx" class="w-full rounded-lg border border-gray-200 p-2.5 text-sm outline-none focus:border-[#ff8c00]" />
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Expiry Date</label>
                <input v-model="cardExpiry" type="text" placeholder="MM/YY" class="w-full rounded-lg border border-gray-200 p-2.5 text-sm outline-none focus:border-[#ff8c00]" />
              </div>
              <div>
                <label class="block text-xs font-bold text-gray-500 uppercase mb-1">CVV / CVC</label>
                <input v-model="cardCvv" type="password" placeholder="123" class="w-full rounded-lg border border-gray-200 p-2.5 text-sm outline-none focus:border-[#ff8c00]" />
              </div>
            </div>
          </div>

          <!-- QR Transfer Form -->
          <div v-else class="space-y-4 text-center">
            <div class="mx-auto w-36 h-36 border-2 border-gray-200 rounded-lg p-2 bg-white flex items-center justify-center">
              <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=MaterialExchangePlatform" alt="Payment QR" class="w-full h-full object-contain" />
            </div>
            <p class="text-xs text-gray-500">Scan QR code above with your mobile banking app to pay platform fee, then upload the receipt/slip below.</p>
            <div>
              <input type="file" @change="handleSlipUpload" accept="image/*" class="hidden" id="slip-file-input" />
              <label for="slip-file-input" class="inline-flex items-center gap-2 rounded-lg bg-gray-100 hover:bg-gray-200 px-4 py-2 text-xs font-bold text-gray-700 cursor-pointer transition">
                📁 {{ slipFile ? 'Change Slip' : 'Upload Payment Slip' }}
              </label>
              <div v-if="slipPreview" class="mt-3 mx-auto w-24 h-24 border border-dashed rounded overflow-hidden">
                <img :src="slipPreview" class="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </div>

        <!-- Checkout Action Buttons -->
        <div class="flex justify-end gap-3 border-t border-gray-100 pt-4">
          <button
            type="button"
            class="rounded-lg bg-gray-100 px-5 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-200"
            @click="showCheckoutModal = false"
          >
            Cancel
          </button>
          <button
            type="button"
            class="rounded-lg bg-[#1b1748] px-6 py-2.5 text-sm font-bold text-white transition hover:bg-[#29255f]"
            @click="processCheckout"
          >
            {{ paymentMethod === 'card' ? 'Pay & Confirm' : 'Submit for Verification' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Fade animation for toast */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translate(-50%, -20px);
}
</style>
