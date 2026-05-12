<script setup lang="ts">
import { computed, ref } from 'vue'

import HomeCategories from '../components/HomeView/HomeCategories.vue'
import HomeHero from '../components/HomeView/HomeHero.vue'
import MaterialCard from '../components/HomeView/MaterialCard.vue'
import Footer from '@/components/layout/Footer.vue'
import Header from '@/components/layout/Header.vue'

type Category = 'All' | 'Sell' | 'Exchange' | 'Borrow'

type SortOption = 'All' | 'Newest' | 'A-Z' | 'Z-A'

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
  image?: string
  postedTime?: string
}

interface Props {
  materials?: MaterialItem[]
  categories?: Category[]
  sortOptions?: SortOption[]
}

const props = withDefaults(defineProps<Props>(), {
  materials: () => [
    {
      id: 1,
      title: 'Sofa Chair',
      price: '75',
      location: 'Singapore Hub',
      category: 'Sell',
      tone: 'orange',
      seller: 'Ly Thong',
      rating: 5.0,
      avatar: 'https://i.pravatar.cc/100?img=11',
      image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&h=400&fit=crop',
      postedTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 2,
      title: 'Wooden Desk',
      price: '',
      location: 'Hong Kong Hub',
      category: 'Exchange',
      tone: 'gold',
      seller: 'John Doe',
      rating: 4.8,
      avatar: 'https://i.pravatar.cc/100?img=12',
      image: 'https://nordicdesign.com.au/wp-content/uploads/2024/02/resized-office-desk-mondi.jpg',
      postedTime: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 3,
      title: 'Desk Lamp',
      price: '',
      location: 'Remote Friendly',
      category: 'Borrow',
      tone: 'rose',
      seller: 'Jane Smith',
      rating: 4.9,
      avatar: 'https://i.pravatar.cc/100?img=32',
      image: 'https://www.anglepoise.com/wp-content/uploads/2021/12/T75-desk-lamp-black.jpg',
      postedTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 4,
      title: 'Office Chair',
      price: '88',
      location: 'Singapore Hub',
      category: 'Sell',
      tone: 'orange',
      seller: 'Mike Chen',
      rating: 5.0,
      avatar: 'https://i.pravatar.cc/100?img=14',
      image: 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=500&h=400&fit=crop',
      postedTime: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
    },
    {
      id: 5,
      title: 'Monitor Arm',
      price: '',
      location: 'Bangkok Hub',
      category: 'Exchange',
      tone: 'gold',
      seller: 'Sarah Wong',
      rating: 4.7,
      avatar: 'https://i.pravatar.cc/100?img=47',
      image: 'https://www.maxgaming.com/bilder/artiklar/zoom/32730_1.jpg?m=1739012223',
      postedTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 6,
      title: 'Storage Box',
      price: '',
      location: 'Hybrid Pickup',
      category: 'Borrow',
      tone: 'rose',
      seller: 'Alex Park',
      rating: 4.9,
      avatar: 'https://i.pravatar.cc/100?img=18',
      image:
        'https://i5.walmartimages.com/seo/HART-17-Gallon-Heavy-Duty-Latching-Plastic-Storage-Box-Black-Base-Blue-Lid-Set-of-4_ab8ce7b3-b9e2-4100-9199-3c82bc5f184b.728a402e3ddc7dbc15ff6fdd6ad2510d.jpeg',
      postedTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    },
    {
      id: 7,
      title: 'Task Stool',
      price: '33',
      location: 'Singapore Hub',
      category: 'Sell',
      tone: 'orange',
      seller: 'Emma Lee',
      rating: 5.0,
      avatar: 'https://i.pravatar.cc/100?img=44',
      image: 'https://filfurniture.co.nz/wp-content/uploads/2023/11/Be-Task-Chair-SKU-72126-1.jpg',
      postedTime: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 8,
      title: 'Work Shelf',
      price: '',
      location: 'Dubai Hub',
      category: 'Exchange',
      tone: 'gold',
      seller: 'David Brown',
      rating: 4.8,
      avatar: 'https://i.pravatar.cc/100?img=65',
      image:
        'https://res.cloudinary.com/globalindustrial/image/fetch/c_fill,g_auto,f_auto,dpr_auto,w_800,h_800/https://s3.ap-southeast-2.amazonaws.com/assets.globalind.com.au/app/uploads/2017/02/31103632/APEX-4-TIER-WORKBENCH-2591L-1.jpg',
      postedTime: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    },
    {
      id: 9,
      title: 'Folding Table',
      price: '',
      location: 'City Center',
      category: 'Borrow',
      tone: 'rose',
      seller: 'Lisa Kim',
      rating: 4.9,
      avatar: 'https://i.pravatar.cc/100?img=49',
      image:
        'https://i.etsystatic.com/49819005/r/il/f9d401/5751055675/il_570xN.5751055675_i30a.jpg',
      postedTime: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 10,
      title: 'Storage Rack',
      price: '68',
      location: 'Singapore Hub',
      category: 'Sell',
      tone: 'orange',
      seller: 'Tom Wilson',
      rating: 5.0,
      avatar: 'https://i.pravatar.cc/100?img=53',
      image: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=500&h=400&fit=crop',
      postedTime: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 11,
      title: 'Whiteboard',
      price: '',
      location: 'Metro Hub',
      category: 'Exchange',
      tone: 'gold',
      seller: 'Rachel Green',
      rating: 4.8,
      avatar: 'https://i.pravatar.cc/100?img=68',
      image: 'https://m.media-amazon.com/images/I/51+V9jcOerL._AC_UF1000,1000_QL80_.jpg',
      postedTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 12,
      title: 'Standing Mat',
      price: '',
      location: 'Office Circle',
      category: 'Borrow',
      tone: 'rose',
      seller: 'Chris Evans',
      rating: 4.9,
      avatar:
        'https://preview.redd.it/chisa-is-love-v0-zzl58mr5ti2g1.jpeg?width=1080&crop=smart&auto=webp&s=8100339890eb3ac2ceab772e21838534fe274c08',
      image: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=500&h=400&fit=crop',
      postedTime: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    },
  ],
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
</script>

<template>
  <div
    class="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.9),_rgba(245,245,250,0.95)_30%,_#f5f5f7_65%),linear-gradient(180deg,_#f4f4f8_0%,_#ffffff_20%,_#ffffff_100%)] text-[#15152d]"
  >
    <Header />
    <HomeHero class="pl-20" />
    <main class="mx-auto w-[min(1880px,calc(100%-32px))] max-[768px]:w-[min(100%-20px,100%)]">
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

        <div
          class="mt-7 grid justify-center gap-6 [grid-template-columns:repeat(auto-fill,minmax(320px,320px))] max-[768px]:gap-4 max-[768px]:[grid-template-columns:repeat(auto-fill,minmax(250px,250px))]"
          aria-label="Material listings"
        >
          <MaterialCard v-for="item in filteredMaterials" :key="item.id" :item="item" />
        </div>
      </section>
    </main>

    <Footer />
  </div>
</template>
