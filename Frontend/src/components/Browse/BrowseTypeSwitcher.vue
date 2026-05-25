<script setup lang="ts">
interface Props {
  browseType: 'items' | 'users'
}

import { useLanguageStore } from '../../stores/language'

interface Emits {
  (e: 'update:browseType', value: 'items' | 'users'): void
}

defineProps<Props>()
defineEmits<Emits>()

const languageStore = useLanguageStore()
</script>

<template>
  <div class="mx-auto mt-4 flex max-w-[870px] justify-center gap-3 mb-5">
    <button
      type="button"
      :class="[
        'px-6 py-2 rounded-full font-semibold text-sm transition',
        browseType === 'items'
          ? 'bg-[#1b1748] text-white'
          : 'bg-[#f4f5fb] text-[#7b7c98] hover:bg-[#eaecfb]'
      ]"
      @click="$emit('update:browseType', 'items')"
    >
      {{ languageStore.t('items') }}
    </button>
    <button
      type="button"
      :class="[
        'px-6 py-2 rounded-full font-semibold text-sm transition',
        browseType === 'users'
          ? 'bg-[#1b1748] text-white'
          : 'bg-[#f4f5fb] text-[#7b7c98] hover:bg-[#eaecfb]'
      ]"
      @click="$emit('update:browseType', 'users')"
    >
      {{ languageStore.t('users') }}
    </button>
  </div>
</template>
