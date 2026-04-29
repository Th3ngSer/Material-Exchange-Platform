<script setup lang="ts">
/**
 * Home Page / Dashboard
 * Placeholder page that shows after successful authentication
 */

import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const handleLogout = () => {
  authStore.logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <div class="home-page">
    <nav class="navbar">
      <div class="navbar-container">
        <h1>Material Xchange Platform</h1>
        <button v-if="authStore.isAuthenticated" @click="handleLogout" class="logout-button">
          Logout
        </button>
      </div>
    </nav>

    <main class="main-content">
      <div class="welcome-section">
        <h2>Welcome to Material Xchange Platform</h2>
        <p v-if="authStore.isAuthenticated">
          Logged in as: <strong>{{ authStore.user?.email }}</strong>
        </p>
        <p v-else>
          Please <RouterLink to="/login">login</RouterLink> or
          <RouterLink to="/signup">sign up</RouterLink> to get started.
        </p>
      </div>
    </main>
  </div>
</template>

<style scoped>
.home-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.navbar {
  background-color: #ffffff;
  border-bottom: 1px solid #e0e0e0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 0;
}

.navbar-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.navbar h1 {
  margin: 0;
  font-size: 1.5rem;
  color: #333;
}

.logout-button {
  padding: 0.5rem 1rem;
  background-color: #e74c3c;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.3s;
}

.logout-button:hover {
  background-color: #c0392b;
}

.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.welcome-section {
  background-color: #ffffff;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.welcome-section h2 {
  margin-top: 0;
  color: #333;
  font-size: 2rem;
}

.welcome-section p {
  color: #666;
  font-size: 1.1rem;
  margin-bottom: 1rem;
}

.welcome-section a {
  color: #4a90e2;
  text-decoration: none;
  font-weight: 500;
}

.welcome-section a:hover {
  text-decoration: underline;
}
</style>
