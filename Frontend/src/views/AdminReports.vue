<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
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

type AdminReport = {
  id: string
  name: string
  email: string
  phone: string
  message: string
  request: string
  status: string
  date: string
}

type AdminReportApi = {
  _id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  message: string
  request: string
  status: string
  createdAt?: string
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

const reports = ref<AdminReport[]>([])
const isLoading = ref(false)
const errorMessage = ref('')

const reportCards = computed(() => {
  const total = reports.value.length
  const pending = reports.value.filter((r) => r.status === 'Pending').length
  const reviewed = reports.value.filter((r) => r.status === 'Reviewed').length
  const done = reports.value.filter((r) => r.status === 'Done').length

  return [
    { label: 'Total reports', value: total, tone: 'danger' },
    { label: 'Pending', value: pending, tone: 'warning' },
    { label: 'Reviewed', value: reviewed, tone: 'success' },
    { label: 'Done', value: done, tone: 'success' },
  ]
})

const formatDate = (value: string): string => {
  if (!value) return '---'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value || '---'
  return date.toISOString().split('T')[0]
}

const fetchReports = async () => {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const token = sessionStorage.getItem('authToken')
    const response = await fetch(`${API_BASE_URL}/admin/reports`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.message || 'Failed to load reports')
    }

    const data = (await response.json()) as AdminReportApi[]
    reports.value = (data ?? []).map((item) => ({
      id: item._id,
      name: `${item.firstName} ${item.lastName}`.trim(),
      email: item.email,
      phone: item.phone,
      message: item.message,
      request: item.request,
      status: item.status ? item.status.charAt(0).toUpperCase() + item.status.slice(1) : 'Pending',
      date: formatDate(item.createdAt ?? ''),
    }))
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Failed to load reports'
  } finally {
    isLoading.value = false
  }
}

const updateStatus = async (reportId: string, status: 'reviewed' | 'done') => {
  try {
    const token = sessionStorage.getItem('authToken')
    const response = await fetch(`${API_BASE_URL}/admin/reports/${reportId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ status }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.message || 'Failed to update report')
    }

    const updated = (await response.json()) as AdminReportApi
    reports.value = reports.value.map((report) =>
      report.id === updated._id
        ? {
            ...report,
            status: updated.status
              ? updated.status.charAt(0).toUpperCase() + updated.status.slice(1)
              : report.status,
          }
        : report,
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update report'
    alert(message)
  }
}

onMounted(fetchReports)

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
            <h1>Reports</h1>
          </div>
        </div>
        <div class="topbar-user">
          <span class="topbar-role">Admin</span>
          <div class="avatar"></div>
        </div>
      </header>

      <section class="report-panel">
        <div class="panel-header">
          <div>
            <p class="section-label">Review user reports and take action</p>
            <p class="section-subtitle">Escalate cases and flag risky content quickly.</p>
          </div>
          <button class="primary">Select</button>
        </div>

        <div class="card-row">
          <div v-for="card in reportCards" :key="card.label" class="report-card" :class="card.tone">
            <div>
              <p class="card-label">{{ card.label }}</p>
              <p class="card-value">{{ card.value }}</p>
            </div>
            <div class="card-icon"></div>
          </div>
        </div>

        <div class="filters">
          <label class="search">
            <span class="search-icon"></span>
            <input type="text" placeholder="Search report..." />
          </label>
          <div class="filter-group">
            <select>
              <option>All type</option>
              <option>User</option>
              <option>Listing</option>
            </select>
            <select>
              <option>All status</option>
              <option>Pending</option>
              <option>Reviewed</option>
            </select>
          </div>
        </div>

        <div class="table">
          <div class="table-row header">
            <span>Report ID</span>
            <span>Type</span>
            <span>Reason</span>
            <span>Reported Item/User</span>
            <span>Status</span>
            <span>Date</span>
            <span>Actions</span>
          </div>
          <p v-if="isLoading" class="table-note">Loading reports...</p>
          <p v-else-if="errorMessage" class="table-note error">{{ errorMessage }}</p>
          <div v-for="report in reports" :key="report.id" class="table-row body">
            <span>#{{ report.id.slice(-6) }}</span>
            <span class="type">Help</span>
            <span class="reason">{{ report.message }}</span>
            <span class="target">{{ report.name }}</span>
            <span class="status" :class="report.status.toLowerCase()">{{ report.status }}</span>
            <span>{{ report.date }}</span>
            <div class="actions">
              <button
                type="button"
                class="action review"
                :disabled="report.status !== 'Pending'"
                @click="updateStatus(report.id, 'reviewed')"
              >
                Review
              </button>
              <button
                type="button"
                class="action done"
                :disabled="report.status === 'Done'"
                @click="updateStatus(report.id, 'done')"
              >
                Done
              </button>
            </div>
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
  overflow-y: auto;
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

.report-panel {
  background: rgba(255, 255, 255, 0.92);
  border-radius: 18px;
  padding: 22px 24px 26px;
  box-shadow: 0 16px 30px rgba(15, 23, 42, 0.08);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 18px;
}

.section-label {
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 6px;
}

.section-subtitle {
  color: #64748b;
  font-size: 12px;
  margin: 0;
}

.card-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 14px;
  margin-bottom: 18px;
}

.report-card {
  background: #fff;
  border-radius: 12px;
  padding: 12px 14px;
  border: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

.actions {
  display: inline-flex;
  gap: 8px;
  align-items: center;
}

.action {
  border: 1px solid transparent;
  border-radius: 999px;
  padding: 6px 12px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease;
}

.action.review {
  background: #fff7ed;
  color: #9a3412;
  border-color: #fed7aa;
}

.action.done {
  background: #ecfdf5;
  color: #065f46;
  border-color: #a7f3d0;
}

.action:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 8px 16px rgba(15, 23, 42, 0.12);
}

.action:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  box-shadow: none;
}

.card-label {
  font-size: 12px;
  color: #64748b;
  margin: 0 0 4px;
}

.card-value {
  font-size: 20px;
  font-weight: 700;
  margin: 0;
}

.card-icon {
  width: 26px;
  height: 26px;
  border-radius: 8px;
  background: #fee2e2;
}

.report-card.warning .card-icon {
  background: #ffedd5;
}

.report-card.success .card-icon {
  background: #dcfce7;
}

.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 16px;
  align-items: center;
  margin-bottom: 18px;
}

.search {
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 8px 12px;
  min-width: 220px;
  background: #fff;
}

.search input {
  border: none;
  outline: none;
  font-size: 13px;
  width: 160px;
}

.search-icon {
  width: 16px;
  height: 16px;
  border: 2px solid #94a3b8;
  border-radius: 50%;
  position: relative;
}

.search-icon::after {
  content: '';
  position: absolute;
  width: 8px;
  height: 2px;
  background: #94a3b8;
  right: -6px;
  bottom: -1px;
  transform: rotate(45deg);
}

.filter-group {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
}

select {
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 8px 12px;
  font-size: 12px;
  color: #0f172a;
  background: #fff;
}

.primary {
  padding: 10px 18px;
  border-radius: 12px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  background: #1e1b4b;
  color: #fff;
  box-shadow: 0 12px 24px rgba(30, 27, 75, 0.25);
}

.table {
  display: grid;
  gap: 10px;
}

.table-note {
  font-size: 12px;
  color: #64748b;
  margin: 0;
}

.table-note.error {
  color: #ef4444;
}

.reason,
.target {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.table-row {
  display: grid;
  grid-template-columns: 0.9fr 0.9fr 1.6fr 2fr 1fr 1fr 0.5fr;
  gap: 8px;
  font-size: 13px;
  padding: 10px 0;
  align-items: center;
  border-bottom: 1px solid #e2e8f0;
}

.table-row.header {
  color: #64748b;
  text-transform: uppercase;
  font-size: 11px;
  letter-spacing: 0.08em;
  border-bottom: 1px solid #e2e8f0;
  padding-top: 0;
}

.table-row.body:last-child {
  border-bottom: none;
}

.type {
  font-weight: 600;
}

.type.user {
  color: #2563eb;
}

.type.listing {
  color: #f97316;
}

.status {
  font-weight: 600;
  text-transform: capitalize;
}

.status.pending {
  color: #f97316;
}

.status.reviewed {
  color: #16a34a;
}

.dots {
  background: transparent;
  border: none;
  display: inline-flex;
  flex-direction: column;
  gap: 4px;
  cursor: pointer;
  align-items: center;
  justify-content: center;
}

.dots span {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: #1f2937;
  display: block;
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
    height: auto;
    overflow: visible;
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

  .admin-main {
    overflow: visible;
  }
}

@media (max-width: 720px) {
  .admin-topbar {
    flex-direction: column;
    align-items: flex-start;
  }

  .filters {
    flex-direction: column;
    align-items: flex-start;
  }

  .table-row {
    grid-template-columns: 1fr;
    gap: 6px;
  }
}
</style>
