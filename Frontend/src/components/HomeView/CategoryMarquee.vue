<script setup lang="ts">
defineProps<{ selectedCategory: string }>()
import { useLanguageStore } from '../../stores/language'
import type { TranslationKey } from '../../stores/language'
const languageStore = useLanguageStore()

const emit = defineEmits<{
  (e: 'update:category', value: string): void
}>()

type CategoryIcon = {
  value: string
  labelKey: TranslationKey
  src: string
}

// Category icons (images loaded via import.meta.url for robust paths)
const categoryIcons: CategoryIcon[] = [
  { value: 'Clothing', labelKey: 'clothing', src: new URL('../../assets/images/Clothing.png', import.meta.url).href },
  { value: 'Electronics', labelKey: 'electronics', src: new URL('../../assets/images/Electronics.png', import.meta.url).href },
  { value: 'Books', labelKey: 'books', src: new URL('../../assets/images/Books.png', import.meta.url).href },
  { value: 'Furniture', labelKey: 'furniture', src: new URL('../../assets/images/Furniture.png', import.meta.url).href },
  { value: 'Sports', labelKey: 'sports', src: new URL('../../assets/images/Sports.png', import.meta.url).href },
  { value: 'Toys', labelKey: 'toys', src: new URL('../../assets/images/Toys.png', import.meta.url).href },
  { value: 'Vehicles', labelKey: 'vehicles', src: new URL('../../assets/images/Vehicles.png', import.meta.url).href },
  { value: 'Home & Garden', labelKey: 'homeAndGarden', src: new URL('../../assets/images/Home & Garden.png', import.meta.url).href },
  { value: 'Food & Drink', labelKey: 'foodAndDrink', src: new URL('../../assets/images/Food & Drink.png', import.meta.url).href },
  { value: 'Others', labelKey: 'other', src: new URL('../../assets/images/Others.png', import.meta.url).href },
]

function selectCategory(label: string) {
  emit('update:category', label)
}
</script>

<template>

  <div class="w-full py-6" :class="{ 'font-khmer': languageStore.isKhmer }">
   
    <div class="mx-auto w-[min(1500px,calc(100%-32px))]">
        <h2
            class="m-0 font-serif text-[clamp(2.4rem,5vw,4rem)] leading-[0.95] tracking-[-0.06em] text-[#15152d] mb-10"
        >
            {{ languageStore.t('categories') }} 
        </h2>     
      <div class="flex justify-center">
        <div class="icon-marquee w-full overflow-hidden">
          <div class="marquee-track flex gap-12 items-center">
            <div class="flex items-center gap-12">
              <div v-for="cat in categoryIcons" :key="'a-'+cat.value" class="flex flex-col items-center gap-3 flex-none w-[7rem] md:w-[8rem]">
                <button
                  class="rounded-full bg-transparent p-5 hover:scale-105 transition-transform duration-200 cursor-pointer"
                  @click="selectCategory(cat.value)"
                >
                  <img :src="cat.src" :alt="languageStore.t(cat.labelKey)" class="w-14 h-14 md:w-16 md:h-16 object-contain" />
                </button>
                <span class="text-base font-semibold text-center text-[#15152d] whitespace-normal break-words">{{ languageStore.t(cat.labelKey) }}</span>
              </div>
            </div>

            <!-- duplicate for seamless loop -->
            <div class="flex items-center gap-12" aria-hidden="true">
              <div v-for="cat in categoryIcons" :key="'b-'+cat.value" class="flex flex-col items-center gap-3 flex-none w-[7rem] md:w-[8rem]">
                <button class="rounded-full bg-transparent p-5">
                  <img :src="cat.src" :alt="languageStore.t(cat.labelKey)" class="w-14 h-14 md:w-16 md:h-16 object-contain" />
                </button>
                <span class="text-base font-semibold text-center text-[#15152d] whitespace-normal break-words">{{ languageStore.t(cat.labelKey) }}</span>
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
