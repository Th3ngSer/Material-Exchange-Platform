<script setup lang="ts">
import DropDownMenu from './components/DropDownMenu.vue';
import Header from "./components/Header.vue";

onMounted(() => {
  authStore.initializeAuth()
})
</script>

<template>
  <router-view v-slot="{ Component }">
    <transition name="fade" mode="out-in">
      <component :is="Component" />
    </transition>
  </router-view>
</template>
