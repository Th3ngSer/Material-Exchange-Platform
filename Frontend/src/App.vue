<script setup lang="ts">
/**
 * Main App Component
 * Initializes authentication on app mount
 */

import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

// Initialize auth state when app mounts
onMounted(() => {
  authStore.initializeAuth()
})
</script>

<template>
  <RouterView />
</template>

<style scoped></style>
