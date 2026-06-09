<script setup lang="ts">
import { onMounted } from 'vue'
import { useLanguageStore } from './stores/language'
const languageStore = useLanguageStore()

// NOTE: initializeAuth() is already awaited in main.ts before the app mounts.
// Do NOT call it again here — a second call resets user to null mid-session.
onMounted(() => {
  languageStore.initializeLanguage()
})
</script>

<template>
  <div :class="languageStore.language === 'Khmer' ? 'font-khmer' : ''">
    <router-view />
  </div>
</template>
