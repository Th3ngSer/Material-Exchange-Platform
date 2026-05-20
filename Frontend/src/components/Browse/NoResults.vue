<script setup lang="ts">
interface Props {
  type?: 'items' | 'users'
  message?: string
  description?: string
}

withDefaults(defineProps<Props>(), {
  type: 'items',
  message: 'No Results found',
  description: 'We couldn\'t find what you searched for. Try searching again.'
})
</script>

<template>
  <div class="text-center py-12">
    <!-- 404 Image -->
    <div class="mb-8 flex justify-center">
      <img
        src="@/assets/images/404.png"
        :alt="message"
        class="max-w-md w-full h-auto"
      />
    </div>

    <!-- Title -->
    <h1 v-if="type === 'users'" class="text-4xl font-extrabold text-[#1a1660] mb-2">404</h1>
    <h2 class="text-2xl font-bold text-[#1a1660] mb-4">{{ message }}</h2>

    <!-- Description -->
    <p class="text-gray-500 text-base mb-8">
      {{ description }}
    </p>

    <!-- Slot for additional content like buttons -->
    <slot />
  </div>
</template>
