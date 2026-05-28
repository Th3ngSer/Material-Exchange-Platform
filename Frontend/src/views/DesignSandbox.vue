<script setup lang="ts">
import MaterialCard from '@/components/HomeView/MaterialCard.vue' // The Old One
import MaterialCardModern from '@/components/HomeView/MaterialCardModern.vue' // The New One

// Mock data to test with
const testItem = {
  id: '1',
  title: 'Calculus Early Transcendentals 9th Edition',
  price: '45',
  type: 'Sell' as const,
  location: 'ITC Library',
  tone: 'gold' as const,
  postedTime: new Date().toISOString(),
  images: ['https://via.placeholder.com/300/e2e8f0/64748b?text=Book'],
  seller: 'Lythong',
  rating: 4.8
}
</script>

<template>
  <div class="min-h-screen bg-gray-100 p-10 flex flex-col items-center">
    <h1 class="text-2xl font-bold mb-10">Component Design Sandbox</h1>
    
    <div class="flex gap-10">
      <div>
        <h2 class="text-center font-semibold mb-4 text-gray-500">Current Design</h2>
        <MaterialCard :item="testItem" />
      </div>

      <div>
        <h2 class="text-center font-semibold mb-4 text-blue-500">New Design Prototype</h2>
        <MaterialCardModern :item="testItem" />
      </div>
    </div>
  </div>
</template>