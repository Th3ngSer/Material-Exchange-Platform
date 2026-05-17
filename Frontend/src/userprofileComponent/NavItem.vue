<template>
  <div class="nav-item">
    <img v-if="icon" :src="icon" alt="icon" class="nav-icon" />
    <span>{{ label }}</span>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  props: {
    label: String,
    icon: String,
  },
})
</script>

<style scoped>
.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  cursor: pointer;
  border-radius: 8px;
  color: #cbd5e1;
  transition:
    background 0.2s,
    color 0.2s;
}

/* Hover effect */
.nav-item:hover {
  background: rgba(255, 255, 255, 0.08);
  color: white;
}

.nav-icon {
  width: 20px;
  height: 20px;
  object-fit: contain;
}
</style>
