<script setup lang="ts">
import { computed, ref } from 'vue'

import HomeCategories from '../components/HomeView/HomeCategories.vue'
import HomeHero from '../components/HomeView/HomeHero.vue'
import MaterialCard from '../components/HomeView/MaterialCard.vue'
import Footer from '@/components/layout/Footer.vue'
import Header from '@/components/layout/Header.vue'

type Category = 'All' | 'Sell' | 'Exchange' | 'Borrow'

interface MaterialItem {
  id: number
  title: string
  price: string
  location: string
  category: Exclude<Category, 'All'>
  tone: 'gold' | 'orange' | 'rose'
  seller?: string
  rating?: number
  avatar?: string
}

interface Props {
  materials?: MaterialItem[]
}

const props = withDefaults(defineProps<Props>(), {
  materials: () => [
  { id: 1, title: 'Sofa Chair', price: '75', location: 'Singapore Hub', category: 'Sell', tone: 'orange', seller: 'Ly Thong', rating: 5.0 },
  { id: 2, title: 'Wooden Desk', price: '120', location: 'Hong Kong Hub', category: 'Exchange', tone: 'gold', seller: 'John Doe', rating: 4.8 },
  { id: 3, title: 'Desk Lamp', price: '18', location: 'Remote Friendly', category: 'Borrow', tone: 'rose', seller: 'Jane Smith', rating: 4.9 },
  { id: 4, title: 'Office Chair', price: '88', location: 'Singapore Hub', category: 'Sell', tone: 'orange', seller: 'Mike Chen', rating: 5.0 },
  { id: 5, title: 'Monitor Arm', price: '42', location: 'Bangkok Hub', category: 'Exchange', tone: 'gold', seller: 'Sarah Wong', rating: 4.7 },
  { id: 6, title: 'Storage Box', price: '15', location: 'Hybrid Pickup', category: 'Borrow', tone: 'rose', seller: 'Alex Park', rating: 4.9 },
  { id: 7, title: 'Task Stool', price: '33', location: 'Singapore Hub', category: 'Sell', tone: 'orange', seller: 'Emma Lee', rating: 5.0 },
  { id: 8, title: 'Work Shelf', price: '95', location: 'Dubai Hub', category: 'Exchange', tone: 'gold', seller: 'David Brown', rating: 4.8 },
  { id: 9, title: 'Folding Table', price: '54', location: 'City Center', category: 'Borrow', tone: 'rose', seller: 'Lisa Kim', rating: 4.9 },
  { id: 10, title: 'Storage Rack', price: '68', location: 'Singapore Hub', category: 'Sell', tone: 'orange', seller: 'Tom Wilson', rating: 5.0 },
  { id: 11, title: 'Whiteboard', price: '29', location: 'Metro Hub', category: 'Exchange', tone: 'gold', seller: 'Rachel Green', rating: 4.8 },
  { id: 12, title: 'Standing Mat', price: '22', location: 'Office Circle', category: 'Borrow', tone: 'rose', seller: 'Chris Evans', rating: 4.9 },
  ],
})

const categories: Category[] = ['All', 'Sell', 'Exchange', 'Borrow']
const sortOptions = ['Category', 'Newest', 'Price low to high', 'Price high to low']

const selectedCategory = ref<Category>('All')
const selectedSort = ref<string>(sortOptions[0] ?? 'Category')

function handleCategoryUpdate(value: string) {
  if (categories.includes(value as Category)) {
    selectedCategory.value = value as Category
  }
}

const filteredMaterials = computed(() => {
  const pool =
    selectedCategory.value === 'All'
      ? props.materials
      : props.materials.filter((item) => item.category === selectedCategory.value)

  const sortedPool = [...pool]

  if (selectedSort.value === 'Price low to high') {
    return sortedPool.sort((left, right) => Number(left.price) - Number(right.price))
  }

  if (selectedSort.value === 'Price high to low') {
    return sortedPool.sort((left, right) => Number(right.price) - Number(left.price))
  }

  return sortedPool
})

const featuredCount = computed(() => filteredMaterials.value.length)
</script>

<template>
  <div class="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.9),_rgba(245,245,250,0.95)_30%,_#f5f5f7_65%),linear-gradient(180deg,_#f4f4f8_0%,_#ffffff_20%,_#ffffff_100%)] text-[#15152d]">
    <Header />
    <HomeHero class="pl-20"/>
    <main class="mx-auto w-[min(1880px,calc(100%-32px))] max-[768px]:w-[min(100%-20px,100%)]">
      

      <section class="py-7 pb-12 max-[768px]:pt-5">
        <HomeCategories
          :categories="categories"
          :selected-category="selectedCategory"
          :sort-options="sortOptions"
          :selected-sort="selectedSort"
          :result-count="featuredCount"
          @update:category="handleCategoryUpdate($event)"
          @update:sort="selectedSort = $event"
        />

        <div class="mt-7 grid justify-center gap-6 [grid-template-columns:repeat(auto-fill,minmax(320px,320px))] max-[768px]:gap-4 max-[768px]:[grid-template-columns:repeat(auto-fill,minmax(250px,250px))]" aria-label="Material listings">
          <MaterialCard v-for="item in filteredMaterials" :key="item.id" :item="item" />
        </div>
      </section>
    </main>

    <Footer />
  </div>
</template>