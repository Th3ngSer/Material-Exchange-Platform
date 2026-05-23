<script setup lang="ts">
import { useLanguageStore } from '../../stores/language'
const languageStore = useLanguageStore()

defineProps<{
  categories: string[]
  selectedCategory: string
  sortOptions: string[]
  selectedSort: string
  resultCount: number
}>()

defineEmits<{
  (event: 'update:category', value: string): void
  (event: 'update:sort', value: string): void
}>()
</script>

<template>
  <div
    class="mb-6 flex items-end justify-between gap-4 max-[720px]:flex-col max-[720px]:items-start"
  >
    <div class="flex-1">
      <p
        id="categories"
        class="m-0 font-serif text-[clamp(2.4rem,5vw,4rem)] leading-[0.95] tracking-[-0.06em] text-[#15152d]"
      >
        {{ languageStore.t('marketplace') }} 
      </p>
    </div>

    <div
      class="inline-flex flex-wrap items-center justify-end gap-2 text-[#ff9d1b] font-bold max-[720px]:justify-start"
    >
      <label class="inline-flex items-center gap-2 text-[0.72rem] uppercase tracking-[0.16em]">
        {{ languageStore.t('sortBy') }} 
        <select
          :value="selectedSort"
          @change="$emit('update:sort', ($event.target as HTMLSelectElement).value)"
          class="appearance-none rounded-[4px] border border-[#26276f26] bg-[#202065] px-3 py-2 text-white outline-none"
        >
          <option v-for="option in sortOptions" :key="option" :value="option">
            {{ option }}
          </option>
        </select>
      </label>
    </div>
  </div>

  <div class="flex flex-wrap gap-7 max-[720px]:gap-3">
    <button
      v-for="category in categories"
      :key="category"
      type="button"
      class="min-w-[74px] rounded-[7px] bg-[#25236e] px-5 py-2.5 font-bold text-white transition hover:-translate-y-0.5"
      :class="{
        'bg-[#ff4b42] shadow-[0_14px_26px_rgba(255,75,66,0.28)]': selectedCategory === category,
      }"
      @click="$emit('update:category', category)"
    >
      {{ category }}
    </button>
  </div>
</template>
