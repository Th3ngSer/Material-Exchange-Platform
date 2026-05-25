<template>
  <div class="notifications-container">
    <div class="notifications-header">
      <h1>{{ languageStore.t('notifications') }}</h1>
    </div>
    <div class="notifications-content">
      <div class="empty-state">
        <p>{{ languageStore.t('noNotifications') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useLanguageStore } from '@/stores/language'

const languageStore = useLanguageStore()
</script>

<style scoped>
.notifications-container {
  min-height: 100vh;
  max-width: 1500px;
  margin: 0 auto;
  padding: 20px;
}

.notifications-header {
  margin-bottom: 30px;
}

.notifications-header h1 {
  font-size: 32px;
  font-weight: bold;
  color: #201f62;
}

.notifications-content {
  background: white;
  border-radius: 8px;
  padding: 40px;
}

.empty-state {
  text-align: center;
  color: #7b7c98;
}

.empty-state p {
  font-size: 16px;
}
</style>
