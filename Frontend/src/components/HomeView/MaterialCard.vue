<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useLanguageStore } from '@/stores/language'

type Tone = 'gold' | 'orange' | 'rose'

const props = defineProps<{
  item: {
    title: string
    price: string
    location: string
    /** transaction type */
    type: 'Sell' | 'Exchange' | 'Borrow'
    /** product category */
    category?: string
    tone: Tone
    seller?: string
    rating?: number
    avatar?: string
    ownerId?: string
    images?: string[]
    postedTime?: string
  }
}>()

const languageStore = useLanguageStore()
const authStore = useAuthStore()
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

const getAvatarUrl = (avatar?: string, name = 'User') => {
  const normalized = String(avatar || '').trim()
  if (!normalized || ['null', 'undefined'].includes(normalized.toLowerCase())) {
    return '/userprofileImage/avatar.png'
  }

  if (/^https?:\/\//i.test(normalized)) {
    // Add cache buster for http URLs
    const separator = normalized.includes('?') ? '&' : '?'
    return `${normalized}${separator}t=${Date.now()}`
  }

  const uploadBase = apiBaseUrl.replace(/\/api\/?$/, '')
  const clean = normalized.replace(/^\/+/, '')
  const basePath = clean.startsWith('uploads/') ? `${uploadBase}/${clean}` : `${uploadBase}/uploads/${clean}`
  // Add cache buster
  return `${basePath}?t=${Date.now()}`
}

const avatarUrl = computed(() => getAvatarUrl((isCurrentUserPost.value || isCurrentUserPostByName.value) ? authStore.user?.avatar : props.item.avatar))

const handleAvatarError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.onerror = null
  img.src = '/userprofileImage/avatar.png'
}

const isCurrentUserPost = computed(() => {
  const currentUser = authStore.user
  return currentUser != null && props.item.ownerId != null && String(currentUser.id) === String(props.item.ownerId)
})

const isCurrentUserPostByName = computed(() => {
  const currentUser = authStore.user
  if (!currentUser) return false
  const identifiers = [currentUser.username, currentUser.name]
    .filter(Boolean)
    .map((value) => String(value).trim().toLowerCase())
  const sellerName = String(props.item.seller || '').trim().toLowerCase()
  return sellerName.length > 0 && identifiers.includes(sellerName)
})

const displaySellerName = computed(() => {
  if ((isCurrentUserPost.value || isCurrentUserPostByName.value) && authStore.user) {
    return authStore.user.username || authStore.user.name || props.item.seller || 'Unknown'
  }
  return props.item.seller || 'Unknown'
})

const displaySellerAvatar = computed(() => {
  if ((isCurrentUserPost.value || isCurrentUserPostByName.value) && authStore.user?.avatar) {
    return authStore.user.avatar
  }
  return props.item.avatar
})

// function getBadgeLabel(category: string): string {
//   if (category === 'Sell') return languageStore.t('forSale')
//   if (category === 'Exchange') return languageStore.t('exchange')
//   if (category === 'Borrow') return languageStore.t('borrow')
//   return category
// }

function getTimeAgo(dateString: string | undefined): string {
  if (!dateString) return languageStore.t('justNow')

  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffSecs < 60) return languageStore.t('justNow')
  if (diffMins < 60) return `${diffMins}${languageStore.t('minutesAgo')}`
  if (diffHours < 24) return `${diffHours}${languageStore.t('hoursAgo')}`
  if (diffDays < 7) return `${diffDays}${languageStore.t('daysAgo')}`

  return date.toLocaleDateString()
}

function formatCardPrice(item: {
  type: 'Sell' | 'Exchange' | 'Borrow'
  price?: string | number
}): string {
  if (item.type === 'Exchange') return ''
  const raw = item.price == null ? '' : String(item.price)
  if (item.type === 'Borrow') return raw ? `$${Number(raw || 0).toFixed(2)}/wk` : ''
  // Sell
  if (!raw) return ''
  return raw.startsWith('$') ? raw : '$' + raw
}
</script>
 

<template>
  <div
    class="flex flex-col rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white w-[320px] h-[420px] border border-gray-300"
  >
    <!-- Top Section with Badge and Image -->
    <div class="relative bg-gray-100 p-6 h-[230px] flex items-center justify-center">
      <!-- For Sale Badge -->
      <div
        class="absolute top-3 left-3 text-white px-3 py-1 rounded-lg text-sm font-bold"
          :style="{
          backgroundColor:
            item.type === 'Sell'
              ? '#FF5A5A'
              : item.type === 'Exchange'
                ? '#FF8C00'
                : '#0B6F61',
        }"
      >
        {{ item.type === 'Sell' ? 'For sale' : item.type === 'Exchange' ? 'Exchange' : 'Borrow' }}
      </div>

      <!-- Product Image -->
      <img 
        :src="item.images?.[0] || 'https://via.placeholder.com/300?text=No+Image'" 
        class="h-full w-full object-contain"
        alt="Product"
      />
    </div>

    <!-- Bottom Section with Info -->
    <div class="bg-[#23216e] text-white p-4 flex flex-col flex-1">
      <!-- Title and Price -->
      <div class="flex justify-between items-start mb-2">
        <h3 class="text-lg font-bold leading-tight flex-1">{{ item.title }}</h3>
        <span
          class="ml-2 min-w-[72px] text-2xl font-bold text-right"
          :class="item.type === 'Sell' || item.type === 'Borrow' ? 'visible' : 'invisible'"
        >
          {{ formatCardPrice(item) }}
        </span>
      </div>

      <!-- Posted Time -->
      <div class="text-xs text-gray-400 mb-2">{{ languageStore.t('posted') }} {{ getTimeAgo(item.postedTime) }}</div>

      <!-- Location -->
      <div class="flex items-center gap-2 text-sm text-gray-300 mb-2">
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fill-rule="evenodd"
            d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
            clip-rule="evenodd"
          />
        </svg>
        {{ item.location }}
      </div>

      <!-- Divider -->
      <div class="border-t border-gray-600 my-2"></div>

      <!-- Seller Info -->
      <div class="mt-auto flex items-center justify-between">
        <div class="flex items-center gap-2">
          <!-- Avatar -->
          <div
            class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm overflow-hidden"
          >
            <img
              v-if="displaySellerAvatar"
              :src="avatarUrl"
              :alt="languageStore.t('sellerAlt')"
              class="w-full h-full object-cover"
              @error="handleAvatarError"
            />
            <span v-else>{{ displaySellerName?.[0]?.toUpperCase() || languageStore.t('unknownSeller') }}</span>
          </div>

          <!-- Seller Name -->
          <span class="text-sm font-medium">{{ displaySellerName }}</span>
        </div>

        <!-- Rating -->
        <div class="flex items-center gap-1">
          <span class="text-sm font-bold">{{ item.rating || '5.0' }}</span>
          <svg class="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path
              d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
            />
          </svg>
        </div>
      </div>
    </div>
  </div>
</template>
