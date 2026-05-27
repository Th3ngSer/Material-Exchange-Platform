<script setup lang="ts">
defineProps({
  item: {
    type: Object,
    required: true
  }
})
</script>

<template>
  <div class="modern-card">
    <h3>{{ item.title }}</h3>
    <p>Price: ${{ item.price }}</p>
    <p>Type: {{ item.type }}</p>
    <p>Location: {{ item.location }}</p>
  </div>
</template>

<style scoped>
.modern-card {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 16px;
  background-color: white;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}
</style>
