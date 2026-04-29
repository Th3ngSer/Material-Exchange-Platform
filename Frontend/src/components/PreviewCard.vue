<script setup lang="ts">
import { computed } from 'vue'

type PreviewImage = File | string

type PreviewData = {
  title?: string
  description?: string
  images?: PreviewImage[]
}

const props = defineProps<{ data: PreviewData }>()

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

const images = computed(() =>
  (props.data.images ?? []).map((image) => {
    if (typeof image === 'string') {
      return image.startsWith('http') ? image : `${apiBaseUrl}/uploads/${image}`
    }

    return URL.createObjectURL(image)
  }),
)
</script>

<template>
  <div class="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
    <div v-if="images.length" class="grid grid-cols-2 gap-2">
      <img
        v-for="(image, index) in images"
        :key="`${image}-${index}`"
        :src="image"
        class="h-28 w-full rounded-xl object-cover"
        :class="index === 0 ? 'col-span-2 h-56' : ''"
      />
    </div>
    <div v-else class="flex h-40 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
      No images selected
    </div>

    <div>
      <h2 class="text-lg font-semibold text-slate-900">{{ data.title || 'Product Title' }}</h2>
      <p class="mt-1 text-sm text-slate-600">{{ data.description || 'Description...' }}</p>
    </div>
  </div>
</template>
