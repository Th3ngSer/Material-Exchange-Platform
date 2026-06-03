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
const isSidebarOpen = ref(false)

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}

const closeSidebar = () => {
  isSidebarOpen.value = false
}

const handleLogout = () => {
  showLogoutModal.value = true
  closeSidebar()
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
    <!-- Sticky Mobile Header -->
    <header class="admin-mobile-header">
      <div class="brand-logo mobile-logo">
        <span class="logo-text">Do<span>O</span>rt</span>
      </div>
      <button class="menu-toggle" @click="toggleSidebar" aria-label="Toggle Navigation">
        <svg v-if="!isSidebarOpen" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="toggle-icon">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="toggle-icon">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </header>

    <!-- Overlay backdrop for mobile menu drawer -->
    <Transition name="fade">
      <div v-if="isSidebarOpen" class="sidebar-overlay" @click="closeSidebar"></div>
    </Transition>

    <aside class="admin-sidebar" :class="{ 'is-open': isSidebarOpen }">
      <div class="brand-logo desktop-logo">
        <span class="logo-text">Do<span>O</span>rt</span>
      </div>
      <nav class="nav">
        <router-link
          v-for="item in navItems"
          :key="item.label"
          class="nav-item"
          :class="{ active: isActive(item.to) }"
          :to="item.to"
          @click="closeSidebar"
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

/* Mobile Header CSS */
.admin-mobile-header {
  display: none;
  background: linear-gradient(135deg, #0b1026 0%, #1c1f46 100%);
  color: #f8fafc;
  padding: 0 20px;
  align-items: center;
  justify-content: space-between;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 64px;
  z-index: 99;
  box-shadow: 0 4px 20px rgba(11, 16, 38, 0.15);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.menu-toggle {
  background: transparent;
  border: none;
  color: #f8fafc;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  border-radius: 8px;
  transition: background-color 0.2s;
}

.menu-toggle:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.toggle-icon {
  width: 24px;
  height: 24px;
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
  z-index: 100;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.brand-logo {
  display: flex;
  align-items: center;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo-text {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 38px;
  font-weight: 700;
  letter-spacing: -0.5px;
  cursor: pointer;
}

.logo-text span {
  color: #ff9f1c;
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
  transition: background-color 0.2s, border-color 0.2s;
}

.logout:hover {
  background-color: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.4);
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

.sidebar-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  z-index: 98;
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

/* Vue Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 1024px) {
  .admin-mobile-header {
    display: flex;
  }

  .desktop-logo {
    display: none;
  }

  .mobile-logo {
    padding-bottom: 0;
    border-bottom: none;
  }

  .logo-text {
    font-size: 28px;
  }

  .admin-sidebar {
    transform: translateX(-100%);
    box-shadow: 10px 0 30px rgba(0, 0, 0, 0.25);
  }

  .admin-sidebar.is-open {
    transform: translateX(0);
  }

  .admin-main {
    margin-left: 0;
    width: 100%;
    padding-top: 88px; /* 64px header + 24px gap */
    height: auto;
  }
}
</style>
