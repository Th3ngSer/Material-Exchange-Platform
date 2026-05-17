<script setup lang="ts">
import MaterialCard from '@/components/materialDetail/MaterialCard.vue'
import NoResults from './NoResults.vue'
import { type MaterialItem } from '@/data/materials'

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
      aria-label="Material listings"
    >
      <MaterialCard v-for="item in materials" :key="item.id" :item="item" />
    </div>

    <NoResults
      v-else
      type="items"
      message="No Results found"
      description="We couldn't find what you searched for. Try searching again."
    />

    <div
      v-if="isLoading"
      class="flex items-center justify-center py-8 text-sm font-semibold text-[#6a6f93]"
      aria-hidden="true"
    >
      Loading more materials...
    </div>
  </div>
</template>
