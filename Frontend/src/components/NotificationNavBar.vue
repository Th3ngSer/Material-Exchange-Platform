<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const isAuthenticated = computed(() => authStore.isAuthenticated)

const goHome = () => {
  router.push('/home')
}
</script>

<template>
  <header class="sticky top-0 z-20 border-b border-[#22245f1a] bg-white">
    <div class="mx-auto grid min-h-[66px] w-full max-w-[1920px] grid-cols-[auto_1fr_auto] items-center gap-3 px-3 py-1">
      <!-- Back button + Logo -->
      <div class="inline-flex items-center gap-3">
        <button
          class="grid h-[34px] w-[34px] place-items-center rounded-full border-0 bg-transparent text-[#201f62] hover:bg-[#f4f5fb]"
          type="button"
          aria-label="Back to home"
          @click="goHome"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" class="h-[20px] w-[20px] fill-current">
            <path d="M19 11H7.83l5.59-5.59L12 3l-9 9 9 9 1.41-1.41L7.83 13H19v-2z" />
          </svg>
        </button>
        <a class="inline-flex items-baseline text-[24px] font-extrabold tracking-[-0.04em] no-underline" href="/" aria-label="Material Exchange Platform home">
          <span class="text-[#2b2f92]">Do</span><span class="text-[#ff4b42]">Ort</span>
        </a>
      </div>

      <!-- Title -->
      <div class="text-center">
        <h1 class="text-[20px] font-bold text-[#201f62]">Notifications</h1>
      </div>

      <!-- Right side icons -->
      <div class="inline-flex items-center justify-self-end gap-2">
        <button class="grid h-[34px] w-[34px] place-items-center rounded-full border-0 bg-transparent text-[#201f62] hover:bg-[#f4f5fb]" type="button" aria-label="Messages">
          <svg viewBox="0 0 24 24" aria-hidden="true" class="h-[25px] w-[25px] fill-current">
            <path d="M20 4H4a2 2 0 0 0-2 2v13.17L5.17 16H20a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Zm0 10H4.34L4 14.34V6h16v8Z" />
          </svg>
        </button>
        <RouterLink
          v-if="!isAuthenticated"
          class="whitespace-nowrap text-[16px] font-bold text-[#201f62] no-underline"
          to="/login"
        >
          Login/Sign up
        </RouterLink>
        <RouterLink
          v-else
          class="grid h-[34px] w-[34px] place-items-center rounded-full border border-[#201f62] text-[#201f62] hover:bg-[#f4f5fb]"
          to="/profile"
          aria-label="Profile"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" class="h-[20px] w-[20px] fill-current">
            <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm0 2c-3.33 0-8 1.67-8 5v1h16v-1c0-3.33-4.67-5-8-5Z" />
          </svg>
        </RouterLink>
      </div>
    </div>
  </header>
</template>
