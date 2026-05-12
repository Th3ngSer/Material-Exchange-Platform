<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const navItems = [
  { label: 'Dashboard', to: '/admin' },
  { label: 'Users', to: '/admin/users' },
  { label: 'Listings', to: '/admin/listings' },
  { label: 'Transactions', to: '/admin/transactions' },
  { label: 'Reports', to: '/admin/reports' },
  { label: 'Activity', to: '/admin/activity' },
  { label: 'Notifications', to: '/admin/notifications' },
  { label: 'Chat Monitoring', to: '/admin/chat' },
  { label: 'Reviews', to: '/admin/reviews' },
  { label: 'Settings', to: '/admin/settings' },
]

const activities = [
  {
    title: 'New user registered',
    subtitle: 'yagami@gmail.com',
    category: 'User',
    time: '1 min ago',
  },
  {
    title: 'Listing created',
    subtitle: 'Industrial Pressure Washer by Yagami',
    category: 'Listings',
    time: '15 min ago',
  },
  {
    title: 'Report submitted',
    subtitle: 'Fake listing flagged by Yagami Devithhan',
    category: 'Report',
    time: '30 min ago',
  },
  {
    title: 'Listing removed',
    subtitle: 'Expired: Old Scaffolding Set',
    category: 'Listings',
    time: '1 hrs ago',
  },
  {
    title: 'User suspended',
    subtitle: 'spam_bot_123 - multiple violations',
    category: 'User',
    time: '2 hrs ago',
  },
  {
    title: 'Borrow request accepted',
    subtitle: "Emily Davis accepted Tom Wilson's request",
    category: 'Transaction',
    time: '3 hrs ago',
  },
  {
    title: 'Exchange request accepted',
    subtitle: "Emily Davis accepted Tom Wilson's request",
    category: 'Transaction',
    time: '4 hrs ago',
  },
  {
    title: 'Listing updated',
    subtitle: 'CNC Machine price changed by Sarah Chen',
    category: 'Listings',
    time: '5 hrs ago',
  },
]

const route = useRoute()
const currentPath = computed(() => route.path)

const isActive = (path: string) => {
  if (path === '/admin') {
    return currentPath.value === '/admin'
  }
  return currentPath.value === path
}
</script>

<template>
  <div class="admin-shell">
    <aside class="admin-sidebar">
      <div class="brand">
        <span class="brand-mark">Do</span>
        <span class="brand-mark accent">Ot</span>
      </div>
      <nav class="nav">
        <router-link
          v-for="item in navItems"
          :key="item.label"
          class="nav-item"
          :class="{ active: isActive(item.to) }"
          :to="item.to"
        >
          {{ item.label }}
        </router-link>
      </nav>
      <button class="logout">Log out</button>
    </aside>

    <main class="admin-main">
      <header class="admin-topbar">
        <div class="topbar-left">
          <div class="topbar-icon"></div>
          <div>
            <p class="topbar-label">Admin Panel</p>
            <h1>Activity Log</h1>
            <p class="subtitle">Monitor all platform events</p>
          </div>
        </div>
        <div class="topbar-user">
          <span class="topbar-role">Admin</span>
          <div class="avatar"></div>
        </div>
      </header>

      <section class="activity-panel">
        <div class="activity-list">
          <article v-for="item in activities" :key="item.title" class="activity-row">
            <div class="activity-icon" :class="item.category.toLowerCase()"></div>
            <div class="activity-content">
              <div class="activity-main">
                <div>
                  <p class="activity-title">{{ item.title }}</p>
                  <p class="activity-subtitle">{{ item.subtitle }}</p>
                </div>
                <span class="activity-category">{{ item.category }}</span>
              </div>
              <span class="activity-time">{{ item.time }}</span>
            </div>
          </article>
        </div>
      </section>
    </main>

    <div class="ambient">
      <div class="glow one"></div>
      <div class="glow two"></div>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap');

:root {
  font-family: 'Space Grotesk', 'Segoe UI', sans-serif;
}

.admin-shell {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 260px 1fr;
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
  z-index: 1;
}

.brand {
  font-size: 24px;
  font-weight: 700;
  letter-spacing: -0.03em;
}

.brand-mark.accent {
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
  z-index: 1;
}

.admin-topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  padding: 10px 0 18px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.4);
}

.topbar-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.topbar-icon {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  background: linear-gradient(140deg, #3b3b98, #1e1b4b);
  position: relative;
}

.topbar-icon::after {
  content: '';
  position: absolute;
  inset: 10px;
  border: 2px solid rgba(255, 255, 255, 0.8);
  border-radius: 6px;
}

.topbar-label {
  text-transform: uppercase;
  letter-spacing: 0.2em;
  font-size: 10px;
  color: #64748b;
  margin: 0 0 4px;
}

.admin-topbar h1 {
  font-size: clamp(24px, 3vw, 34px);
  margin: 0 0 6px;
}

.subtitle {
  color: #64748b;
  font-size: 12px;
  margin: 0;
}

.topbar-user {
  display: flex;
  align-items: center;
  gap: 12px;
}

.topbar-role {
  font-size: 12px;
  color: #64748b;
}

.avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, #ffd29c, #ff7a18);
  border: 2px solid #fff;
  box-shadow: 0 8px 16px rgba(15, 23, 42, 0.2);
}

.activity-panel {
  background: rgba(255, 255, 255, 0.92);
  border-radius: 18px;
  padding: 18px;
  box-shadow: 0 16px 30px rgba(15, 23, 42, 0.08);
}

.activity-list {
  display: grid;
  gap: 12px;
}

.activity-row {
  display: grid;
  grid-template-columns: 42px 1fr;
  gap: 14px;
  align-items: center;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 12px 14px;
  background: #fff;
}

.activity-icon {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: #0f172a;
  position: relative;
}

.activity-icon::after {
  content: '';
  position: absolute;
  inset: 12px;
  border-radius: 6px;
  border: 2px solid rgba(255, 255, 255, 0.8);
}

.activity-icon.user {
  background: #1d4ed8;
}

.activity-icon.listings {
  background: #0f766e;
}

.activity-icon.report {
  background: #ea580c;
}

.activity-icon.transaction {
  background: #7c3aed;
}

.activity-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.activity-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  flex: 1;
}

.activity-title {
  font-weight: 600;
  margin: 0 0 4px;
}

.activity-subtitle {
  color: #64748b;
  font-size: 12px;
  margin: 0;
}

.activity-category {
  font-size: 12px;
  font-weight: 600;
  color: #0f172a;
  background: #f1f5f9;
  padding: 4px 10px;
  border-radius: 999px;
}

.activity-time {
  font-size: 12px;
  color: #64748b;
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
    grid-template-columns: 1fr;
  }

  .admin-sidebar {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
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
}

@media (max-width: 720px) {
  .admin-topbar {
    flex-direction: column;
    align-items: flex-start;
  }

  .activity-row {
    grid-template-columns: 1fr;
  }

  .activity-content,
  .activity-main {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
