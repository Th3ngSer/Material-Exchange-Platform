<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const props = defineProps<{ initialLat?: number; initialLng?: number; initialLocation?: string }>()
const emit = defineEmits<{
  (e: 'select', payload: { lat: number; lng: number; location: string }): void
}>()

const mapRef = ref<HTMLDivElement | null>(null)
let map: L.Map | null = null
let marker: L.Marker | null = null

async function reverseGeocode(lat: number, lon: number) {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`
    const res = await fetch(url, { headers: { 'User-Agent': 'MaterialExchange/1.0' } })
    if (!res.ok) return ''
    const data = await res.json()

    const addr = data.address ?? {}

    // Prefer larger administrative unit (Khan / district)
    const khanCandidates = [addr.county, addr.district, addr.state, addr.region]
    const cityCandidates = [addr.city, addr.town, addr.state, addr.region]

    const districtRaw = String(khanCandidates.find(Boolean) || '')
    const cityRaw = String(cityCandidates.find(Boolean) || '')

    const stripPrefix = (s: string) => s.replace(/^(sangkat|khan)\s+/i, '').trim()

    const district = districtRaw ? stripPrefix(districtRaw) : ''
    const city = cityRaw ? stripPrefix(cityRaw) : ''

    if (district && city) return `${district}, ${city}`

    // Fallback: analyze display_name parts. Prefer a part that contains 'Khan' for district,
    // and pick a city-like part (e.g., Phnom Penh) for city.
    const display = data.display_name || ''
    if (display) {
      const parts: string[] = display.split(',').map((p: string) => p.trim()).filter(Boolean)
      // find explicit 'Khan' part
      const explicitKhan = parts.find((p: string) => /\bkhan\b/i.test(p))
      const explicitCity = parts.find((p: string) => /phnom penh|city|town/i.test(p))
      if (explicitKhan && explicitCity) return `${stripPrefix(explicitKhan)}, ${stripPrefix(explicitCity)}`

      // otherwise try last two meaningful parts, preferring second-last as district and last as city
      if (parts.length >= 2) {
        const candidateDistrict = stripPrefix(String(parts[parts.length - 2] || ''))
        const candidateCity = stripPrefix(String(parts[parts.length - 1] || ''))
        if (candidateDistrict && candidateCity) return `${candidateDistrict}, ${candidateCity}`
      }
      if (parts.length === 1) return stripPrefix(String(parts[0] || ''))
    }

    return ''
  } catch {
    return ''
  }
}

onMounted(async () => {
  if (!mapRef.value) return

  map = L.map(mapRef.value, { center: [props.initialLat ?? 11.5564, props.initialLng ?? 104.9282], zoom: 13 })

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
  }).addTo(map)

  const startLat = props.initialLat ?? 11.5564
  const startLng = props.initialLng ?? 104.9282

  marker = L.marker([startLat, startLng], { draggable: true }).addTo(map)

  marker.on('dragend', async () => {
    const pos = marker!.getLatLng()
    const loc = await reverseGeocode(pos.lat, pos.lng)
    emit('select', { lat: pos.lat, lng: pos.lng, location: loc })
  })

  map.on('click', async (e: L.LeafletMouseEvent) => {
    if (marker) marker.setLatLng(e.latlng)
    const loc = await reverseGeocode(e.latlng.lat, e.latlng.lng)
    emit('select', { lat: e.latlng.lat, lng: e.latlng.lng, location: loc })
  })

  // If initial coords were provided at mount, apply them now
  if (typeof props.initialLat === 'number' && typeof props.initialLng === 'number') {
    const loc = props.initialLocation ?? (await reverseGeocode(props.initialLat, props.initialLng))
    const latlng = L.latLng(props.initialLat, props.initialLng)
    marker.setLatLng(latlng)
    map.setView(latlng, map.getZoom())
    emit('select', { lat: props.initialLat, lng: props.initialLng, location: loc })
  }

  // Watch for prop changes (parent may restore draft after child mounted)
  watch(
    () => [props.initialLat, props.initialLng],
    async ([newLat, newLng]) => {
      if (typeof newLat === 'number' && typeof newLng === 'number' && map && marker) {
        const latlng = L.latLng(newLat, newLng)
        marker.setLatLng(latlng)
        map.setView(latlng, map.getZoom())
        const loc = props.initialLocation ?? (await reverseGeocode(newLat, newLng))
        emit('select', { lat: newLat, lng: newLng, location: loc })
      }
    },
  )
})

const stopWatch = watch(
  () => [props.initialLat, props.initialLng],
  async ([newLat, newLng]) => {
    if (typeof newLat === 'number' && typeof newLng === 'number' && map && marker) {
      const latlng = L.latLng(newLat, newLng)
      marker.setLatLng(latlng)
      map.setView(latlng, map.getZoom())

      const loc =
        props.initialLocation ??
        (await reverseGeocode(newLat, newLng))

      emit('select', {
        lat: newLat,
        lng: newLng,
        location: loc,
      })
    }
  },
)

onBeforeUnmount(() => {
  stopWatch()

  if (map) {
    map.remove()
  }

  map = null
  marker = null
})
</script>

<template>
  <div class="h-64 rounded-xl overflow-hidden border border-[#666565]">
    <div ref="mapRef" class="w-full h-full"></div>
  </div>
</template>

<style scoped>
.leaflet-container {
  height: 100%;
  width: 100%;
}
</style>
