<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import Footer from '@/components/layout/Footer.vue'
import Header from '@/components/layout/Header.vue'
import MaterialDetailGallery from '@/components/materialDetail/MaterialDetailGallery.vue'
import MaterialDetailSellerCard from '@/components/materialDetail/MaterialDetailSellerCard.vue'
import RelatedMaterialCard from '@/components/materialDetail/MaterialCard.vue'
import { defaultMaterials, getMaterialById, type MaterialItem, type MaterialTone } from '@/data/materials'
import MaterialMap from '@/components/materialDetail/MaterialMap.vue'
import { useLanguageStore } from '@/stores/language'

const route = useRoute()
const router = useRouter()
const languageStore = useLanguageStore()
const activeTab = ref<'description' | 'specifications'>('description')

// Scroll to top when route ID changes
watch(
  () => route.params.id,
  () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  },
)

const currentPost = computed<MaterialItem>(() => {
  const id = Number(route.params.id)
  return (Number.isFinite(id) ? getMaterialById(id) : undefined) ?? defaultMaterials[0]!
})


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

const galleryImages = computed(() => currentPost.value.images ?? [])

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

          <!-- Title & Subtitle -->
          <div>
            <h1 class="text-4xl font-black text-[#1b1748]">{{ currentPost.title }}</h1>
            <p class="mt-2 text-sm text-[#999]">{{ formatRelativeTime(currentPost.postedTime) }}</p>
          </div>

          <!-- Price -->
          <div class="text-4xl font-black text-[#1b1748]">{{ formatPrice(currentPost) }}</div>

          <!-- Action Button (shows only the relevant action per category) -->
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
            :name="currentPost.seller ?? 'Marketplace seller'"
            :rating="currentPost.rating ?? 4.9"
            response-time="Usually replies in 1 hour"
            :location="currentPost.location"
            :avatar="currentPost.avatar"
          />
        </div>
      </section>

      <section class="mt-12">
        <!-- Tabs Section -->
        <div class="border-b border-[#e5e5e5] pb-4">
          <div class="flex gap-6 text-sm font-semibold">
            <button
              type="button"
              class="pb-3 transition"
              :class="activeTab === 'description' ? 'border-b-2 border-[#1b1748] text-[#1b1748]' : 'text-[#999] hover:text-[#666]'"
              @click="activeTab = 'description'"
            >
              Description
            </button>
            <button
              type="button"
              class="pb-3 transition"
              :class="activeTab === 'specifications' ? 'border-b-2 border-[#1b1748] text-[#1b1748]' : 'text-[#999] hover:text-[#666]'"
              @click="activeTab = 'specifications'"
            >
                {{ languageStore.t('specifications') }}
        <div class="mt-6 grid gap-8 lg:grid-cols-3">
          <div class="lg:col-span-2">
            <template v-if="activeTab === 'description'">
              <h2 class="text-2xl font-black text-[#1b1748]">{{ currentPost.title }}</h2>
              <p class="mt-4 text-base leading-relaxed text-[#666]">
                {{ currentPost.description }}
              </p>
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
              <div v-if="typeof currentPost.lat === 'number' && typeof currentPost.lng === 'number'">
                <MaterialMap :lat="currentPost.lat" :lng="currentPost.lng" :location="currentPost.location" />
              </div>
              <div v-else class="flex h-[300px] items-center justify-center">
                <div class="text-[#6b7280] text-lg font-semibold">{{ languageStore.t('mapUnavailable') }}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Related Listings Section -->
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