<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'

const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

const authStore = useAuthStore()
const isFollowed = ref(false)
const avatarUpdateTimestamp = ref(0)

const toggleFollow = () => {
  isFollowed.value = !isFollowed.value
}

const props = defineProps<{
  sellerId?: string
  name: string
  rating: number
  responseTime: string
  location: string
  avatar?: string
}>()

const isCurrentUserProfile = computed(() => {
  const currentUser = authStore.user
  if (!currentUser) return false

  if (props.sellerId && String(props.sellerId) === String(currentUser.id)) {
    return true
  }

  const currentIdentities = [currentUser.username, currentUser.name]
    .filter(Boolean)
    .map((value) => String(value).trim().toLowerCase())

  return currentIdentities.includes(String(props.name).trim().toLowerCase())
})

const displayName = computed(() => {
  if (isCurrentUserProfile.value && authStore.user) {
    return authStore.user.username || authStore.user.name || props.name
  }
  return props.name
})

const profileLink = computed(() =>
  isCurrentUserProfile.value
    ? { name: 'profile' }
    : { name: 'profile', query: { user: props.name } }
)

const getAvatarUrl = (avatar?: string) => {
  const normalized = String(avatar || '').trim()
  if (!normalized || normalized.toLowerCase() === 'null' || normalized.toLowerCase() === 'undefined') {
    return '/userprofileImage/avatar.png'
  }

  if (/^https?:\/\//i.test(normalized)) {
    // Add cache buster for http URLs
    const separator = normalized.includes('?') ? '&' : '?'
    return `${normalized}${separator}t=${avatarUpdateTimestamp.value || Date.now()}`
  }

  const uploadBase = apiBaseUrl.replace(/\/api\/?$/, '')
  const clean = normalized.replace(/^\/+/, '')
  const basePath = clean.startsWith('uploads/') ? `${uploadBase}/${clean}` : `${uploadBase}/uploads/${clean}`
  // Add cache buster
  return `${basePath}?t=${avatarUpdateTimestamp.value || Date.now()}`
}

const avatarUrl = computed(() => {
  // Force recomputation when timestamp changes
  const _ = avatarUpdateTimestamp.value
  return getAvatarUrl(isCurrentUserProfile.value ? authStore.user?.avatar : props.avatar)
})

// Watch for auth store changes to update the timestamp
watch(
  () => authStore.user?.avatar,
  () => {
    avatarUpdateTimestamp.value = Date.now()
  }
)

const handleAvatarError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.onerror = null
  img.src = '/userprofileImage/avatar.png'
}
</script>

<template>
  <div class="rounded-[22px] border border-white/70 bg-white p-4 text-[#1e2058] shadow-[0_18px_50px_rgba(21,24,66,0.08)]">
    <div class="flex items-center gap-3">
      <div class="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-full bg-[#23216e] text-sm font-bold text-white relative">
        <img
          :key="`avatar-${avatarUpdateTimestamp}`"
          :src="avatarUrl"
          :alt="displayName"
          class="h-full w-full object-cover"
          @error="handleAvatarError"
        />
      </div>

      <router-link
        :to="profileLink"
        class="flex-1 min-w-0"
      >
        <div class="flex items-center gap-2">
          <h3 class="truncate text-sm font-extrabold">
            {{ displayName }}
          </h3>

          <span class="rounded-full bg-[#ecfff3] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#069355]">
            Verified
          </span>
        </div>

        <p class="text-xs text-[#61658c]">
          {{ location }}
        </p>
      </router-link>

      <div class="text-right text-xs font-semibold text-[#23216e]">
        <div class="flex items-center justify-end gap-1">
          <span>{{ rating.toFixed(1) }}</span>
          <span class="text-[#ff8c00]">★</span>
        </div>

        <p class="text-[11px] text-[#7b7f99]">
          {{ responseTime }}
        </p>
      </div>
    </div>

    <div class="mt-4 grid grid-cols-2 gap-3">
      <button
        type="button"
        @click="toggleFollow"
        :class="isFollowed
          ? 'bg-[#23216e] text-white ring-[#23216e]'
          : 'bg-white text-[#23216e] ring-[#e0e2f3] hover:bg-[#f5f6ff]'"
        class="rounded-full px-4 py-2 text-sm font-semibold ring-1 transition"
      >
        {{ isFollowed ? 'Followed' : 'Follow' }}
      </button>
      <router-link
        :to="{
          name: 'chat',
          query: {
            sellerId: props.sellerId || props.name,
            sellerName: displayName,
            sellerAvatar: avatarUrl,
            sellerLocation: props.location,
          },
        }"
        class="flex items-center justify-center rounded-full bg-[#ff8c00] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#ff9d21]"
      >
        Message
      </router-link>
    </div>
  </div>
</template>