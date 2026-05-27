<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

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

const dashboardStats = ref({
  totalUsers: 0,
  activeListings: 0,
  totalTransactions: 0,
})

const healthStatus = ref<'connected' | 'disconnected' | 'unknown'>('unknown')
const healthMessage = ref('')

const velocityBars = [42, 58, 72, 48, 64, 78, 90]

const categoryMix = [
  { label: 'Sell', value: 48, color: '#ff7a18' },
  { label: 'Exchange', value: 32, color: '#3b82f6' },
  { label: 'Borrow', value: 20, color: '#0f172a' },
]

const activityFeed = [
  { title: 'New listing approved', meta: 'By Nara L. on 2 mins ago', tag: 'Listing' },
  { title: 'Dispute resolved', meta: 'By Admin Team on 12 mins ago', tag: 'Resolution' },
  { title: 'High-risk flag', meta: 'Auto-detected 25 mins ago', tag: 'Risk' },
  { title: 'Payment cleared', meta: 'Order #A3F2 on 33 mins ago', tag: 'Payment' },
]

const reviewQueue = [
  { item: 'Studio chair set', owner: 'K. Thom', price: '$140', status: 'Live' },
  { item: 'Projector 4K', owner: 'S. Vana', price: '$220', status: 'Pending' },
  { item: 'Portable AC', owner: 'M. Dara', price: '$90', status: 'Live' },
  { item: 'Standing desk', owner: 'R. Sok', price: '$210', status: 'Review' },
]

const riskFlags = [
  { title: 'Chargeback spike', detail: 'West region +18%', level: 'High' },
  { title: 'Account takeover', detail: '3 alerts in 1 hour', level: 'High' },
  { title: 'Delayed payouts', detail: '6 vendors pending', level: 'Medium' },
]

const isLoading = ref(false)
const errorMessage = ref('')

const formatStat = (value: number) => (isLoading.value ? '...' : value.toLocaleString())

const statCards = computed(() => [
  { label: 'Total users', value: formatStat(dashboardStats.value.totalUsers), delta: '+14.6%', note: 'this month' },
  { label: 'Active listings', value: formatStat(dashboardStats.value.activeListings), delta: '+6.4%', note: 'this week' },
  { label: 'Transactions', value: formatStat(dashboardStats.value.totalTransactions), delta: '+22.1%', note: 'this month' },
])

const fetchStats = async () => {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const token = sessionStorage.getItem('authToken')
    const response = await fetch(`${API_BASE_URL}/admin/dashboard/stats`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.message || 'Failed to fetch stats')
    }

    const data = await response.json()

    dashboardStats.value = {
      totalUsers: data.totalUsers ?? 0,
      activeListings: data.activeListings ?? 0,
      totalTransactions: data.totalTransactions ?? 0,
    }
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Failed to fetch stats'
  } finally {
    isLoading.value = false
  }
}

const fetchHealth = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/posts/health/db`)
    if (!response.ok) {
      throw new Error('Health check failed')
    }

    const data = await response.json()
    healthStatus.value = data.status === 'connected' ? 'connected' : 'disconnected'
    healthMessage.value = data.message ?? ''
  } catch {
    healthStatus.value = 'disconnected'
    healthMessage.value = 'Unable to reach database'
  }
}

onMounted(() => {
  fetchStats()
  fetchHealth()
})

const route = useRoute()
const currentPath = computed(() => route.path)

const isActive = (path: string) => {
  if (path === '/admin') return currentPath.value === '/admin'
  return currentPath.value === path
}
const authStore = useAuthStore()
const router = useRouter()

const handleLogout = () => {
  authStore.logout()
  router.push('/home')
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
      <button class="logout" @click="handleLogout">Log out</button>
    </aside>

    <main class="admin-main">
      <header class="admin-topbar">
        <div class="topbar-left">
          <p class="eyebrow">Admin Dashboard</p>
          <h1>Command center</h1>
          <p class="subtitle">Overview of marketplace momentum, risk, and revenue.</p>
        </div>
        <div class="header-actions">
          <button class="ghost">Export</button>
          <button class="primary">Create report</button>
        </div>
      </header>

      <p v-if="errorMessage" class="stat-error">{{ errorMessage }}</p>

      <section class="stats-grid">
        <article v-for="card in statCards" :key="card.label" class="stat-card">
          <p class="stat-label">{{ card.label }}</p>
          <p class="stat-value">{{ card.value }}</p>
          <p class="stat-delta">
            <span>{{ card.delta }}</span>
            <span class="stat-note">{{ card.note }}</span>
          </p>
        </article>
      </section>

      <section class="health-panel">
        <div class="panel-header">
          <h2>Platform health</h2>
          <span class="panel-note">Database</span>
        </div>
        <div class="health-row">
          <span class="health-pill" :class="healthStatus">{{ healthStatus }}</span>
          <span class="health-message">{{ healthMessage || 'Status unknown' }}</span>
        </div>
      </section>

      <section class="main-grid">
        <article class="panel wide">
          <div class="panel-header">
            <h2>Weekly velocity</h2>
            <span class="panel-note">Transactions</span>
          </div>
          <div class="bar-chart">
            <div v-for="(bar, index) in velocityBars" :key="index" class="bar-col">
              <div class="bar" :style="{ height: `${bar}%` }"></div>
              <span class="bar-label">W{{ index + 1 }}</span>
            </div>
          </div>
        </article>

        <article class="panel">
          <div class="panel-header">
            <h2>Category mix</h2>
            <span class="panel-note">Last 30 days</span>
          </div>
          <div class="mix">
            <div v-for="item in categoryMix" :key="item.label" class="mix-row">
              <div class="mix-label">
                <span class="mix-dot" :style="{ backgroundColor: item.color }"></span>
                <span>{{ item.label }}</span>
              </div>
              <div class="mix-bar">
                <div class="mix-fill" :style="{ width: `${item.value}%`, background: item.color }"></div>
              </div>
              <span class="mix-value">{{ item.value }}%</span>
            </div>
          </div>
        </article>
      </section>

      <section class="main-grid">
        <article class="panel">
          <div class="panel-header">
            <h2>Recent activity</h2>
            <span class="panel-note">Live feed</span>
          </div>
          <div class="activity">
            <div v-for="item in activityFeed" :key="item.title" class="activity-row">
              <div>
                <p class="activity-title">{{ item.title }}</p>
                <p class="activity-meta">{{ item.meta }}</p>
              </div>
              <span class="pill">{{ item.tag }}</span>
            </div>
          </div>
        </article>

        <article class="panel">
          <div class="panel-header">
            <h2>Review queue</h2>
            <span class="panel-note">Updated now</span>
          </div>
          <div class="table">
            <div class="table-row header">
              <span>Item</span>
              <span>Owner</span>
              <span>Price</span>
              <span>Status</span>
            </div>
            <div v-for="row in reviewQueue" :key="row.item" class="table-row">
              <span>{{ row.item }}</span>
              <span>{{ row.owner }}</span>
              <span>{{ row.price }}</span>
              <span class="status">{{ row.status }}</span>
            </div>
          </div>
        </article>
      </section>

      <section class="risk-panel">
        <div class="panel-header">
          <h2>Risk flags</h2>
          <span class="panel-note">Auto detection</span>
        </div>
        <div class="risk-grid">
          <div v-for="flag in riskFlags" :key="flag.title" class="risk-card">
            <div class="risk-level" :class="flag.level.toLowerCase()">{{ flag.level }}</div>
            <h3>{{ flag.title }}</h3>
            <p>{{ flag.detail }}</p>
          </div>
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
  height: 100vh;
  display: grid;
  grid-template-columns: 260px 1fr;
  background: radial-gradient(circle at top left, #fef3c7 0%, #ecfeff 40%, #fef2f2 90%);
  color: #0f172a;
  position: relative;
  overflow: hidden;
}

.admin-sidebar {
  background: linear-gradient(180deg, #0f172a 0%, #111827 48%, #0b1020 100%);
  color: #f8fafc;
  padding: 32px 24px;
  display: flex;
  flex-direction: column;
  gap: 32px;
  position: sticky;
  top: 0;
  height: 100vh;
  align-self: start;
  overflow-y: auto;
  z-index: 1;
}

.brand {
  font-size: 24px;
  font-weight: 700;
  letter-spacing: -0.03em;
}

.brand-mark.accent {
  color: #ff7a18;
}

.nav {
  display: grid;
  gap: 12px;
}

.nav-item {
  padding: 10px 14px;
  border-radius: 10px;
  color: #cbd5f5;
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
  overflow-y: auto;
  z-index: 1;
}

.admin-topbar {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 20px;
}

.admin-topbar h1 {
  font-size: clamp(28px, 3vw, 42px);
  margin: 4px 0 6px;
}

.eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.2em;
  font-size: 11px;
  color: #6b7280;
}

.subtitle {
  color: #475569;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.ghost,
.primary {
  padding: 10px 16px;
  border-radius: 12px;
  font-weight: 600;
  border: none;
  cursor: pointer;
}

.ghost {
  background: #f1f5f9;
  color: #1e293b;
}

.primary {
  background: #ff7a18;
  color: #fff;
  box-shadow: 0 12px 24px rgba(255, 122, 24, 0.25);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.stat-error {
  font-size: 12px;
  color: #ef4444;
  margin: 0;
}

.stat-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 18px 20px;
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.08);
  animation: fadeUp 0.6s ease both;
}

.health-panel {
  background: rgba(255, 255, 255, 0.92);
  border-radius: 20px;
  padding: 20px 24px;
  box-shadow: 0 16px 30px rgba(15, 23, 42, 0.08);
}

.health-row {
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 600;
}

.health-pill {
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.health-pill.connected {
  background: rgba(16, 185, 129, 0.15);
  color: #0f766e;
}

.health-pill.disconnected {
  background: rgba(239, 68, 68, 0.15);
  color: #b91c1c;
}

.health-pill.unknown {
  background: rgba(148, 163, 184, 0.2);
  color: #475569;
}

.health-message {
  color: #475569;
  font-size: 14px;
}

.stat-label {
  color: #64748b;
  font-size: 13px;
}

.stat-value {
  font-size: 26px;
  font-weight: 700;
  margin: 8px 0 6px;
}

.stat-delta {
  color: #0f172a;
  font-size: 12px;
  display: flex;
  gap: 6px;
  align-items: center;
}

.stat-note {
  color: #94a3b8;
}

.main-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
}

.panel {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(12px);
  border-radius: 20px;
  padding: 22px 24px;
  box-shadow: 0 16px 30px rgba(15, 23, 42, 0.08);
}

.panel.wide {
  min-height: 240px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
}

.panel-header h2 {
  font-size: 18px;
  margin: 0;
}

.panel-note {
  color: #94a3b8;
  font-size: 12px;
}

.bar-chart {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 12px;
  align-items: end;
  height: 180px;
}

.bar-col {
  display: grid;
  gap: 8px;
  align-items: end;
}

.bar {
  background: linear-gradient(180deg, #ff7a18 0%, #fb7185 100%);
  border-radius: 12px 12px 6px 6px;
  animation: rise 0.8s ease forwards;
}

.bar-label {
  text-align: center;
  font-size: 11px;
  color: #64748b;
}

.mix {
  display: grid;
  gap: 14px;
}

.mix-row {
  display: grid;
  grid-template-columns: 1fr 2fr auto;
  gap: 12px;
  align-items: center;
  font-size: 13px;
}

.mix-label {
  display: flex;
  gap: 10px;
  align-items: center;
}

.mix-dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
}

.mix-bar {
  height: 10px;
  background: #e2e8f0;
  border-radius: 999px;
  overflow: hidden;
}

.mix-fill {
  height: 100%;
  border-radius: 999px;
}

.mix-value {
  color: #64748b;
}

.activity {
  display: grid;
  gap: 14px;
}

.activity-row {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 12px;
}

.activity-row:last-child {
  border-bottom: none;
}

.activity-title {
  font-weight: 600;
  margin: 0 0 4px;
}

.activity-meta {
  color: #64748b;
  font-size: 12px;
  margin: 0;
}

.pill {
  align-self: flex-start;
  padding: 6px 10px;
  border-radius: 999px;
  background: #ecfeff;
  color: #0e7490;
  font-size: 11px;
  font-weight: 600;
}

.table {
  display: grid;
  gap: 10px;
}

.table-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 8px;
  font-size: 13px;
  padding: 8px 0;
  border-bottom: 1px solid #e2e8f0;
}

.table-row.header {
  color: #64748b;
  text-transform: uppercase;
  font-size: 11px;
  letter-spacing: 0.08em;
  border-bottom: none;
}

.status {
  font-weight: 600;
  color: #0f172a;
}

.risk-panel {
  background: rgba(255, 255, 255, 0.92);
  border-radius: 20px;
  padding: 22px 24px;
  box-shadow: 0 16px 30px rgba(15, 23, 42, 0.08);
}

.risk-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 14px;
}

.risk-card {
  background: #0f172a;
  color: #f8fafc;
  padding: 16px 18px;
  border-radius: 16px;
}

.risk-card h3 {
  margin: 12px 0 6px;
  font-size: 15px;
}

.risk-card p {
  margin: 0;
  color: #cbd5f5;
  font-size: 12px;
}

.risk-level {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  background: rgba(255, 255, 255, 0.08);
}

.risk-level.high {
  color: #fecaca;
}

.risk-level.medium {
  color: #fde68a;
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
  opacity: 0.3;
  animation: float 12s ease-in-out infinite;
}

.glow.one {
  background: radial-gradient(circle, #ff7a18, transparent 70%);
  top: -60px;
  right: 120px;
}

.glow.two {
  background: radial-gradient(circle, #22d3ee, transparent 70%);
  bottom: -80px;
  left: 220px;
  animation-delay: -4s;
}

@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes rise {
  from {
    height: 0;
  }
  to {
    height: inherit;
  }
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
    height: auto;
    overflow: visible;
  }

  .admin-sidebar {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
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
  }
}

@media (max-width: 720px) {
  .admin-topbar {
    flex-direction: column;
    align-items: flex-start;
  }

  .table-row {
    grid-template-columns: 1fr;
  }
}
</style>
