<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

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

type ActivityItem = {
  id: string
  title: string
  subtitle: string
  category: string
  time: string
  adminName: string
  action: string
}

type ActivityApi = {
  _id: string
  adminId: string
  adminName: string
  action: string
  details: string
  createdAt?: string
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

const activities = ref<ActivityItem[]>([])
const isLoading = ref(false)
const errorMessage = ref('')

const formatDate = (value?: string): string => {
  if (!value) return '---'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value ?? '---'
  return date.toISOString().replace('T', ' ').slice(0, 16)
}

const mapCategory = (action: string) => {
  if (action.includes('USER')) return 'User'
  if (action.includes('POST')) return 'Listings'
  if (action.includes('REPORT')) return 'Report'
  return 'Admin'
}

const mapTitle = (action: string) => {
  switch (action) {
    case 'DELETE_USER':
      return 'User deleted'
    case 'DELETE_POST':
      return 'Listing deleted'
    case 'REVIEW_REPORT':
      return 'Report reviewed'
    case 'DONE_REPORT':
      return 'Report closed'
    default:
      return action
  }
}

const fetchActivities = async () => {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const token = sessionStorage.getItem('authToken')
    const response = await fetch(`${API_BASE_URL}/admin/activity`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.message || 'Failed to load activity log')
    }

    const data = (await response.json()) as ActivityApi[]
    activities.value = (data ?? []).map((item) => ({
      id: item._id,
      title: mapTitle(item.action),
      subtitle: item.details,
      category: mapCategory(item.action),
      time: formatDate(item.createdAt),
      adminName: item.adminName,
      action: item.action,
    }))
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Failed to load activity log'
  } finally {
    isLoading.value = false
  }
}

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

const handleLogout = () => {
  authStore.logout()
  router.push('/home')
}

// ─── Detail Modal ────────────────────────────────────────────────────────────
const showDetailModal = ref(false)
const viewingActivity = ref<ActivityItem | null>(null)

const openDetail = (item: ActivityItem) => {
  viewingActivity.value = item
  showDetailModal.value = true
}

const closeDetail = () => {
  showDetailModal.value = false
  setTimeout(() => {
    viewingActivity.value = null
  }, 200)
}

const actionColor = (action: string) => {
  if (action.includes('DELETE')) return 'action-delete'
  if (action.includes('REVIEW')) return 'action-review'
  if (action.includes('DONE')) return 'action-done'
  return 'action-default'
}

onMounted(fetchActivities)
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
          <p v-if="isLoading" class="activity-note">Loading activity...</p>
          <p v-else-if="errorMessage" class="activity-note error">{{ errorMessage }}</p>
          <article v-for="item in activities" :key="item.id" class="activity-row clickable" @click="openDetail(item)">
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

  <!-- ─── Activity Detail Modal ──────────────────────────────────────── -->
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="showDetailModal" class="modal-overlay" @click.self="closeDetail">
        <div class="modal-card">
          <div class="modal-header">
            <h3 class="modal-title">Activity Details</h3>
            <button class="close-btn" @click="closeDetail">&times;</button>
          </div>

          <div v-if="viewingActivity" class="modal-content">
            <div class="detail-row">
              <span class="detail-label">Action:</span>
              <span class="action-badge" :class="actionColor(viewingActivity.action)">{{ viewingActivity.title }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Performed By:</span>
              <span class="detail-value">{{ viewingActivity.adminName }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Category:</span>
              <span class="detail-value">{{ viewingActivity.category }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Date / Time:</span>
              <span class="detail-value">{{ viewingActivity.time }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Log ID:</span>
              <span class="detail-value mono">#{{ viewingActivity.id }}</span>
            </div>
            <div class="detail-message-box">
              <span class="detail-label">Details:</span>
              <p class="detail-message">{{ viewingActivity.subtitle }}</p>
            </div>
          </div>

          <div class="modal-actions">
            <button class="modal-btn cancel" type="button" @click="closeDetail">Close</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
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

.activity-note {
  font-size: 12px;
  color: #64748b;
  margin: 0;
}

.activity-note.error {
  color: #ef4444;
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

.activity-row.clickable {
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.activity-row.clickable:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.1);
  border-color: #c7d2fe;
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

/* ─── Modal Styles ───────────────────────────────────────────────────────── */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  width: 90%;
  max-width: 480px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.modal-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #0f172a;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: #64748b;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.close-btn:hover {
  color: #0f172a;
}

.modal-content {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-bottom: 24px;
}

.detail-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.detail-label {
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
  min-width: 110px;
  flex-shrink: 0;
}

.detail-value {
  font-size: 14px;
  color: #0f172a;
}

.detail-value.mono {
  font-family: 'Courier New', monospace;
  font-size: 12px;
  color: #475569;
}

.action-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  text-transform: capitalize;
}

.action-delete {
  background: #fee2e2;
  color: #dc2626;
}

.action-review {
  background: #fff7ed;
  color: #ea580c;
}

.action-done {
  background: #dcfce7;
  color: #16a34a;
}

.action-default {
  background: #f1f5f9;
  color: #475569;
}

.detail-message-box {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 14px;
  margin-top: 4px;
}

.detail-message {
  margin: 8px 0 0;
  font-size: 14px;
  color: #334155;
  line-height: 1.5;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.modal-btn {
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.modal-btn.cancel {
  background: #f1f5f9;
  color: #475569;
}

.modal-btn.cancel:hover {
  background: #e2e8f0;
  color: #0f172a;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>
