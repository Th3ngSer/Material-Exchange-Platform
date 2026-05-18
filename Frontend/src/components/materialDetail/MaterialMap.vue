<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const props = defineProps<{
  lat: number | undefined
  lng: number | undefined
  location?: string
}>()

const mapContainer = ref<HTMLDivElement | null>(null)
const mapError = ref('')

let gmap: any = null
let gmarker: any = null
let lmap: L.Map | null = null
let lmarker: L.Marker | null = null

function hasCoordinates() {
  return typeof props.lat === 'number' && typeof props.lng === 'number'
}

function viewInGoogleMapsUrl() {
  if (!hasCoordinates()) return '#'
  return `https://www.google.com/maps/search/?api=1&query=${props.lat},${props.lng}`
}

async function initMap() {
  if (!mapContainer.value) return
  if (!hasCoordinates()) return

  // cleanup
  if (gmarker) try { gmarker.setMap(null) } catch {}
  gmap = null
  if (lmarker) try { lmarker.remove() } catch {}
  if (lmap) try { lmap.remove() } catch {}
  lmap = null
  lmarker = null

  const coords = { lat: props.lat!, lng: props.lng! }
  const apiKey = String(import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '')

  if (apiKey) {
    try {
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

      gmarker = new (window as any).google.maps.Marker({ position: coords, map: gmap })
      mapError.value = ''
      return
    } catch (err: any) {
      const msg = `Failed to load Google Maps: ${err?.message || err}`
      console.error(msg, err)
      mapError.value = msg
    }
  }

  // Leaflet fallback
  try {
    const leafletCoords: [number, number] = [props.lat!, props.lng!]
    lmap = L.map(mapContainer.value as HTMLElement, { center: leafletCoords, zoom: 13 })
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap contributors' }).addTo(lmap)

    lmarker = L.marker(leafletCoords, {
      icon: L.icon({
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
      })
    }).addTo(lmap)

    mapError.value = ''
  } catch (err: any) {
    const msg = `Failed to load Leaflet: ${err?.message || err}`
    console.error(msg, err)
    mapError.value = msg
  }
}

onMounted(() => {
  initMap()
})

watch(() => [props.lat, props.lng], () => {
  setTimeout(() => initMap(), 0)
})

onBeforeUnmount(() => {
  if (gmarker) try { gmarker.setMap(null) } catch {}
  gmap = null
  if (lmarker) try { lmarker.remove() } catch {}
  if (lmap) try { lmap.remove() } catch {}
  lmap = null
  lmarker = null
})
</script>

<template>
  <div class="space-y-2">
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
</template>
