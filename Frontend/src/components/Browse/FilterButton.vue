<script setup lang="ts">
import { useLanguageStore } from '../../stores/language'

interface Props {
  activeTypeCount: number
  isFloating?: boolean
}

interface Emits {
  (e: 'click'): void
}

withDefaults(defineProps<Props>(), {
  isFloating: false
})

defineEmits<Emits>()

const languageStore = useLanguageStore()
</script>

<template>
  <button
    v-if="!isFloating"
    type="button"
    class="relative grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#f4f5fb] text-[#201f62] transition hover:bg-[#eaecfb]"
    :aria-label="languageStore.t('openFilters')"
    @click="$emit('click')"
  >
    <span v-if="activeTypeCount > 0" class="absolute right-1 top-1 h-3 w-3 rounded-full bg-[#ff4b42]"></span>
    <svg
      class="h-6 w-6 text-gray-800"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d="M5.05 3C3.291 3 2.352 5.024 3.51 6.317l5.422 6.059v4.874c0 .472.227.917.613 1.2l3.069 2.25c1.01.742 2.454.036 2.454-1.2v-7.124l5.422-6.059C21.647 5.024 20.708 3 18.95 3H5.05Z" />
    </svg>
  </button>

  <button
    v-else
    type="button"
    class="fixed bottom-6 right-6 z-30 grid h-12 w-12 place-items-center rounded-full bg-[#1b1748] text-white shadow-[0_14px_28px_rgba(27,23,72,0.32)] transition hover:bg-[#242163] sm:bottom-8 sm:right-8"
    :aria-label="languageStore.t('openFilters')"
    @click="$emit('click')"
  >
    <span v-if="activeTypeCount > 0" class="absolute right-1 top-1 h-3 w-3 rounded-full bg-[#ff4b42]"></span>
    <svg
      class="h-6 w-6"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d="M5.05 3C3.291 3 2.352 5.024 3.51 6.317l5.422 6.059v4.874c0 .472.227.917.613 1.2l3.069 2.25c1.01.742 2.454.036 2.454-1.2v-7.124l5.422-6.059C21.647 5.024 20.708 3 18.95 3H5.05Z" />
    </svg>
  </button>
</template>
