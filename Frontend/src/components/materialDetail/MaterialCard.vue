<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

import BaseMaterialCard from '@/components/HomeView/MaterialCard.vue'

type Tone = 'gold' | 'orange' | 'rose'

type MaterialCardItem = {
  id: number | string
  title: string
  price: string
  location: string
  /** transaction type */
  type: 'Sell' | 'Exchange' | 'Borrow'
  /** product category (Clothing, Electronics, etc.) */
  category?: string
  tone: Tone
  seller?: string
  rating?: number
  avatar?: string
  images?: string[]
  postedTime?: string
}

const props = withDefaults(
  defineProps<{
    item: MaterialCardItem
    compact?: boolean
  }>(),
  {
    compact: false,
  },
)

const to = computed(() => `/posts/${props.item.id}`)

function scrollToTop() {
  window.scrollTo({ top: 0 })
}
</script>

<template>
  <RouterLink
    :to="to"
    @click="scrollToTop"
    class="block no-underline transition hover:-translate-y-1 hover:opacity-95"
  >
    <BaseMaterialCard :item="item" :compact="compact" />
  </RouterLink>
</template>
