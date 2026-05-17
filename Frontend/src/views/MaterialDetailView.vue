<script setup lang="ts">
import { computed, ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import Footer from '@/components/layout/Footer.vue'
import Header from '@/components/layout/Header.vue'
import MaterialDetailGallery from '@/components/materialDetail/MaterialDetailGallery.vue'
import MaterialDetailSellerCard from '@/components/materialDetail/MaterialDetailSellerCard.vue'
import RelatedMaterialCard from '@/components/materialDetail/MaterialCard.vue'
import { defaultMaterials, getMaterialById, type MaterialItem, type MaterialTone } from '@/data/materials'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

let gmap: any = null
let marker: any = null
let lmap: L.Map | null = null
let lmarker: L.Marker | null = null

const route = useRoute()
const router = useRouter()
const activeTab = ref<'description' | 'specifications' | 'reviews'>('description')

// Scroll to top when route ID changes
watch(
  () => route.params.id,
  () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  },
)

const currentPost = computed<MaterialItem>(() => {
  const id = Number(route.params.id)
  return (Number.isFinite(id) ? getMaterialById(id) : undefined) ?? defaultMaterials[0]!
})

const reviews = [
  { name: 'Erica Rodriguez', rating: 5, text: 'The listing matched the photos and pickup was smooth.' },
  { name: 'Julian Chen', rating: 4.8, text: 'Clear communication and a fast response from the seller.' },
  { name: 'Mina Patel', rating: 5, text: 'Good quality item with a clean handoff experience.' },
]

function titleCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function formatPrice(post: MaterialItem) {
  if (post.category === 'Exchange') return 'Open to trade'
  if (post.category === 'Borrow') return post.price ? `$${Number(post.price || 0).toFixed(2)}/day` : 'Open to borrow'
  return `$${Number(post.price || 0).toFixed(2)}`
}

function formatRelativeTime(dateString?: string) {
  if (!dateString) return 'Recently listed'

  const createdAt = new Date(dateString).getTime()
  const difference = Date.now() - createdAt
  const minutes = Math.floor(difference / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (minutes < 60) return `${Math.max(minutes, 1)} minute${minutes === 1 ? '' : 's'} ago`
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`
  return `${days} day${days === 1 ? '' : 's'} ago`
}

const galleryImages = computed(() => currentPost.value.images ?? [])

const relatedCardItems = computed(() =>
  defaultMaterials
    .filter(post => post.id !== currentPost.value.id)
    .slice(0, 4)
    .map((post, index) => ({
      id: post.id,
      title: post.title,
      price: formatPrice(post),
      location: post.location,
      category: post.category,
      tone: post.tone as MaterialTone,
      seller: post.seller || 'Marketplace seller',
      rating: post.rating ?? 4.9,
      avatar: post.avatar,
      images: post.images,
      postedTime: post.postedTime,
    })),
)

const detailStats = computed(() => [
  { label: 'Condition', value: currentPost.value.condition ?? 'Used' },
  { label: 'Category', value: currentPost.value.category },
  { label: 'Location', value: currentPost.value.location },
  { label: 'Listed', value: formatRelativeTime(currentPost.value.postedTime) },
])

const mapContainer = ref<HTMLDivElement | null>(null)

const hasCoordinates = computed(() => {
  return typeof currentPost.value.lat === 'number' && typeof currentPost.value.lng === 'number'
})

const mapError = ref('')

function viewInGoogleMapsUrl() {
  if (!hasCoordinates.value) return '#'
  return `https://www.google.com/maps/search/?api=1&query=${currentPost.value.lat},${currentPost.value.lng}`
}

async function initMapGoogle() {
  if (!mapContainer.value) return
  if (!hasCoordinates.value) return

  // Clean up existing maps
  if (gmap) {
    try {
      marker?.setMap(null)
    } catch (e) {
      // ignore
    }
    gmap = null
  }
  if (lmap) {
    try {
      lmarker?.remove()
      lmap.remove()
    } catch (e) {
      // ignore
    }
    lmap = null
    lmarker = null
  }

  const apiKey = String(import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '')
  const coords = { lat: currentPost.value.lat!, lng: currentPost.value.lng! }

  // Try Google Maps if API key exists
  if (apiKey) {
    try {
      // Load Google Maps library dynamically
      const mapsScript = document.createElement('script')
      mapsScript.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&v=weekly`
      
      await new Promise<void>((resolve, reject) => {
        mapsScript.onload = () => resolve()
        mapsScript.onerror = () => reject(new Error('Failed to load Google Maps script'))
        document.head.appendChild(mapsScript)
      })

      gmap = new (window as any).google.maps.Map(mapContainer.value as HTMLElement, {
        center: coords,
        zoom: 13,
        disableDefaultUI: false,
      })

      marker = new (window as any).google.maps.Marker({ position: coords, map: gmap })
      mapError.value = ''
      return
    } catch (err: any) {
      const msg = `Failed to load Google Maps: ${err?.message || err}`
      console.error(msg, err)
      mapError.value = msg
    }
  }

  // Fallback to Leaflet/OpenStreetMap
  console.info('Using Leaflet/OpenStreetMap as fallback (no Google Maps API key)')
  try {
    const leafletCoords: [number, number] = [coords.lat, coords.lng]

    lmap = L.map(mapContainer.value as HTMLElement, {
      center: leafletCoords,
      zoom: 13,
      scrollWheelZoom: false,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(lmap)

    // Use Leaflet's built-in marker with fixed icons from CDN
    lmarker = L.marker(leafletCoords, {
      icon: L.icon({
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      }),
    }).addTo(lmap)
    
    mapError.value = ''
  } catch (err: any) {
    const msg = `Failed to load Leaflet: ${err?.message || err}`
    console.error(msg, err)
    mapError.value = msg
  }
}
onMounted(() => {
  // init on mount
  initMapGoogle()
})

watch(
  () => route.params.id,
  () => {
    // re-init when route changes
    setTimeout(() => initMapGoogle(), 0)
  },
)

onBeforeUnmount(() => {
  if (marker) {
    try {
      marker.setMap(null)
    } catch (e) {
      // ignore
    }
    marker = null
  }
  gmap = null

  if (lmarker) {
    try {
      lmarker.remove()
    } catch (e) {
      // ignore
    }
    lmarker = null
  }
  if (lmap) {
    try {
      lmap.remove()
    } catch (e) {
      // ignore
    }
    lmap = null
  }
})
</script>

<template>
  <div class="min-h-screen bg-white text-[#17173d]">
    <Header />

    <main class="mx-auto w-[min(1440px,calc(100%-32px))] px-0 pb-16 pt-8 sm:px-2 lg:px-4">
      <!-- Back Button -->
      <button
        type="button"
        @click="router.back()"
        class="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[#999] transition hover:text-[#1b1748]"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-chevron-left"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M15 6l-6 6l6 6" /></svg>
        Back
      </button>

      <section class="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
        <!-- Left: Image Gallery -->
        <MaterialDetailGallery
          :title="currentPost.title"
          :images="galleryImages"
          badge="1 PHOTOS"
          subtitle="Fast pickup and exchange ready"
        />

        <!-- Right: Product Details -->
        <div class="flex flex-col gap-6">
          <!-- Status Badge -->
          <div class="inline-block w-fit rounded-full bg-[#31d07f] px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#0f3d25]">
            {{ currentPost.category === 'Sell' ? 'AVAILABLE' : currentPost.category === 'Exchange' ? 'EXCHANGE' : 'BORROW' }}
          </div>

          <!-- Title & Subtitle -->
          <div>
            <h1 class="text-4xl font-black text-[#1b1748]">{{ currentPost.title }}</h1>
            <p class="mt-2 text-sm text-[#999]">{{ formatRelativeTime(currentPost.postedTime) }}</p>
          </div>

          <!-- Price -->
          <div class="text-4xl font-black text-[#1b1748]">{{ formatPrice(currentPost) }}</div>

          <!-- Action Button (shows only the relevant action per category) -->
          <div>
            <template v-if="currentPost.category === 'Sell'">
              <button type="button" class="rounded-lg bg-[#1b1748] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#29255f]">
                Buy now
              </button>
            </template>

            <template v-else-if="currentPost.category === 'Exchange'">
              <button type="button" class="rounded-lg border-2 border-[#ff8c00] bg-[#fff6ef] px-4 py-3 text-sm font-bold text-[#ff8c00] transition hover:bg-orange-50">
                Contact to exchange
              </button>
            </template>

            <template v-else>
              <button type="button" class="rounded-lg border-2 border-[#17173d]/20 bg-white px-4 py-3 text-sm font-bold text-[#17173d] transition hover:bg-gray-50">
                Contact to borrow
              </button>
            </template>
          </div>

          <!-- Stats Grid (2x2) -->
          <div class="grid gap-3 sm:grid-cols-2">
            <div v-for="stat in detailStats" :key="stat.label" class="rounded-lg bg-[#f5f5f5] px-4 py-3">
              <p class="text-xs font-bold uppercase tracking-wider text-[#999]">{{ stat.label }}</p>
              <p class="mt-2 text-sm font-bold text-[#1b1748]">{{ stat.value }}</p>
            </div>
          </div>

          <!-- Seller Card -->
          <MaterialDetailSellerCard
            :name="currentPost.seller ?? 'Marketplace seller'"
            :rating="currentPost.rating ?? 4.9"
            response-time="Usually replies in 1 hour"
            :location="currentPost.location"
            :avatar="currentPost.avatar"
          />
        </div>
      </section>

      <section class="mt-12">
        <!-- Tabs Section -->
        <div class="border-b border-[#e5e5e5] pb-4">
          <div class="flex gap-6 text-sm font-semibold">
            <button
              type="button"
              class="pb-3 transition"
              :class="activeTab === 'description' ? 'border-b-2 border-[#1b1748] text-[#1b1748]' : 'text-[#999] hover:text-[#666]'"
              @click="activeTab = 'description'"
            >
              Description
            </button>
            <button
              type="button"
              class="pb-3 transition"
              :class="activeTab === 'specifications' ? 'border-b-2 border-[#1b1748] text-[#1b1748]' : 'text-[#999] hover:text-[#666]'"
              @click="activeTab = 'specifications'"
            >
              Specifications
            </button>
            <button
              type="button"
              class="pb-3 transition"
              :class="activeTab === 'reviews' ? 'border-b-2 border-[#1b1748] text-[#1b1748]' : 'text-[#999] hover:text-[#666]'"
              @click="activeTab = 'reviews'"
            >
              Reviews ({{ reviews.length }})
            </button>
          </div>
        </div>

        <!-- Tab Content -->
        <div class="mt-6 grid gap-8 lg:grid-cols-3">
          <div class="lg:col-span-2">
            <template v-if="activeTab === 'description'">
              <h2 class="text-2xl font-black text-[#1b1748]">{{ currentPost.title }}</h2>
              <p class="mt-4 text-base leading-relaxed text-[#666]">
                {{ currentPost.description }}
              </p>
            </template>

            <template v-else-if="activeTab === 'specifications'">
              <h2 class="text-2xl font-black text-[#1b1748]">Specifications</h2>
              <ul class="mt-4 space-y-3 text-base leading-relaxed text-[#666]">
                <li class="flex justify-between border-b border-[#f0f0f0] pb-3">
                  <span class="font-semibold">Category:</span>
                  <span>{{ currentPost.category }}</span>
                </li>
                <li class="flex justify-between border-b border-[#f0f0f0] pb-3">
                  <span class="font-semibold">Condition:</span>
                  <span>{{ titleCase(currentPost.condition ?? 'Used') }}</span>
                </li>
                <li class="flex justify-between border-b border-[#f0f0f0] pb-3">
                  <span class="font-semibold">Location:</span>
                  <span>{{ currentPost.location }}</span>
                </li>
                <li v-if="currentPost.exchangeFor" class="flex justify-between border-b border-[#f0f0f0] pb-3">
                  <span class="font-semibold">Exchange target:</span>
                  <span>{{ currentPost.exchangeFor }}</span>
                </li>
                <li class="flex justify-between">
                  <span class="font-semibold">Posted:</span>
                  <span>{{ formatRelativeTime(currentPost.postedTime) }}</span>
                </li>
              </ul>
            </template>

            <template v-else>
              <h2 class="text-2xl font-black text-[#1b1748]">Customer Reviews</h2>
              <div class="mt-6 space-y-4">
                <article v-for="review in reviews" :key="review.name" class="rounded-lg border border-[#f0f0f0] p-4">
                  <div class="flex items-center justify-between">
                    <h3 class="font-bold text-[#1b1748]">{{ review.name }}</h3>
                    <span class="text-sm font-semibold text-[#ff8c00]">{{ review.rating.toFixed(1) }} ★</span>
                  </div>
                  <p class="mt-2 text-sm leading-6 text-[#666]">{{ review.text }}</p>
                </article>
              </div>
            </template>
          </div>

          <!-- Location Map -->
          <div class="rounded-lg bg-[#e8f4f7] p-4">
            <div class="flex items-center justify-between rounded-full bg-white px-3 py-2 text-xs font-semibold text-[#1f245e] shadow-sm mb-3">
              <span>{{ currentPost.location }}</span>
              <span>{{ formatRelativeTime(currentPost.postedTime) }}</span>
            </div>

            <div class="relative min-h-[300px] overflow-hidden rounded-lg bg-[#eef6f8]">
              <div v-if="hasCoordinates" class="space-y-2">
                <div v-if="mapError" class="h-[300px] flex items-center justify-center text-center px-4 bg-red-50 rounded-lg">
                  <div>
                    <p class="text-sm font-semibold text-[#b33131]">{{ mapError }}</p>
                    <p class="text-xs text-[#6b7280] mt-2">Check browser console for more details.</p>
                  </div>
                </div>
                <div v-else ref="mapContainer" class="h-[300px] w-full rounded-lg"></div>
                <div class="text-right">
                  <a :href="viewInGoogleMapsUrl()" target="_blank" rel="noopener" class="text-sm font-semibold text-[#1b1748]">Open in Google Maps</a>
                </div>
              </div>
              <div v-else class="flex h-[300px] items-center justify-center">
                <div class="text-[#6b7280] text-lg font-semibold">Map unavailable for this listing</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Related Listings Section -->
      <section class="mt-16">
        <div class="mb-8 flex items-center justify-between">
          <div>
            <p class="text-xs font-semibold uppercase tracking-widest text-[#999]">Related listings</p>
            <h2 class="mt-2 text-3xl font-black text-[#1b1748]">More materials you may like</h2>
          </div>
          <a href="#" class="text-sm font-semibold text-[#ff8c00] no-underline transition hover:text-[#e67e00]">
            View category →
          </a>
        </div>

        <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <RelatedMaterialCard
            v-for="card in relatedCardItems"
            :key="card.id"
            :item="card"
          />
        </div>
      </section>
    </main>

    <Footer />
  </div>
</template>