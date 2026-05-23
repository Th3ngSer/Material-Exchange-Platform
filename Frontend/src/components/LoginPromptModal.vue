<script setup lang="ts">
import { useLanguageStore } from '../stores/language'
const emit = defineEmits(['login', 'close'])
const languageStore = useLanguageStore()
</script>

<template>
  <div class="modal-overlay">
    <div class="modal">
      <h3>{{ languageStore.t('loginRequired') }}</h3>
      <p>{{ languageStore.t('loginPromptMessage') }}</p>
      <div class="actions">
        <button class="btn primary" @click="emit('login')">{{ languageStore.t('login') }}</button>
        <button class="btn" @click="emit('close')">{{ languageStore.t('cancel') }}</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}
.modal {
  background: white;
  padding: 1.25rem;
  border-radius: 8px;
  width: 320px;
  box-shadow: 0 6px 18px rgba(0,0,0,0.12);
}
.actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1rem;
}
.btn {
  padding: 0.5rem 0.75rem;
  border: 1px solid #cbd5e1;
  background: white;
  border-radius: 6px;
  cursor: pointer;
}
.btn.primary {
  background: #2563eb;
  color: white;
  border-color: #2563eb;
}
</style>
