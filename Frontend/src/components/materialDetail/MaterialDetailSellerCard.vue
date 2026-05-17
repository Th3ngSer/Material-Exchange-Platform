<script setup lang="ts">
import { ref } from 'vue'

const isFollowed = ref(false)

const toggleFollow = () => {
  isFollowed.value = !isFollowed.value
}

const props = defineProps<{
  name: string
  rating: number
  responseTime: string
  location: string
  avatar?: string
}>()

const initials = (props.name || 'U')
  .split(' ')
  .filter(Boolean)
  .map(part => part[0])
  .slice(0, 2)
  .join('')
  .toUpperCase()
</script>

<template>
  <div class="rounded-[22px] border border-white/70 bg-white p-4 text-[#1e2058] shadow-[0_18px_50px_rgba(21,24,66,0.08)]">
    <div class="flex items-center gap-3">
      <div class="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-full bg-[#23216e] text-sm font-bold text-white">
        <img v-if="avatar" :src="avatar" :alt="name" class="h-full w-full object-cover" />
        <span v-else>{{ initials }}</span>
      </div>

      <div class="min-w-0 flex-1">
        <div class="flex items-center gap-2">
          <h3 class="truncate text-sm font-extrabold">{{ name }}</h3>
          <span class="rounded-full bg-[#ecfff3] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#069355]">
            Verified
          </span>
        </div>
        <p class="text-xs text-[#61658c]">{{ location }}</p>
      </div>

      <div class="text-right text-xs font-semibold text-[#23216e]">
        <div class="flex items-center justify-end gap-1">
          <span>{{ rating.toFixed(1) }}</span>
          <span class="text-[#ff8c00]">★</span>
        </div>
        <p class="text-[11px] text-[#7b7f99]">{{ responseTime }}</p>
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
      <button type="button" class="rounded-full bg-[#ff8c00] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#ff9d21]">
        Message
      </button>
    </div>
  </div>
</template>