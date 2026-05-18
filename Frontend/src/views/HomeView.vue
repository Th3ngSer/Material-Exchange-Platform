<script setup lang="ts">
import { computed, ref } from 'vue'

import HomeCategories from '../components/HomeView/HomeCategories.vue'
import HomeHero from '../components/HomeView/HomeHero.vue'
import MaterialCard from '@/components/materialDetail/MaterialCard.vue'
import Footer from '@/components/layout/Footer.vue'
import Header from '@/components/layout/Header.vue'
import { defaultMaterials, type MaterialItem, type MaterialCategory } from '@/data/materials'

type Category = 'All' | MaterialCategory

type SortOption = 'All' | 'Newest' | 'A-Z' | 'Z-A'

interface Props {
  materials?: MaterialItem[]
  categories?: Category[]
  sortOptions?: SortOption[]
}

const props = withDefaults(defineProps<Props>(), {
  materials: () => defaultMaterials,
  categories: () => ['All', 'Sell', 'Exchange', 'Borrow'],
  sortOptions: () => ['All', 'Newest', 'A-Z', 'Z-A'],
})

const selectedCategory = ref<Category>(props.categories?.[0] ?? 'All')
const selectedSort = ref<SortOption>(props.sortOptions?.[0] ?? 'All')

function handleCategoryUpdate(value: string) {
  if ((props.categories ?? []).includes(value as Category)) {
    selectedCategory.value = value as Category
  }
}

function handleSortUpdate(value: string) {
  selectedSort.value = value as SortOption
}

const filteredMaterials = computed(() => {
  const pool =
    selectedCategory.value === 'All'
      ? props.materials
      : props.materials.filter((item) => item.category === selectedCategory.value)

  const sortedPool = [...pool]

  if (selectedSort.value === 'All') {
    return sortedPool
  }

  if (selectedSort.value === 'Newest') {
    return sortedPool.sort((left, right) => right.id - left.id)
  }

  if (selectedSort.value === 'A-Z') {
    return sortedPool.sort((left, right) => left.title.localeCompare(right.title))
  }

  if (selectedSort.value === 'Z-A') {
    return sortedPool.sort((left, right) => right.title.localeCompare(left.title))
  }

  return sortedPool
})

const featuredCount = computed(() => filteredMaterials.value.length)

// Limit displayed materials to 20 items for any category/filter
const displayedMaterials = computed(() => filteredMaterials.value.slice(0, 20))
</script>

<template>
  <div class="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.9),_rgba(245,245,250,0.95)_30%,_#f5f5f7_65%),linear-gradient(180deg,_#f4f4f8_0%,_#ffffff_20%,_#ffffff_100%)] text-[#15152d]">
    <Header />
    <HomeHero class="pl-20"/>
    <main class="mx-auto w-[min(1500px,calc(100%-32px))] max-[768px]:w-[min(100%-20px,100%)]">
      

      <section class="py-7 pb-12 max-[768px]:pt-5">
        <HomeCategories
          :categories="props.categories"
          :selected-category="selectedCategory"
          :sort-options="props.sortOptions"
          :selected-sort="selectedSort"
          :result-count="featuredCount"
          @update:category="handleCategoryUpdate($event)"
          @update:sort="handleSortUpdate($event)"
        />

        <div class="mt-7 grid justify-center gap-6 [grid-template-columns:repeat(auto-fill,minmax(320px,320px))] max-[768px]:gap-4 max-[768px]:[grid-template-columns:repeat(auto-fill,minmax(250px,250px))]" aria-label="Material listings">
          <MaterialCard v-for="item in displayedMaterials" :key="item.id" :item="item" />
        </div>
      </section>
    </main>

    <Footer />
  </div>
</template>
