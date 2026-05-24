<!-- <script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from './stores/auth'
import { useLanguageStore } from './stores/language'

const authStore = useAuthStore()
const languageStore = useLanguageStore()

onMounted(async () => {
  await authStore.initializeAuth()
  languageStore.initializeLanguage()
})
</script> -->

<template>
<<<<<<< HEAD
  <div :class="languageStore.language === 'Khmer' ? 'font-khmer' : ''">
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
=======
  <router-view v-slot="{ Component }">
    <transition name="fade" mode="out-in">
      <component :is="Component" />
    </transition>
  </router-view>
>>>>>>> SRENG_Panha
</template>

<script setup lang="ts">
import Header from "./components/Header.vue"
</script>
