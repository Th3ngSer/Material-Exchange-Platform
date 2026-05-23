<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useLanguageStore } from '@/stores/language'
// use the provided logo variant for consistent branding
import Logo from '@/assets/images/Logo.png'

const languageStore = useLanguageStore()

const authStore = useAuthStore()
const isAuthenticated = computed(() => authStore.isAuthenticated)
const router = useRouter()

type HeaderSearchType = 'All' | 'Sell' | 'Exchange' | 'Borrow'

const selectedType = ref<HeaderSearchType>('All')
const searchText = ref('')

async function submitHeaderSearch() {
  const query: Record<string, string> = {}
  const keyword = searchText.value.trim()

  if (keyword.length > 0) {
    query.q = keyword
  }

  if (selectedType.value !== 'All') {
    query.type = selectedType.value
  }

  await router.push({ name: 'browse', query })
}
</script>

<template>
  <header class="sticky top-0 z-20 border-b border-[#22245f1a] bg-white">
    <div
      class="mx-auto grid min-h-[66px] w-full max-w-[1500px] grid-cols-[auto_auto_1fr_auto] items-center gap-3 px-3 py-1 max-[1100px]:grid-cols-1 max-[1100px]:gap-2"
    >
      <RouterLink
        class="inline-flex items-center gap-3 text-[32px] font-extrabold tracking-[-0.04em] no-underline cursor-pointer hover:opacity-80 transition-opacity duration-200"
        to="/"
        aria-label="Material Exchange Platform home"
      >
        <img :src="Logo" alt="Material Exchange logo" class="h-6 w-auto" />
        <span class="sr-only">Material Exchange Platform</span>
      </RouterLink>

      <nav class="inline-flex gap-5 max-[1100px]:hidden text-center" aria-label="Primary">
        <RouterLink
          :class="[
            'ml-20 text-[16px] font-bold no-underline text-center cursor-pointer transition-colors duration-200',
            router.currentRoute.value.path.startsWith('/browse')
              ? 'text-[#ff4b42]'
              : 'text-[#201f62] hover:text-[#ff4b42]'
          ]"
          to="/browse#categories"
        >
          {{ languageStore.t('browse') }}

        </RouterLink>
        <RouterLink
          :class="[
            'ml-20 text-[16px] font-bold no-underline text-center cursor-pointer transition-colors duration-200',
            router.currentRoute.value.path.startsWith('/posts/create')
              ? 'text-[#ff4b42]'
              : 'text-[#201f62] hover:text-[#ff4b42]'
          ]"
          to="/posts/create"
        >
          {{ languageStore.t('createPost') }}

        </RouterLink>
      </nav>

      <form
        class="mx-auto grid w-full max-w-[452px] grid-cols-[118px_1fr_42px] items-center overflow-hidden rounded-[8px] border border-[#2b2f9161] bg-[#f4f5fb] max-[1100px]:max-w-none max-[1100px]:justify-self-stretch"
        role="search"
        @submit.prevent="submitHeaderSearch"
      >
        <label class="sr-only" for="home-search">{{ languageStore.t('searchMaterials') }}
        </label>
        <select
          id="home-search-type"
          aria-label="Search type"
          class="appearance-none border-0 border-r border-[#2b2f912e] bg-transparent px-3 text-[#7b7c98] outline-none cursor-pointer hover:text-[#201f62] transition-colors duration-200"
          v-model="selectedType"
        >
          <option value="All">{{ languageStore.t('allTypes') }}</option>
          <option value="Sell">{{ languageStore.t('sell') }}</option>
          <option value="Exchange">{{ languageStore.t('exchange') }}</option>
          <option value="Borrow">{{ languageStore.t('borrow') }}</option>
        </select>
        <input
          id="home-search"
          type="search"
          :placeholder="languageStore.t('searchMaterials')"
          class="min-w-0 border-0 bg-transparent px-3 outline-none"
          v-model="searchText"
        />
        <button
          type="submit"
          aria-label="Search"
          class="grid h-[34px] w-[42px] place-items-center border-0 bg-transparent text-[#201f62] cursor-pointer hover:bg-[#f0f1ff] transition-colors duration-200"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" class="h-[25px] w-[25px] fill-current">
            <path
              d="M10.5 4a6.5 6.5 0 1 0 4.07 11.57l4.43 4.43 1.4-1.41-4.43-4.43A6.5 6.5 0 0 0 10.5 4Zm0 2a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9Z"
            />
          </svg>
        </button>
      </form>

      <!-- chat -->
      <div class="inline-flex items-center justify-self-end gap-2">
        <RouterLink
          to="/chat"
          :class="[
            'grid h-[34px] w-[34px] place-items-center rounded-full transition-colors duration-200',
            router.currentRoute.value.path.startsWith('/chat')
              ? 'bg-[#f0f1ff] text-[#ff4b42]'
              : 'bg-transparent text-[#201f62] hover:bg-[#f0f1ff]'
          ]"
          aria-label="Chat"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" class="h-[25px] w-[25px] fill-current">
            <path
              d="M20 4H4a2 2 0 0 0-2 2v13.17L5.17 16H20a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Zm0 10H4.34L4 14.34V6h16v8Z"
            />
          </svg>
        </RouterLink>

        <!-- Notifications -->
        <RouterLink
          to="/notifications"
          :class="[
            'grid h-[34px] w-[34px] place-items-center rounded-full transition-colors duration-200',
            router.currentRoute.value.path.startsWith('/notifications')
              ? 'bg-[#f0f1ff] text-[#ff4b42]'
              : 'bg-transparent text-[#201f62] hover:bg-[#f0f1ff]'
          ]"
          aria-label="Notifications"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" class="h-[25px] w-[25px] fill-current">
            <path
              d="M12 22a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22Zm8-6V11a8 8 0 1 0-16 0v5L2 18v1h20v-1l-2-2Zm-2 0H6v-5a6 6 0 1 1 12 0v5Z"
            />
          </svg>
        </RouterLink>
        <RouterLink
          v-if="!isAuthenticated"
          class="whitespace-nowrap text-[16px] font-bold text-[#201f62] no-underline"
          to="/login"
        >
          {{ languageStore.t('loginSignUp') }}
        </RouterLink>
        <RouterLink
          v-else
          class="grid h-[34px] w-[34px] place-items-center rounded-full border border-[#201f62] text-[#201f62]"
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
