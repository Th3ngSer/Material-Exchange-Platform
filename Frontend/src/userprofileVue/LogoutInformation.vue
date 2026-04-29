<template>
  <div class="logout-page">
    <Sidebar />

    <div class="content">
      <h2 class="title">Log Out</h2>
      <p>You are about to log out of your account.</p>

      <div class="actions">
        <button class="btn logout" @click="handleLogout">Log Out</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import Sidebar from '@/userprofileComponent/Sidebar.vue'

const router = useRouter()

const handleLogout = () => {
  // Clear stored user data
  localStorage.removeItem('profile')
  localStorage.removeItem('token') // if you store auth token

  // Redirect to login page
  router.push('/login')
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
  transition: background 0.3s ease;
}

.btn.logout:hover {
  background: #2a2566;
}
</style>