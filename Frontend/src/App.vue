<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from './stores/auth'
import { useLanguageStore } from './stores/language'

const authStore = useAuthStore()
const languageStore = useLanguageStore()

onMounted(async () => {
  await authStore.initializeAuth()
  languageStore.initializeLanguage()
})
</script>

<template>
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 2f8f04c44fa119f9ff2edba5efad48e9b12ffdaa
  <div :class="languageStore.language === 'Khmer' ? 'font-khmer' : ''">
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
<<<<<<< HEAD
=======
  <router-view v-slot="{ Component }">
    <transition name="fade" mode="out-in">
      <component :is="Component" />
    </transition>
  </router-view>
>>>>>>> SRENG_Panha
=======
>>>>>>> 2f8f04c44fa119f9ff2edba5efad48e9b12ffdaa
</template>
