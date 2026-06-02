<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import Footer from '@/components/layout/Footer.vue'
import Header from '@/components/layout/Header.vue'
import MaterialDetailGallery from '@/components/materialDetail/MaterialDetailGallery.vue'
import MaterialDetailSellerCard from '@/components/materialDetail/MaterialDetailSellerCard.vue'
import MaterialMap from '@/components/materialDetail/MaterialMap.vue'
import { defaultMaterials, type MaterialItem } from '@/data/materials'
import { useAuthStore } from '@/stores/auth'
import { useLanguageStore } from '@/stores/language'

type PreviewPost = MaterialItem & {
  condition?: 'New' | 'Like New' | 'Good' | 'Fair' | 'Used'
  exchangeFor?: string
  lat?: number
  lng?: number
}

const router = useRouter()
const languageStore = useLanguageStore()
const authStore = useAuthStore()
const activeTab = ref<'description' | 'specifications'>('description')
const hasDraft = ref(true)
const draftPhone = ref('')
const draftEmail = ref('')

function goBackToCreatePost() {
  const draftForCreate = {
    type: previewPost.value.type === 'Borrow' ? 'Lend' : previewPost.value.type,
    title: previewPost.value.title || '',
    description: previewPost.value.description || '',
    category: previewPost.value.category === 'Others' ? 'Other' : (previewPost.value.category || ''),
    condition: previewPost.value.condition || 'New',
    price: previewPost.value.price || '',
    exchangeFor: previewPost.value.exchangeFor || '',
    phone: draftPhone.value,
    email: draftEmail.value,
    location: previewPost.value.location || '',
    lat: previewPost.value.lat,
    lng: previewPost.value.lng,
    images: Array.isArray(previewPost.value.images) ? previewPost.value.images : [],
  }

  sessionStorage.setItem('create-post-draft', JSON.stringify(draftForCreate))
  void router.push('/posts/create')
}

const baseMaterial: MaterialItem =
  defaultMaterials[0] ?? {
    id: 'preview',
    title: languageStore.t('productTitle'),
    price: '0',
    location: 'Phnom Penh',
    type: 'Sell',
    tone: 'orange',
    images: [],
  }

const previewPost = ref<PreviewPost>({
  ...baseMaterial,
  condition: baseMaterial.condition ?? 'Used',
  exchangeFor: baseMaterial.exchangeFor,
})

function loadDraftPreview() {
  const rawDraft = sessionStorage.getItem('material-detail-preview-draft')
  if (!rawDraft) {
    hasDraft.value = false
    return
  }

  try {
    const parsed = JSON.parse(rawDraft) as PreviewPost & { phone?: string; email?: string }
    previewPost.value = {
      ...previewPost.value,
      ...parsed,
      title: parsed.title || languageStore.t('productTitle'),
      location: parsed.location || 'Phnom Penh',
      type: parsed.type || 'Sell',
      tone: parsed.tone || 'orange',
      images: Array.isArray(parsed.images) ? parsed.images : [],
      postedTime: parsed.postedTime || new Date().toISOString(),
      lat: parsed.lat !== undefined && parsed.lat !== null ? Number(parsed.lat) : undefined,
      lng: parsed.lng !== undefined && parsed.lng !== null ? Number(parsed.lng) : undefined,
    }
    draftPhone.value = parsed.phone ?? ''
    draftEmail.value = parsed.email ?? ''
  } catch {
    hasDraft.value = false
  }
}

onMounted(() => {
  loadDraftPreview()
})

function titleCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function formatPrice(post: PreviewPost) {
  if (post.type === 'Exchange') return languageStore.t('openToTrade')
  if (post.type === 'Borrow') return post.price ? `$${Number(post.price || 0).toFixed(2)}/wk` : languageStore.t('openToBorrow')
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

const galleryImages = computed(() => (previewPost.value.images as string[]) ?? [])

const photoBadge = computed(
  () => `${galleryImages.value.length} ${galleryImages.value.length === 1 ? languageStore.t('photo') : languageStore.t('photos')}`,
)

const statusLabel = computed(() =>
  previewPost.value.type === 'Sell'
    ? languageStore.t('available')
    : previewPost.value.type === 'Exchange'
    ? languageStore.t('exchange')
    : languageStore.t('borrow'),
)

const detailStats = computed(() => [
  { label: languageStore.t('condition'), value: titleCase(previewPost.value.condition ?? 'Used') },
  { label: languageStore.t('category'), value: previewPost.value.category || '-' },
  { label: languageStore.t('location'), value: previewPost.value.location },
  { label: languageStore.t('posted'), value: formatRelativeTime(previewPost.value.postedTime) },
])

const hasMapCoordinates = computed(
  () => typeof previewPost.value.lat === 'number' && typeof previewPost.value.lng === 'number',
)

const locationMapSrc = computed(() => {
  const location = String(previewPost.value.location ?? '').trim()
  if (!location) return ''
  return `https://www.google.com/maps?q=${encodeURIComponent(location)}&output=embed`
})

const previewSellerName = computed(() =>
  authStore.user?.name ||
  authStore.user?.username ||
  authStore.user?.email ||
  previewPost.value.seller ||
  languageStore.t('marketplaceSeller'),
)

const previewSellerRating = computed(() =>
  typeof authStore.user?.rating === 'number'
    ? authStore.user.rating
    : (previewPost.value.rating ?? 5),
)

const previewSellerAvatar = computed(() => authStore.user?.avatar || previewPost.value.avatar)

const previewContactInfo = computed(() => {
  const contact = [draftPhone.value.trim(), draftEmail.value.trim()].filter(Boolean).join(' | ')
  return contact || '-'
})

const previewBorrowWeeklyPrice = computed(() => {
  if (previewPost.value.type !== 'Borrow') return '-'
  return previewPost.value.price ? `$${Number(previewPost.value.price || 0).toFixed(2)}/wk` : '-'
})
</script>

<template>
  <div class="min-h-screen bg-white text-[#17173d]">
    <Header />

    <main class="mx-auto w-[min(1440px,calc(100%-32px))] px-0 pb-16 pt-8 sm:px-2 lg:px-4">
      <button
        type="button"
        @click="goBackToCreatePost"
        class="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[#999] transition hover:text-[#1b1748]"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-chevron-left"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M15 6l-6 6l6 6" /></svg>
        Back to Create Post
      </button>

      <div v-if="!hasDraft" class="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
        Preview draft is not available. Fill the form in Create Post and open preview again.
      </div>

      <section class="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
        <MaterialDetailGallery
          :title="previewPost.title"
          :images="galleryImages"
          :badge="photoBadge"
        />

        <div class="flex flex-col gap-6">
          <div class="inline-block w-fit rounded-full bg-[#31d07f] px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#0f3d25]">
            {{ statusLabel }}
          </div>

          <div>
            <h1 class="text-4xl font-black text-[#1b1748]">{{ previewPost.title }}</h1>
            <p class="mt-2 text-sm text-[#999]">{{ formatRelativeTime(previewPost.postedTime) }}</p>
          </div>

          <div class="text-4xl font-black text-[#1b1748]">{{ formatPrice(previewPost) }}</div>

          <div class="flex flex-wrap gap-2">
            <span class="rounded-full bg-[#f5f5f5] px-3 py-1.5 text-sm font-semibold text-[#1b1748]">
              Contact: {{ previewContactInfo }}
            </span>
            <span
              v-if="previewPost.type === 'Borrow'"
              class="rounded-full bg-[#eff9ff] px-3 py-1.5 text-sm font-semibold text-[#0b4f7a]"
            >
              Price / week: {{ previewBorrowWeeklyPrice }}
            </span>
            <span
              v-if="previewPost.type === 'Exchange' && previewPost.exchangeFor"
              class="rounded-full bg-[#fff3e7] px-3 py-1.5 text-sm font-semibold text-[#a35600]"
            >
              Exchange for: {{ previewPost.exchangeFor }}
            </span>
          </div>

          <div class="grid gap-3 sm:grid-cols-2">
            <div v-for="stat in detailStats" :key="stat.label" class="rounded-lg bg-[#f5f5f5] px-4 py-3">
              <p class="text-xs font-bold uppercase tracking-wider text-[#999]">{{ stat.label }}</p>
              <p class="mt-2 text-sm font-bold text-[#1b1748]">{{ stat.value }}</p>
            </div>
          </div>

          <MaterialDetailSellerCard
            :name="previewSellerName"
            :rating="previewSellerRating"
            :response-time="languageStore.t('usuallyRepliesIn1Hour')"
            :location="previewPost.location"
            :avatar="previewSellerAvatar"
          />
        </div>
      </section>

      <section class="mt-12">
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
              <h2 class="text-2xl font-black text-[#1b1748]">{{ previewPost.title }}</h2>
              <p class="mt-4 text-base leading-relaxed text-[#666]">{{ previewPost.description || '-' }}</p>
            </template>

            <template v-else>
              <h2 class="text-2xl font-black text-[#1b1748]">{{ languageStore.t('specifications') }}</h2>
              <ul class="mt-4 space-y-3 text-base leading-relaxed text-[#666]">
                <li class="flex justify-between border-b border-[#f0f0f0] pb-3">
                  <span class="font-semibold">{{ languageStore.t('category') }}:</span>
                  <span>{{ previewPost.category || '-' }}</span>
                </li>
                <li class="flex justify-between border-b border-[#f0f0f0] pb-3">
                  <span class="font-semibold">{{ languageStore.t('condition') }}:</span>
                  <span>{{ titleCase(previewPost.condition ?? 'Used') }}</span>
                </li>
                <li class="flex justify-between border-b border-[#f0f0f0] pb-3">
                  <span class="font-semibold">{{ languageStore.t('location') }}:</span>
                  <span>{{ previewPost.location }}</span>
                </li>
                <li class="flex justify-between border-b border-[#f0f0f0] pb-3">
                  <span class="font-semibold">Contact:</span>
                  <span>{{ previewContactInfo }}</span>
                </li>
                <li v-if="previewPost.type === 'Borrow'" class="flex justify-between border-b border-[#f0f0f0] pb-3">
                  <span class="font-semibold">Price / week:</span>
                  <span>{{ previewBorrowWeeklyPrice }}</span>
                </li>
                <li v-if="previewPost.exchangeFor" class="flex justify-between border-b border-[#f0f0f0] pb-3">
                  <span class="font-semibold">{{ languageStore.t('exchangeTarget') }}:</span>
                  <span>{{ previewPost.exchangeFor }}</span>
                </li>
                <li class="flex justify-between">
                  <span class="font-semibold">{{ languageStore.t('posted') }}:</span>
                  <span>{{ formatRelativeTime(previewPost.postedTime) }}</span>
                </li>
              </ul>
            </template>
          </div>

          <div class="rounded-lg bg-[#e8f4f7] p-4">
            <div class="flex items-center justify-between rounded-full bg-white px-3 py-2 text-xs font-semibold text-[#1f245e] shadow-sm mb-3">
              <span>{{ previewPost.location }}</span>
              <span>{{ formatRelativeTime(previewPost.postedTime) }}</span>
            </div>

            <div class="relative min-h-[300px] overflow-hidden rounded-lg bg-[#eef6f8]">
              <div v-if="hasMapCoordinates">
                <MaterialMap :lat="previewPost.lat" :lng="previewPost.lng" :location="previewPost.location" />
              </div>
              <div v-else-if="locationMapSrc" class="h-[300px]">
                <iframe
                  :src="locationMapSrc"
                  :title="`Map for ${previewPost.location}`"
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
    </main>

    <Footer />
  </div>
</template>
