<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'

const props = withDefaults(defineProps<{
  options?: string[]
  modelValue?: string
}>(), {
  options: () => ['All', 'Clothing', 'Electronics', 'Books', 'Furniture', 'Sports', 'Toys', 'Vehicles', 'Home & Garden', 'Food & Drink', 'Others'],
  modelValue: 'All',
})

const emit = defineEmits(['update:modelValue'])

const wrapperRef = ref<HTMLElement | null>(null)
const showLeft = ref(false)
const showRight = ref(false)

function updateScrollButtons() {
  const el = wrapperRef.value
  if (!el) return
  showLeft.value = el.scrollLeft > 10
  showRight.value = el.scrollWidth - el.clientWidth - el.scrollLeft > 10
}

function scrollRight(amount?: number) {
  const el = wrapperRef.value
  if (!el) return
  const step = amount ?? Math.floor(el.clientWidth * 0.6)
  el.scrollBy({ left: step, behavior: 'smooth' })
}

function scrollLeft(amount?: number) {
  const el = wrapperRef.value
  if (!el) return
  const step = amount ?? Math.floor(el.clientWidth * 0.6)
  el.scrollBy({ left: -step, behavior: 'smooth' })
}

onMounted(() => {
  updateScrollButtons()
  const el = wrapperRef.value
  if (!el) return
  el.addEventListener('scroll', updateScrollButtons, { passive: true })
  const ro = new ResizeObserver(updateScrollButtons)
  ro.observe(el)
  ;(el as any).__ro = ro
})

onBeforeUnmount(() => {
  const el = wrapperRef.value
  if (!el) return
  el.removeEventListener('scroll', updateScrollButtons)
  const ro = (el as any).__ro
  if (ro) ro.disconnect()
})

watch(() => props.modelValue, () => {
  // ensure buttons update when selected changes externally
  updateScrollButtons()
})
</script>

<template>
  <div class="mx-auto relative w-[min(870px,100%)]">
    <div
      ref="wrapperRef"
      class="flex gap-3 overflow-x-auto py-2 category-scroll"
      role="list"
      aria-label="Item categories"
    >
      <div class="flex gap-3 items-center" style="padding-inline: 8px;">
        <button
          v-for="cat in props.options"
          :key="cat"
          type="button"
          role="listitem"
          class="rounded-full px-4 py-2 text-sm font-semibold transition whitespace-nowrap"
          :class="props.modelValue === cat ? 'bg-[#1b1748] text-white shadow-[0_10px_20px_rgba(27,23,72,0.2)]' : 'bg-[#cfd3f3] text-[#3e4474] hover:bg-[#c2c8ef]'"
          @click="$emit('update:modelValue', cat)"
        >
          {{ cat }}
        </button>
      </div>
    </div>

    <button
      v-show="showLeft"
      @click="scrollLeft()"
      class="absolute left-0 top-1/2 -translate-y-1/2 z-20 ml-1 rounded-full bg-white/90 p-1 shadow-md hover:bg-white"
      aria-label="Scroll categories left"
    >
      <svg class="h-5 w-5 text-[#1b1748]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
    </button>

    <button
      v-show="showRight"
      @click="scrollRight()"
      class="absolute right-0 top-1/2 -translate-y-1/2 z-20 mr-1 rounded-full bg-white/90 p-1 shadow-md hover:bg-white"
      aria-label="Scroll categories right"
    >
      <svg class="h-5 w-5 text-[#1b1748]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>
    </button>
  </div>
</template>

<style scoped>
.category-scroll {
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
  padding-bottom: 8px;
}

.category-scroll::-webkit-scrollbar {
  display: none;
  height: 0;
}
</style>
