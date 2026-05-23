<script setup lang="ts">
defineProps<{ selectedCategory: string }>()
import { useLanguageStore } from '../../stores/language'
const languageStore = useLanguageStore()

const emit = defineEmits<{
  (e: 'update:category', value: string): void
}>()

// Category icons (images loaded via import.meta.url for robust paths)
const categoryIcons = [
  { label: 'Clothing', src: new URL('../../assets/images/Clothing.png', import.meta.url).href },
  { label: 'Electronics', src: new URL('../../assets/images/Electronics.png', import.meta.url).href },
  { label: 'Books', src: new URL('../../assets/images/Books.png', import.meta.url).href },
  { label: 'Furniture', src: new URL('../../assets/images/Furniture.png', import.meta.url).href },
  { label: 'Sports', src: new URL('../../assets/images/Sports.png', import.meta.url).href },
  { label: 'Toys', src: new URL('../../assets/images/Toys.png', import.meta.url).href },
  { label: 'Vehicles', src: new URL('../../assets/images/Vehicles.png', import.meta.url).href },
  { label: 'Home & Garden', src: new URL('../../assets/images/Home & Garden.png', import.meta.url).href },
  { label: 'Food & Drink', src: new URL('../../assets/images/Food & Drink.png', import.meta.url).href },
  { label: 'Others', src: new URL('../../assets/images/Others.png', import.meta.url).href },
]

function selectCategory(label: string) {
  emit('update:category', label)
}
</script>

<template>

  <div class="w-full py-6">
   
    <div class="mx-auto w-[min(1500px,calc(100%-32px))]">
        <h2
            class="m-0 font-serif text-[clamp(2.4rem,5vw,4rem)] leading-[0.95] tracking-[-0.06em] text-[#15152d] mb-10"
        >
            {{ languageStore.t('categories') }} 
        </h2>     
      <div class="flex justify-center">
        <div class="icon-marquee w-full overflow-hidden">
          <div class="marquee-track flex gap-10 items-center">
            <div class="flex items-center gap-10">
              <div v-for="cat in categoryIcons" :key="'a-'+cat.label" class="flex flex-col items-center gap-3 shrink-0">
                <button
                  class="rounded-full bg-transparent p-5 hover:scale-105 transition-transform duration-200 cursor-pointer"
                  @click="selectCategory(cat.label)"
                >
                  <img :src="cat.src" :alt="cat.label" class="w-14 h-14 md:w-16 md:h-16 object-contain" />
                </button>
                <span class="text-base font-semibold text-[#15152d]">{{ cat.label }}</span>
              </div>
            </div>

            <!-- duplicate for seamless loop -->
            <div class="flex items-center gap-10" aria-hidden="true">
              <div v-for="cat in categoryIcons" :key="'b-'+cat.label" class="flex flex-col items-center gap-3 shrink-0">
                <button class="rounded-full bg-transparent p-5">
                  <img :src="cat.src" :alt="cat.label" class="w-14 h-14 md:w-16 md:h-16 object-contain" />
                </button>
                <span class="text-base font-semibold text-[#15152d]">{{ cat.label }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.icon-marquee {
  position: relative;
}
.marquee-track {
  display: flex;
  gap: 3rem;
  align-items: center;
  animation: scroll-left 22s linear infinite;
  min-width: 200%;
}
.marquee-track:hover {
  animation-play-state: paused;
}
@keyframes scroll-left {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}
.marquee-track .shrink-0 { flex-shrink: 0; }
.marquee-track [aria-hidden="true"] button { pointer-events: none; }
.marquee-track { position: relative; }
.marquee-track > div[aria-hidden="true"] { z-index: 0; opacity: 0.98; }
.marquee-track > div:first-child { z-index: 1; }
</style>
