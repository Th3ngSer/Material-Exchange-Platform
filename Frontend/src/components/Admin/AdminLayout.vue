<script setup lang="ts">
import { computed, onErrorCaptured, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import LogoutConfirmModal from './LogoutConfirmModal.vue'

const navItems = [
  { label: 'Dashboard', to: '/admin' },
  { label: 'Users', to: '/admin/users' },
  { label: 'Listings', to: '/admin/listings' },
  { label: 'Transactions', to: '/admin/transactions' },
  { label: 'Reports', to: '/admin/reports' },
  { label: 'Activity', to: '/admin/activity' },
  { label: 'Settings', to: '/admin/settings', badge: 'New' },
]

const route = useRoute()
const currentPath = computed(() => route.path)

const isActive = (path: string) => {
  if (path === '/admin') {
    return currentPath.value === '/admin'
  }
  return currentPath.value === path
}

const authStore = useAuthStore()
const router = useRouter()

const showLogoutModal = ref(false)
const runtimeError = ref<string | null>(null)

const handleLogout = () => {
  showLogoutModal.value = true
}

const confirmLogout = () => {
  authStore.logout()
  router.push('/home')
}

const reloadPage = () => {
  window.location.reload()
}

onErrorCaptured((error) => {
  runtimeError.value = error instanceof Error ? error.message : String(error)
  return false
})
</script>

<template>
  <div class="admin-shell">
    <aside class="admin-sidebar">
      <nav class="nav">
        <router-link
          v-for="item in navItems"
          :key="item.label"
          class="nav-item"
          :class="{ active: isActive(item.to) }"
          :to="item.to"
        >
          {{ item.label }}
          <span v-if="item.badge" class="nav-badge">{{ item.badge }}</span>
        </router-link>
      </nav>
      <button class="logout" @click="handleLogout">Log out</button>
    </aside>

    <main class="admin-main">
      <section v-if="runtimeError" class="error-panel">
        <h2>Something went wrong</h2>
        <p>{{ runtimeError }}</p>
        <button class="reload" type="button" @click="reloadPage">Reload page</button>
      </section>
      <slot v-else />
    </main>

    <div class="ambient">
      <div class="glow one"></div>
      <div class="glow two"></div>
    </div>

    <LogoutConfirmModal
      :is-open="showLogoutModal"
      @close="showLogoutModal = false"
      @confirm="confirmLogout"
    />
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap');

.admin-shell {
  min-height: 100vh;
  display: flex;
  background: radial-gradient(circle at top left, #fff5e1 0%, #f7f0ff 32%, #edf3ff 70%);
  color: #0f172a;
  position: relative;
  overflow: hidden;
}

.admin-sidebar {
  background: linear-gradient(180deg, #0b1026 0%, #1c1f46 50%, #15142d 100%);
  color: #f8fafc;
  padding: 32px 24px;
  display: flex;
  flex-direction: column;
  gap: 32px;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 260px;
  overflow-y: auto;
  z-index: 1;
}

.nav {
  display: grid;
  gap: 12px;
}

.nav-item {
  padding: 10px 14px;
  border-radius: 10px;
  color: #d6e0ff;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s ease;
  background: transparent;
}

.nav-item:hover,
.nav-item.active {
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
}

.nav-badge {
  display: inline-block;
  margin-left: 8px;
  padding: 1px 7px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.04em;
  background: #ff9f1c;
  color: #fff;
  vertical-align: middle;
}

.logout {
  margin-top: auto;
  padding: 10px 14px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: transparent;
  color: #f8fafc;
  cursor: pointer;
}

.admin-main {
  padding: 40px clamp(24px, 4vw, 56px) 64px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  overflow-y: auto;
  height: 100vh;
  margin-left: 260px;
  width: calc(100% - 260px);
  z-index: 1;
}

.error-panel {
  background: #ffffff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 16px 30px rgba(15, 23, 42, 0.1);
  border: 1px solid rgba(148, 163, 184, 0.35);
}

.error-panel h2 {
  margin: 0 0 8px;
  font-size: 20px;
}

.error-panel p {
  margin: 0 0 16px;
  color: #475569;
  font-size: 14px;
}

.reload {
  border: none;
  border-radius: 10px;
  padding: 10px 14px;
  background: #1d4ed8;
  color: #ffffff;
  font-weight: 600;
  cursor: pointer;
}

.ambient {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.glow {
  position: absolute;
  width: 280px;
  height: 280px;
  border-radius: 50%;
  filter: blur(0px);
  opacity: 0.35;
  animation: float 12s ease-in-out infinite;
}

.glow.one {
  background: radial-gradient(circle, #ff9f1c, transparent 70%);
  top: -60px;
  right: 120px;
}

.glow.two {
  background: radial-gradient(circle, #6c63ff, transparent 70%);
  bottom: -80px;
  left: 220px;
  animation-delay: -4s;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(18px);
  }
}

@media (max-width: 1024px) {
  .admin-shell {
    height: auto;
    overflow: visible;
  }

  .admin-sidebar {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    height: auto;
    position: relative;
    width: 100%;
    left: auto;
    bottom: auto;
  }

  .nav {
    grid-auto-flow: column;
    grid-template-columns: repeat(4, auto);
    overflow-x: auto;
    padding-bottom: 8px;
  }

  .logout {
    margin-top: 0;
  }

  .admin-main {
    overflow: visible;
    height: auto;
    margin-left: 0;
    width: 100%;
  }
}
</style>
