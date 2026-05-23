<template>
  <div class="logout-page">
    <Sidebar />

    <div class="content">
      <h2 class="title">{{ languageStore.t('logout') }}</h2>
      <p>{{ languageStore.t('logoutDescription') }}</p>

      <div class="actions">
        <button class="btn logout" @click="showModal = true">
          {{ languageStore.t('logout') }}
        </button>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="modal-overlay">
      <div class="modal">
        <h3>{{ languageStore.t('confirmLogout') }}</h3>

        <p>
          {{ languageStore.t('confirmLogoutMessage') }}
        </p>

        <div class="modal-actions">
          <button class="cancel-btn" @click="showModal = false">
            {{ languageStore.t('cancel') }}
          </button>

          <button class="confirm-btn" @click="handleLogout">
            {{ languageStore.t('logout') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Sidebar from '../userprofileComponent/Sidebar.vue'
import { useLanguageStore } from '../stores/language'
import { useAuthStore } from '@/stores/auth'

const languageStore = useLanguageStore()
const authStore = useAuthStore()
const router = useRouter()

const showModal = ref(false)

const handleLogout = () => {
  authStore.logout()
  router.replace('/login')
}
</script>

<style scoped>
.logout-page {
  display: flex;
  min-height: 100vh;
}

.content {
  flex: 1;
  padding: 32px;
  font-size: 14px;
}

.title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 16px;
}

.actions {
  margin-top: 24px;
}

.btn.logout {
  padding: 12px 24px;
  border: none;
  border-radius: 4px;
  font-weight: bold;
  background: #1e1b4b;
  color: white;
  cursor: pointer;
}

.btn.logout:hover {
  background: #2a2566;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);

  display: flex;
  justify-content: center;
  align-items: center;

  z-index: 1000;
}

.modal {
  background: white;
  padding: 24px;
  border-radius: 12px;
  width: 320px;
  text-align: center;
}

.modal h3 {
  margin-bottom: 12px;
}

.modal p {
  margin-bottom: 20px;
}

.modal-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
}

.cancel-btn,
.confirm-btn {
  padding: 10px 18px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.cancel-btn {
  background: #cbd5e1;
}

.confirm-btn {
  background: #1e1b4b;
  color: white;
}
</style>