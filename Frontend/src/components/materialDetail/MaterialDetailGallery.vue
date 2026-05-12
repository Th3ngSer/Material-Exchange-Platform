<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'

const props = defineProps<{
  title: string
  images: string[]
  badge: string
}>()

const activeIndex = ref(0)
const isViewerOpen = ref(false)

watch(
  () => props.images,
  () => {
    activeIndex.value = 0
  },
)

const hasMultipleImages = computed(() => props.images.length > 1)
const activeImage = computed(() => props.images[activeIndex.value] ?? '')
const thumbnailImages = computed(() => props.images.slice(1, 3))
const hiddenImages = computed(() => props.images.slice(3))
const remainingCount = computed(() => Math.max(props.images.length - 3, 0))

function selectImage(index: number) {
  activeIndex.value = index
}

function openViewer(index = activeIndex.value) {
  activeIndex.value = index
  isViewerOpen.value = true
}

function closeViewer() {
  isViewerOpen.value = false
}

function showPreviousImage() {
  if (!props.images.length) return
  activeIndex.value = (activeIndex.value - 1 + props.images.length) % props.images.length
}

function showNextImage() {
  if (!props.images.length) return
  activeIndex.value = (activeIndex.value + 1) % props.images.length
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    closeViewer()
    return
  }

  if (event.key === 'ArrowLeft') {
    showPreviousImage()
    return
  }

  if (event.key === 'ArrowRight') {
    showNextImage()
  }
}

watch(isViewerOpen, opened => {
  if (opened) {
    window.addEventListener('keydown', handleKeydown)
    return
  }

  window.removeEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <section class="rounded-[28px] border border-white/70 bg-white p-4 shadow-[0_24px_80px_rgba(20,24,66,0.08)] ring-1 ring-[#20235f10]">
    <div class="overflow-hidden rounded-[24px] bg-[#f3f5fb] p-4">
      <div
        class="relative overflow-hidden rounded-[18px] bg-[#eef1f9]"
        :class="hasMultipleImages ? 'aspect-[16/9]' : 'aspect-[16/10]'"
      >
        <img
          v-if="activeImage"
          :src="activeImage"
          :alt="title"
          class="h-full w-full cursor-zoom-in object-cover"
          @click="openViewer()"
        />
        <div v-else class="grid h-full place-items-center bg-gradient-to-br from-[#eef1f9] to-[#d8deef] text-[#7a7f9a]">
          No image available
        </div>

        <div class="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.28em] text-[#23216e] shadow-sm backdrop-blur">
          {{ images.length }} photos
        </div>
      </div>

      <div
        v-if="hasMultipleImages"
        class="mt-3 grid gap-3"
        :class="remainingCount > 0 ? 'grid-cols-[1fr_1fr_0.7fr]' : 'grid-cols-[1fr_1fr]'"
      >
        <button
          v-for="(image, index) in thumbnailImages"
          :key="`${image}-${index + 1}`"
          type="button"
          class="overflow-hidden rounded-2xl border-2 transition"
          :class="activeIndex === index + 1 ? 'border-[#23216e]' : 'border-transparent opacity-75 hover:opacity-100'"
          @click="selectImage(index + 1); openViewer(index + 1)"
        >
          <img :src="image" :alt="`${title} preview ${index + 2}`" class="h-40 w-full object-cover" />
        </button>

        <button
          v-if="remainingCount > 0"
          type="button"
          class="grid h-40 place-items-center rounded-2xl border border-dashed border-[#d6d8ea] bg-[#f5f7fc] text-center text-sm font-semibold text-[#7b7f99] transition hover:border-[#23216e] hover:text-[#23216e]"
          @click="openViewer(hiddenImages.length > 0 ? 3 : 0)"
        >
          <div>
            <div class="text-2xl font-black text-[#23216e]">+{{ remainingCount }}</div>
            <div>More</div>
          </div>
        </button>
      </div>
    </div>
  </section>

  <teleport to="body">
    <div
      v-if="isViewerOpen && activeImage"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      @click.self="closeViewer"
    >
      <div class="relative w-full max-w-[96vw]">
        <button
          v-if="hasMultipleImages"
          type="button"
          class="absolute left-[-0.75rem] top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white text-2xl font-black text-[#1b1748] shadow-lg transition hover:bg-[#f3f5fb]"
          @click="showPreviousImage"
          aria-label="Previous image"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-chevron-left"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M15 6l-6 6l6 6" /></svg>
        </button>

        <button
          type="button"
          class="absolute -right-1 -top-1 z-10 grid h-10 w-10 place-items-center rounded-full bg-white text-2xl font-black text-[#1b1748] shadow-lg transition hover:bg-[#f3f5fb]"
          @click="closeViewer"
          aria-label="Close image viewer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-x"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M18 6l-12 12" /><path d="M6 6l12 12" /></svg>
        </button>

        <img
          :src="activeImage"
          :alt="title"
          class="max-h-[90vh] w-full rounded-[24px] object-contain shadow-[0_30px_100px_rgba(0,0,0,0.4)]"
        />

        <button
          v-if="hasMultipleImages"
          type="button"
          class="absolute right-[-0.75rem] top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white text-2xl font-black text-[#1b1748] shadow-lg transition hover:bg-[#f3f5fb]"
          @click="showNextImage"
          aria-label="Next image"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-chevron-right"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M9 6l6 6l-6 6" /></svg>
        </button>
      </div>
    </div>
  </teleport>
</template>