<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import axios from 'axios'
import { useRoute } from 'vue-router'

import Footer from '@/components/layout/Footer.vue'
import Header from '@/components/layout/Header.vue'
import CategoryStrip from '@/components/Browse/CategoryStrip.vue'
import BrowseTypeSwitcher from '@/components/Browse/BrowseTypeSwitcher.vue'
import SearchBar from '@/components/Browse/SearchBar.vue'
import FilterButton from '@/components/Browse/FilterButton.vue'
import FilterPanel from '@/components/Browse/FilterPanel.vue'
import MaterialsList from '@/components/Browse/MaterialsList.vue'
import UsersList from '@/components/Browse/UsersList.vue'
import { defaultMaterials, type MaterialCategory, type MaterialItem } from '@/data/materials'

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
type SortOption = 'Newest' | 'A-Z' | 'Z-A' | 'Price: Low to High' | 'Price: High to Low'
type Condition = 'New' | 'Like new' | 'Good' | 'Fair'

interface Props {
  materials?: MaterialItem[]
}

const props = withDefaults(defineProps<Props>(), {
  materials: () => defaultMaterials,
})

const route = useRoute()
const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

const categoryOptions: Category[] = ['All', 'Sell', 'Exchange', 'Borrow']
const conditionOptions: Condition[] = ['New', 'Like new', 'Good', 'Fair']

// Visual item categories (product categories) shown under Items view
const itemCategoryOptions = [
  'All',
  'Clothing',
  'Electronics',
  'Books',
  'Furniture',
  'Sports',
  'Toys',
  'Vehicles',
  'Home & Garden',
  'Food & Drink',
  'Others',
]
const selectedItemCategory = ref<string>('All')

const selectedCategory = ref<Category>('All')
const selectedSort = ref<SortOption>('Newest')
const selectedConditions = ref<Condition[]>([...conditionOptions])
const selectedRating = ref(0)
const minPrice = ref(0)
const maxPrice = ref(100)
const searchQuery = ref('')
const isFilterOpen = ref(false)
const browseType = ref<'items' | 'users'>('items')
const currentPage = ref(1)
const pageSize = 20
const filterTriggerRef = ref<HTMLButtonElement | null>(null)
const pagingSentinelRef = ref<HTMLDivElement | null>(null)
const isFilterTriggerVisible = ref(true)
const liveMaterials = ref<MaterialItem[]>(props.materials)

let filterVisibilityObserver: IntersectionObserver | null = null
let pagingObserver: IntersectionObserver | null = null

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

function observeFilterTriggerVisibility() {
  if (filterVisibilityObserver) {
    filterVisibilityObserver.disconnect()
    filterVisibilityObserver = null
  }

  if (browseType.value !== 'items' || !filterTriggerRef.value) {
    isFilterTriggerVisible.value = true
    return
  }
  // Get the actual DOM element from the component instance
  const element = (filterTriggerRef.value as any)?.$el || filterTriggerRef.value
  if (!element) {
    isFilterTriggerVisible.value = true
    return
  }

  filterVisibilityObserver = new IntersectionObserver(
    (entries) => {
      const entry = entries[0]
      if (!entry) {
        return
      }

      isFilterTriggerVisible.value = entry.isIntersecting && entry.intersectionRatio > 0.2
    },
    {
      threshold: [0, 0.2, 0.5, 1],
    },
  )

  filterVisibilityObserver.observe(element)
}

function observePagingSentinel() {
  if (pagingObserver) {
    pagingObserver.disconnect()
    pagingObserver = null
  }

  if (!pagingSentinelRef.value) {
    return
  }

  pagingObserver = new IntersectionObserver(
    (entries) => {
      const entry = entries[0]
      if (!entry || !entry.isIntersecting) {
        return
      }

      if (browseType.value === 'items' && hasMoreMaterials.value) {
        currentPage.value += 1
      }

      if (browseType.value === 'users' && hasMoreUsers.value) {
        currentPage.value += 1
      }
    },
    { threshold: 0.25 },
  )

  pagingObserver.observe(pagingSentinelRef.value)
}

const priceUpperBound = computed(() => {
  const highestPrice = liveMaterials.value.reduce((highest, item) => {
    const price = Number(item.price || 0)
    return Number.isFinite(price) ? Math.max(highest, price) : highest
  }, 0)

  return Math.max(highestPrice, 100)
})

if (maxPrice.value < priceUpperBound.value) {
  maxPrice.value = priceUpperBound.value
}

function clampPrice(value: number) {
  const normalized = Number.isFinite(value) ? Math.round(value) : 0
  return Math.min(Math.max(normalized, 0), priceUpperBound.value)
}

function normalizePriceRange(source: 'min' | 'max') {
  minPrice.value = clampPrice(minPrice.value)
  maxPrice.value = clampPrice(maxPrice.value)

  if (minPrice.value > maxPrice.value) {
    if (source === 'min') {
      maxPrice.value = minPrice.value
      return
    }

    minPrice.value = maxPrice.value
  }
}

const minThumbPercent = computed(() => {
  if (priceUpperBound.value === 0) {
    return 0
  }

  return (minPrice.value / priceUpperBound.value) * 100
})

const maxThumbPercent = computed(() => {
  if (priceUpperBound.value === 0) {
    return 0
  }

  return (maxPrice.value / priceUpperBound.value) * 100
})

const activeTrackStyle = computed(() => ({
  left: `${minThumbPercent.value}%`,
  width: `${Math.max(maxThumbPercent.value - minThumbPercent.value, 0)}%`,
}))

function handleCategoryUpdate(value: string) {
  if (categoryOptions.includes(value as Category)) {
    selectedCategory.value = value as Category
  }
}

function handleSortUpdate(value: string) {
  selectedSort.value = value as SortOption
}

function toggleCondition(condition: Condition) {
  if (selectedConditions.value.includes(condition)) {
    selectedConditions.value = selectedConditions.value.filter((item) => item !== condition)
    return
  }

  selectedConditions.value = [...selectedConditions.value, condition]
}

function clearFilters() {
  selectedCategory.value = 'All'
  selectedSort.value = 'Newest'
  selectedConditions.value = [...conditionOptions]
  selectedRating.value = 0
  minPrice.value = 0
  maxPrice.value = priceUpperBound.value
  searchQuery.value = ''
  browseType.value = 'items'
  selectedItemCategory.value = 'All'
}

function applyHeaderSearchFromRoute() {
  const routeQuery = typeof route.query.q === 'string' ? route.query.q : ''
  const routeType = typeof route.query.type === 'string' ? route.query.type : 'All'
  const normalizedType = categoryOptions.includes(routeType as Category) ? (routeType as Category) : 'All'
  const routeCategory = typeof route.query.category === 'string' ? route.query.category : 'All'
  const normalizedCategory = (itemCategoryOptions as string[]).includes(routeCategory) ? routeCategory : 'All'

  searchQuery.value = routeQuery
  selectedCategory.value = normalizedType
  selectedItemCategory.value = normalizedCategory
  browseType.value = 'items'
}

// Lightweight product category detector for existing sample data
function getProductCategory(item: MaterialItem) {
  // prefer explicit product `category` if present in data
  if ((item as any).category) return (item as any).category

  const text = ((item.title || '') + ' ' + (item.description || '')).toLowerCase()

  if (/cloth|shirt|jacket|hoodie|pants|dress|clothing|t-shirt/.test(text)) return 'Clothing'
  if (/phone|laptop|monitor|keyboard|electronic|electrics|electronics|charger|speaker|lamp/.test(text)) return 'Electronics'
  if (/book|novel|magazine|textbook|comic/.test(text)) return 'Books'
  if (/sofa|chair|table|desk|furniture|shelf|cabinet|rack|storage/.test(text)) return 'Furniture'
  if (/sport|ball|racket|bike|bicycle|fitness|gym|sports/.test(text)) return 'Sports'
  if (/toy|lego|game|doll|play/.test(text)) return 'Toys'
  if (/car|vehicle|van|truck|motorcycle|bike|bicycle/.test(text)) return 'Vehicles'
  if (/home|garden|plant|sofa|cushion|bed|kitchen|decor/.test(text)) return 'Home & Garden'
  if (/food|drink|grocery|snack|beverage|coffee/.test(text)) return 'Food & Drink'

  return 'Others'
}

const filteredMaterials = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()

  const pool = liveMaterials.value.filter((item) => {
    const matchesCategory = selectedCategory.value === 'All' || item.type === selectedCategory.value
    const isUsedConditionSelected = selectedConditions.value.some((condition) => condition !== 'New')
    const matchesCondition =
      selectedConditions.value.length === 0 ||
      (item.condition === 'New' && selectedConditions.value.includes('New')) ||
      (item.condition === 'Used' && isUsedConditionSelected) ||
      !item.condition
    const matchesRating = (item.rating ?? 0) >= selectedRating.value
    const title = item.title.toLowerCase()
    const description = (item.description ?? '').toLowerCase()
    const location = item.location.toLowerCase()
    const seller = (item.seller ?? '').toLowerCase()
    const matchesSearch =
      query.length === 0 ||
      title.includes(query) ||
      description.includes(query) ||
      location.includes(query) ||
      seller.includes(query)

    const priceValue = Number(item.price || 0)
    const matchesPrice =
      item.type !== 'Sell' ||
      (priceValue >= minPrice.value && priceValue <= maxPrice.value)

    const productCategory = getProductCategory(item)
    const matchesProductCategory = selectedItemCategory.value === 'All' || productCategory === selectedItemCategory.value

    return matchesCategory && matchesCondition && matchesRating && matchesSearch && matchesPrice && matchesProductCategory
  })

  const sortedPool = [...pool]

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

  if (selectedSort.value === 'Price: Low to High') {
    return sortedPool.sort((left, right) => Number(left.price || 0) - Number(right.price || 0))
  }

  if (selectedSort.value === 'Price: High to Low') {
    return sortedPool.sort((left, right) => Number(right.price || 0) - Number(left.price || 0))
  }

  return sortedPool
})

const pagedMaterials = computed(() => filteredMaterials.value.slice(0, currentPage.value * pageSize))

const featuredCount = computed(() => filteredMaterials.value.length)

const activeTypeCount = computed(() => {
  return [
    selectedCategory.value !== 'All',
    selectedItemCategory.value !== 'All',
    selectedConditions.value.length !== conditionOptions.length,
    selectedRating.value > 0,
    searchQuery.value.trim().length > 0,
  ].filter(Boolean).length
})

// const uniqueUsers = computed(() => {
//   const userMap = new Map<string, { name: string; avatar: string; rating: number; itemsCount: number }>()
// 
//   liveMaterials.value.forEach((item) => {
//     if (item.seller && !userMap.has(item.seller)) {
//       userMap.set(item.seller, {
//         name: item.seller,
//         avatar: item.avatar || '',
//         rating: item.rating || 0,
//         itemsCount: 1,
//       })
//     } else if (item.seller) {
//       const user = userMap.get(item.seller)!
//       user.itemsCount += 1
//     }
//   })
// 
//   return Array.from(userMap.values())
// })

const filteredUsers = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()

  const filteredUserMap = new Map<string, { name: string; avatar: string; rating: number; itemsCount: number }>()

  filteredMaterials.value.forEach((item) => {
    if (!item.seller) {
      return
    }

    const key = item.seller
    const existing = filteredUserMap.get(key)

    if (!existing) {
      filteredUserMap.set(key, {
        name: item.seller,
        avatar: item.avatar || '',
        rating: item.rating || 0,
        itemsCount: 1,
      })
      return
    }

    existing.itemsCount += 1
    existing.rating = Math.max(existing.rating, item.rating || 0)
    if (!existing.avatar && item.avatar) {
      existing.avatar = item.avatar
    }
  })

  const users = Array.from(filteredUserMap.values())

  if (query.length === 0) {
    return users
  }

  return users.filter((user) => user.name.toLowerCase().includes(query))
})

const pagedUsers = computed(() => filteredUsers.value.slice(0, currentPage.value * pageSize))

const hasMoreMaterials = computed(() => pagedMaterials.value.length < filteredMaterials.value.length)

const hasMoreUsers = computed(() => pagedUsers.value.length < filteredUsers.value.length)

function resetPagination() {
  currentPage.value = 1
}

watch(
  [selectedCategory, selectedSort, selectedConditions, selectedRating, minPrice, maxPrice, searchQuery, browseType],
  resetPagination,
  { deep: true },
)

watch(
  [filteredMaterials, filteredUsers],
  () => {
    if (browseType.value === 'items' && currentPage.value * pageSize > filteredMaterials.value.length) {
      currentPage.value = Math.max(1, Math.ceil(filteredMaterials.value.length / pageSize))
    }

    if (browseType.value === 'users' && currentPage.value * pageSize > filteredUsers.value.length) {
      currentPage.value = Math.max(1, Math.ceil(filteredUsers.value.length / pageSize))
    }
  },
)

onMounted(async () => {
  await loadPosts()
  applyHeaderSearchFromRoute()
  await nextTick()
  observeFilterTriggerVisibility()
  observePagingSentinel()
  await nextTick()
})

watch(
  () => [route.query.q, route.query.type],
  () => {
    applyHeaderSearchFromRoute()
  },
)

onBeforeUnmount(() => {
  if (filterVisibilityObserver) {
    filterVisibilityObserver.disconnect()
    filterVisibilityObserver = null
  }

  if (pagingObserver) {
    pagingObserver.disconnect()
    pagingObserver = null
  }
  
})

watch(browseType, async () => {
  await nextTick()
  observeFilterTriggerVisibility()
})
</script>

<template>
  <div class="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.92),_rgba(247,247,250,0.96)_32%,_#f2f2f7_70%),linear-gradient(180deg,_#f5f5f9_0%,_#ffffff_22%,_#ffffff_100%)] text-[#15152d]">
    <Header />

    <main class="mx-auto w-[min(1500px,calc(100%-32px))] max-[768px]:w-[min(100%-20px,100%)]">
      <section class="px-2 pt-8 sm:px-0">
        <!-- Search Bar & Filter Button -->
        <div class="mx-auto flex max-w-[870px] items-center gap-3">
          <SearchBar
            :model-value="searchQuery"
            @update:model-value="searchQuery = $event"
          />
          <FilterButton
            v-if="browseType === 'items'"
            ref="filterTriggerRef"
            :active-type-count="activeTypeCount"
            @click="isFilterOpen = true"
          />
        </div>

        <!-- Browse Type Switcher -->
        <BrowseTypeSwitcher
          :browse-type="browseType"
          @update:browse-type="browseType = $event"
        />

        <!-- Item Categories (visual) -->
        <div v-if="browseType === 'items'" class="mt-4 mb-2">
          <CategoryStrip v-model="selectedItemCategory" :options="itemCategoryOptions" />
        </div>

        <!-- Filter Panel -->
        <FilterPanel
          v-if="browseType === 'items'"
          :is-open="isFilterOpen"
          :selected-category="selectedCategory"
          :selected-sort="selectedSort"
          :selected-conditions="selectedConditions"
          :selected-rating="selectedRating"
          :min-price="minPrice"
          :max-price="maxPrice"
          :price-upper-bound="priceUpperBound"
          :featured-count="featuredCount"
          :active-track-style="activeTrackStyle"
          @close="isFilterOpen = false"
          @update:selected-category="handleCategoryUpdate"
          @update:selected-sort="handleSortUpdate"
          @toggle-condition="toggleCondition"
          @update:selected-rating="selectedRating = $event"
          @update:min-price="minPrice = $event"
          @update:max-price="maxPrice = $event"
          @normalize-price-range="normalizePriceRange"
          @clear-filters="clearFilters"
        />

        <!-- Items View -->
        <div class="relative mt-6" v-if="browseType === 'items'">
          <MaterialsList
            :materials="pagedMaterials"
            :is-loading="hasMoreMaterials"
          />
          <div ref="pagingSentinelRef" />
        </div>

        <!-- Users View -->
        <div v-if="browseType === 'users'">
          <UsersList
            :users="pagedUsers"
            :is-loading="hasMoreUsers"
          />
          <div ref="pagingSentinelRef" />
        </div>

        <!-- Floating Filter Button -->
        <FilterButton
          v-show="browseType === 'items' && !isFilterOpen && !isFilterTriggerVisible"
          :active-type-count="activeTypeCount"
          :is-floating="true"
          @click="isFilterOpen = true"
        />
      </section>
    </main>

    <Footer />
  </div>
</template>

<style scoped>
/* Hide native scrollbar but keep horizontal scrolling available */
.category-scroll {
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
  padding-bottom: 8px; /* leave space for custom track */
}

/* WebKit browsers: hide scrollbar */
.category-scroll::-webkit-scrollbar {
  display: none;
  height: 0;
}

/* ensure arrow buttons sit above the content */
.category-scroll ~ button, .category-scroll + button { z-index: 20 }
</style>
