<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

import HomeCategories from '../components/HomeView/HomeCategories.vue'
import HomeHero from '../components/HomeView/HomeHero.vue'
import CategoryMarquee from '../components/HomeView/CategoryMarquee.vue'
import MaterialCard from '@/components/materialDetail/MaterialCard.vue'
import Footer from '@/components/layout/Footer.vue'
import Header from '@/components/layout/Header.vue'
import { defaultMaterials, type MaterialItem, type MaterialCategory } from '@/data/materials'

interface PostRecord {
  _id: string
  type: 'sell' | 'exchange' | 'lend'
  title: string
  description: string
  category: string
  condition: 'new' | 'used'
  price: number
  exchangeFor?: string
  location: string
  images: string[]
  createdAt?: string
  listerName?: string
  listerAvatar?: string
}

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

const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
const router = useRouter()
const selectedCategory = ref<Category>(props.categories?.[0] ?? 'All')
const selectedSort = ref<SortOption>(props.sortOptions?.[0] ?? 'All')
const liveMaterials = ref<MaterialItem[]>(props.materials)

function imageUrl(image: string) {
  if (/^https?:\/\//i.test(image)) return image
  const uploadBaseUrl = apiBaseUrl.replace(/\/api\/?$/, '')
  const clean = image.replace(/^\/+/, '')
  if (clean.startsWith('uploads/')) return `${uploadBaseUrl}/${clean}`
  return `${uploadBaseUrl}/uploads/${clean}`
}

function mapPostToMaterial(post: PostRecord): MaterialItem {
  const type = post.type === 'sell' ? 'Sell' : post.type === 'exchange' ? 'Exchange' : 'Borrow'

  return {
    id: post._id,
    title: post.title,
    price:
      type === 'Exchange'
        ? ''
        : type === 'Borrow'
          ? `${Number(post.price || 0).toFixed(2)}/wk`
          : `${Number(post.price || 0).toFixed(2)}`,
    location: post.location,
    type,
    tone: type === 'Sell' ? 'orange' : type === 'Exchange' ? 'gold' : 'rose',
    category: post.category as MaterialItem['category'],
    images: post.images.map(imageUrl),
    postedTime: post.createdAt,
    description: post.description,
    condition: post.condition === 'new' ? 'New' : 'Used',
    exchangeFor: post.exchangeFor,
    seller: post.listerName || 'Unknown',
    avatar: post.listerAvatar ? imageUrl(post.listerAvatar) : undefined,
  }
}

async function loadPosts() {
  try {
    const { data } = await axios.get<{ posts: PostRecord[] }>(`${apiBaseUrl}/posts`)
    const mappedPosts = (data.posts ?? []).map(mapPostToMaterial)
    liveMaterials.value = [...mappedPosts, ...defaultMaterials]
  } catch {
    liveMaterials.value = defaultMaterials
  }
}

function handleCategoryUpdate(value: string) {
  // If the clicked value matches a transaction category, update locally.
  if ((props.categories ?? []).includes(value as Category)) {
    selectedCategory.value = value as Category
    return
  }

  // Otherwise treat as a product category from the marquee and navigate to Browse.
  router.push({ name: 'browse', query: { category: value } })
}

function handleSortUpdate(value: string) {
  selectedSort.value = value as SortOption
}

const filteredMaterials = computed(() => {
  const pool =
    selectedCategory.value === 'All'
      ? liveMaterials.value
      : liveMaterials.value.filter((item) => item.type === selectedCategory.value)

  const sortedPool = [...pool]

  if (selectedSort.value === 'All') {
    return sortedPool
  }

  if (selectedSort.value === 'Newest') {
    return sortedPool.sort((left, right) => {
      const leftTime = left.postedTime ? new Date(left.postedTime).getTime() : 0
      const rightTime = right.postedTime ? new Date(right.postedTime).getTime() : 0
      return rightTime - leftTime
    })
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

onMounted(() => {
  void loadPosts()
})

</script>

<template>
  <div class="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.9),_rgba(245,245,250,0.95)_30%,_#f5f5f7_65%),linear-gradient(180deg,_#f4f4f8_0%,_#ffffff_20%,_#ffffff_100%)] text-[#15152d]">
    <Header />
    <HomeHero class="pl-20"/>

    <CategoryMarquee :selected-category="selectedCategory" @update:category="handleCategoryUpdate" />
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


