<script setup lang="ts">
import chairImage from '@/assets/images/vergilChair.webp'

type Tone = 'gold' | 'orange' | 'rose'

defineProps<{
  item: {
    title: string
    price: string
    location: string
    category: string
    tone: Tone
    seller?: string
    rating?: number
    avatar?: string
  }
}>()
</script>

<template>
  <div class="flex flex-col rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white w-[320px] h-[420px] border border-gray-300">
    <!-- Top Section with Badge and Image -->
    <div class="relative bg-gray-100 p-6 h-[230px] flex items-center justify-center">
      <!-- For Sale Badge -->
      <div 
        class="absolute top-3 left-3 text-white px-3 py-1 rounded-lg text-sm font-bold"
        :style="{
          backgroundColor: item.category === 'Sell' ? '#FF5A5A' : item.category === 'Exchange' ? '#FF8C00' : '#0B6F61'
        }"
      >
        {{ item.category === 'Sell' ? 'For Sale' : item.category }}
      </div>
      
      <!-- Product Image -->
      <img
        :src="chairImage"
        alt="Product item"
        class="h-full w-full object-contain"
      />
    </div>

    <!-- Bottom Section with Info -->
    <div class="bg-[#23216e] text-white p-5 flex flex-col flex-1">
      <!-- Title and Price -->
      <div class="flex justify-between items-start mb-3">
        <h3 class="text-lg font-bold leading-tight flex-1">{{ item.title }}</h3>
        <span v-if="item.category === 'Sell'" class="text-2xl font-bold text-right ml-2">${{ item.price }}</span>
      </div>

      <!-- Location -->
      <div class="flex items-center gap-2 text-sm text-gray-300 mb-4">
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
        </svg>
        {{ item.location }}
      </div>

      <!-- Divider -->
      <div class="border-t border-gray-600 my-3"></div>

      <!-- Seller Info -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <!-- Avatar -->
          <div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm overflow-hidden">
            <img 
              v-if="item.avatar"
              :src="item.avatar" 
              alt="Seller"
              class="w-full h-full object-cover"
            />
            <span v-else>{{ item.seller?.[0]?.toUpperCase() || 'U' }}</span>
          </div>
          
          <!-- Seller Name -->
          <span class="text-sm font-medium">{{ item.seller || 'Unknown' }}</span>
        </div>

        <!-- Rating -->
        <div class="flex items-center gap-1">
          <span class="text-sm font-bold">{{ item.rating || '5.0' }}</span>
          <svg class="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </div>
      </div>
    </div>
  </div>
</template>