<script setup lang="ts">
import { useLanguageStore } from '../../stores/language'

type Condition = 'New' | 'Like new' | 'Good' | 'Fair'
type Category = 'All' | 'Sell' | 'Exchange' | 'Borrow'
type SortOption = 'Newest' | 'A-Z' | 'Z-A' | 'Price: Low to High' | 'Price: High to Low'

interface Props {
  isOpen: boolean
  selectedCategory: Category
  selectedSort: SortOption
  selectedConditions: Condition[]
  selectedRating: number
  minPrice: number
  maxPrice: number
  priceUpperBound: number
  featuredCount: number
  activeTrackStyle: { left: string; width: string }
}

interface Emits {
  (e: 'close'): void
  (e: 'update:selectedCategory', value: string): void
  (e: 'update:selectedSort', value: string): void
  (e: 'toggle-condition', condition: Condition): void
  (e: 'update:selectedRating', value: number): void
  (e: 'update:minPrice', value: number): void
  (e: 'update:maxPrice', value: number): void
  (e: 'normalizePriceRange', source: 'min' | 'max'): void
  (e: 'clearFilters'): void
}

const categoryOptions: Category[] = ['All', 'Sell', 'Exchange', 'Borrow']
const sortOptions: SortOption[] = ['Newest', 'A-Z', 'Z-A', 'Price: Low to High', 'Price: High to Low']
const conditionOptions: Condition[] = ['New', 'Like new', 'Good', 'Fair']

const languageStore = useLanguageStore()

const categoryLabelMap: Record<Category, string> = {
  All: languageStore.t('all'),
  Sell: languageStore.t('buy'),
  Exchange: languageStore.t('exchange'),
  Borrow: languageStore.t('borrow'),
}

const conditionLabelMap: Record<Condition, string> = {
  New: languageStore.t('new'),
  'Like new': languageStore.t('likeNew'),
  Good: languageStore.t('good'),
  Fair: languageStore.t('fair'),
}

const sortOptionLabelMap: Record<SortOption, string> = {
  Newest: languageStore.t('newest'),
  'A-Z': languageStore.t('az'),
  'Z-A': languageStore.t('za'),
  'Price: Low to High': languageStore.t('priceLowToHigh'),
  'Price: High to Low': languageStore.t('priceHighToLow'),
}

defineProps<Props>()
defineEmits<Emits>()
</script>

<template>
  <transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="opacity-0 -translate-x-full"
    enter-to-class="opacity-100 translate-x-0"
    leave-active-class="transition duration-150 ease-in"
    leave-from-class="opacity-100 translate-x-0"
    leave-to-class="opacity-0 -translate-x-full"
  >
    <button
      v-if="isOpen"
      type="button"
      class="fixed inset-x-0 bottom-0 top-[66px] z-40 cursor-default bg-[#10112b73] backdrop-blur-[2px]"
      :aria-label="languageStore.t('closeFiltersBackdrop')"
      @click="$emit('close')"
    />
  </transition>

  <transition
    enter-active-class="transition duration-250 ease-out"
    enter-from-class="opacity-0 -translate-x-6"
    enter-to-class="opacity-100 translate-x-0"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="opacity-100 translate-x-0"
    leave-to-class="opacity-0 -translate-x-6"
  >
    <aside
      v-if="isOpen"
      class="fixed left-0 top-[66px] z-50 h-[calc(100vh-66px)] w-[min(100vw,430px)] overflow-y-auto border-r-2 border-r-[#2c2f8f] bg-[#efefef] p-6 shadow-[24px_0_80px_rgba(16,17,43,0.22)]"
    >
      <div class="mb-6 flex items-center justify-between border-b border-[#cfd2df] pb-3">
        <h2 class="text-4xl font-black leading-none text-[#0f1242]">{{ languageStore.t('filters') }}</h2>
        <button
          type="button"
          class="grid h-9 w-9 place-items-center rounded-md text-[#1b1748] transition hover:bg-[#e4e6f0]"
          :aria-label="languageStore.t('closeFilters')"
          @click="$emit('close')"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" class="h-4 w-4 fill-current">
            <path d="M18.3 5.71 12 12 5.7 5.7 4.3 7.1 10.6 13.4 4.3 19.7l1.4 1.4 6.3-6.3 6.3 6.3 1.4-1.4-6.3-6.3 6.3-6.3z" />
          </svg>
        </button>
      </div>

      <div class="space-y-7 pb-6">
        <!-- Price Range -->
        <div>
          <p class="mb-3 text-2xl font-black text-[#0f1242]">{{ languageStore.t('priceRange') }}</p>
          <div class="mb-3 grid grid-cols-2 gap-3">
            <label class="flex items-center gap-2 rounded-lg border border-[#d0d3df] bg-[#f5f5f5] px-3 py-2 text-sm text-[#24263f]">
              <span class="font-semibold">$</span>
              <input
                :value="minPrice"
                type="number"
                min="0"
                :max="priceUpperBound"
                class="w-full bg-transparent outline-none"
                :aria-label="languageStore.t('minimumPrice')"
                @input="$emit('update:minPrice', Number(($event.target as HTMLInputElement).value))"
                @blur="$emit('normalizePriceRange', 'min')"
              />
            </label>
            <label class="flex items-center gap-2 rounded-lg border border-[#d0d3df] bg-[#f5f5f5] px-3 py-2 text-sm text-[#24263f]">
              <span class="font-semibold">$</span>
              <input
                :value="maxPrice"
                type="number"
                min="0"
                :max="priceUpperBound"
                class="w-full bg-transparent outline-none"
                :aria-label="languageStore.t('maximumPrice')"
                @input="$emit('update:maxPrice', Number(($event.target as HTMLInputElement).value))"
                @blur="$emit('normalizePriceRange', 'max')"
              />
            </label>
          </div>
          <div class="relative h-7">
            <div class="absolute left-0 right-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-[#cfd3f3]"></div>
            <div class="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-[#1b1748]" :style="activeTrackStyle"></div>
            <input
              :value="minPrice"
              type="range"
              :min="0"
              :max="priceUpperBound"
              class="dual-range"
              :aria-label="languageStore.t('minimumPriceSlider')"
              @input="$emit('update:minPrice', Number(($event.target as HTMLInputElement).value))"
              @change="$emit('normalizePriceRange', 'min')"
            />
            <input
              :value="maxPrice"
              type="range"
              :min="0"
              :max="priceUpperBound"
              class="dual-range"
              :aria-label="languageStore.t('maximumPriceSlider')"
              @input="$emit('update:maxPrice', Number(($event.target as HTMLInputElement).value))"
              @change="$emit('normalizePriceRange', 'max')"
            />
          </div>
          <div class="mt-1 flex items-center justify-between text-xl font-black text-[#1b1748]">
            <span>${{ minPrice }}</span>
            <span>${{ maxPrice }}</span>
          </div>
        </div>

        <!-- Transaction Type -->
        <div>
          <p class="mb-3 text-2xl font-black text-[#0f1242]">{{ languageStore.t('transactionType') }}</p>
          <div class="flex flex-wrap gap-3">
            <button
              v-for="category in categoryOptions"
              :key="category"
              type="button"
              class="rounded-full px-4 py-2 text-sm font-semibold transition"
              :class="selectedCategory === category ? 'bg-[#1b1748] text-white shadow-[0_10px_20px_rgba(27,23,72,0.2)]' : 'bg-[#cfd3f3] text-[#3e4474] hover:bg-[#c2c8ef]'"
              @click="$emit('update:selectedCategory', category)"
            >
              {{ categoryLabelMap[category] }}
            </button>
          </div>
        </div>

        <!-- Conditions -->
        <div>
          <p class="mb-3 text-2xl font-black text-[#0f1242]">{{ languageStore.t('conditions') }}</p>
          <div class="grid grid-cols-2 gap-2">
            <label
              v-for="condition in conditionOptions"
              :key="condition"
              class="flex cursor-pointer items-center gap-2 rounded-lg border border-[#d0d3df] bg-[#f5f5f5] px-3 py-2 text-sm text-[#20204d] transition hover:bg-[#eceef8]"
            >
              <input
                type="checkbox"
                class="h-4 w-4 rounded border-[#c8cde8] text-[#1b1748] focus:ring-[#1b1748]"
                :checked="selectedConditions.includes(condition)"
                @change="$emit('toggle-condition', condition)"
              />
              {{ conditionLabelMap[condition] }}
            </label>
          </div>
        </div>

        <!-- Minimum Seller Rating -->
        <div>
          <p class="mb-3 text-2xl font-black text-[#0f1242]">{{ languageStore.t('minimumSellerRating') }}</p>
          <div class="flex items-center justify-between rounded-xl border border-[#d0d3df] bg-[#f5f5f5] px-4 py-3">
            <div class="flex items-center gap-1">
              <button
                v-for="star in 5"
                :key="star"
                type="button"
                class="grid h-5 w-5 place-items-center"
                @click="$emit('update:selectedRating', star)"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" class="h-4 w-4" :class="star <= selectedRating ? 'fill-[#f2b100]' : 'fill-[#c2c4ce]'">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </button>
            </div>
            <span class="text-sm font-semibold text-[#4f5575]">{{ selectedRating.toFixed(1) }} {{ languageStore.t('up') }}</span>
          </div>
        </div>

        <!-- Sort By -->
        <div>
          <p class="mb-3 text-2xl font-black text-[#0f1242]">{{ languageStore.t('sortBy') }}</p>
          <select
            :value="selectedSort"
            @change="$emit('update:selectedSort', ($event.target as HTMLSelectElement).value)"
            class="w-full rounded-xl border border-[#d0d3df] bg-[#f5f5f5] px-4 py-3 text-sm font-semibold text-[#1b1748] outline-none transition focus:border-[#1b1748]"
          >
            <option v-for="option in sortOptions" :key="option" :value="option">
              {{ sortOptionLabelMap[option] }}
            </option>
          </select>
        </div>

        <!-- Action Buttons -->
        <div class="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            class="rounded-lg bg-[#c9d5fb] px-5 py-2 text-sm font-bold text-[#2d3769] transition hover:bg-[#bccbfb]"
            @click="$emit('clearFilters')"
          >
            {{ languageStore.t('reset') }}
          </button>
          <button
            type="button"
            class="rounded-lg bg-[#1b1748] px-6 py-2 text-sm font-bold text-white transition hover:bg-[#242163]"
            @click="$emit('close')"
          >
            {{ featuredCount }} {{ languageStore.t('results') }}
          </button>
        </div>
      </div>
    </aside>
  </transition>
</template>

<style scoped>
.dual-range {
  position: absolute;
  inset: 0;
  width: 100%;
  margin: 0;
  background: transparent;
  pointer-events: none;
  -webkit-appearance: none;
  appearance: none;
}

.dual-range::-webkit-slider-runnable-track {
  height: 4px;
  background: transparent;
}

.dual-range::-webkit-slider-thumb {
  pointer-events: auto;
  width: 18px;
  height: 18px;
  border: 0;
  border-radius: 9999px;
  background: #1b1748;
  -webkit-appearance: none;
  appearance: none;
  cursor: pointer;
  margin-top: -7px;
  box-shadow: 0 0 0 2px #efefef;
}

.dual-range::-moz-range-track {
  height: 4px;
  background: transparent;
}

.dual-range::-moz-range-thumb {
  pointer-events: auto;
  width: 18px;
  height: 18px;
  border: 0;
  border-radius: 9999px;
  background: #1b1748;
  cursor: pointer;
  box-shadow: 0 0 0 2px #efefef;
}
</style>
