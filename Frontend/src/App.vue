<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from './stores/auth'
import { useLanguageStore } from './stores/language'

const authStore = useAuthStore()
const languageStore = useLanguageStore()

onMounted(() => {
  authStore.initializeAuth()
  languageStore.initializeLanguage()
})
</script>

<template>
  <div :class="languageStore.language === 'Khmer' ? 'font-khmer' : ''">
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>
