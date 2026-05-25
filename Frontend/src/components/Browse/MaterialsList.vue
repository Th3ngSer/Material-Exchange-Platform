<script setup lang="ts">
import MaterialCard from '../materialDetail/MaterialCard.vue'
import NoResults from './NoResults.vue'
import { useLanguageStore } from '../../stores/language'
import { type MaterialItem } from '../../data/materials'

const languageStore = useLanguageStore()

interface Props {
  materials: MaterialItem[]
  isLoading?: boolean
}

withDefaults(defineProps<Props>(), {
  isLoading: false
})
</script>

<template>
  <div class="flex flex-col gap-8">
    <div
      v-if="materials.length > 0"
      class="mt-7 grid justify-center gap-6 [grid-template-columns:repeat(auto-fill,minmax(320px,320px))] max-[768px]:gap-4 max-[768px]:[grid-template-columns:repeat(auto-fill,minmax(250px,250px))]"
      :aria-label="languageStore.t('materialListings')"
    >
      <MaterialCard v-for="item in materials" :key="item.id" :item="item" />
    </div>

    <NoResults
      v-else
      type="items"
      :message="languageStore.t('noResultsFound')"
      :description="languageStore.t('noResultsDescription')"
    />

    <div
      v-if="isLoading"
      class="flex items-center justify-center py-8 text-sm font-semibold text-[#6a6f93]"
      aria-hidden="true"
    >
      {{ languageStore.t('loadingMoreMaterials') }}
    </div>
  </div>
</template>
