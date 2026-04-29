<script setup lang="ts">
import DropDownMenu from './components/DropDownMenu.vue';

</script>

<template>
  <router-view v-slot="{ Component }">
    <transition name="fade" mode="out-in">
      <component :is="Component" />
    </transition>
  </router-view>
</template>

<script setup lang="ts">
import Header from "./components/Header.vue"
</script>
