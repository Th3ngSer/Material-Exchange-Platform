<script setup lang="ts">
import AdminLayout from '@/components/Admin/AdminLayout.vue'
import DropDownMenu from '@/components/DropDownMenu.vue'
import { authFetch } from '@/utils/authFetch'
import { getToken } from '@/utils/tokenStorage'
import { computed, onMounted, ref, watch } from 'vue'

const sortItems = [
  { label: 'A-Z', value: 'A-Z' },
  { label: 'Z-A', value: 'Z-A' },
  { label: 'Newest', value: 'Newest' },
]

const statusItems = [
  { label: 'All status', value: 'All status' },
  { label: 'Active', value: 'Active' },
  { label: 'Suspended', value: 'Suspended' },
]

const ratingItems = [
  { label: 'All star', value: 'All star' },
  { label: '5 star', value: '5 star' },
  { label: '4 star', value: '4 star' },
]

type AdminUser = {
  id: string
  name?: string
  email: string
  role: string
  status: string
  listingsCount: number
  rating: number
  createdAt?: string
}

type AdminUserApi = {
  _id: string
  name?: string
  email: string
  role?: string
  status?: string
  listingsCount?: number
  rating?: number
  createdAt?: string
}


const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

const users = ref<AdminUser[]>([])
const isLoading = ref(false)
const errorMessage = ref('')
const isDeleting = ref(false)
const searchQuery = ref('')
const page = ref(1)
const lastPage = ref(1)
const total = ref(0)

const sortBy = ref('A-Z')
const statusFilter = ref('All status')
const ratingFilter = ref('All star')

// Selection mode state
const selectMode = ref(false)
const selectedIds = ref<Set<string>>(new Set())
const showConfirmModal = ref(false)

const toggleSelectMode = () => {
  selectMode.value = !selectMode.value
  if (!selectMode.value) {
    selectedIds.value = new Set()
  }
}

const toggleSelect = (id: string) => {
  const next = new Set(selectedIds.value)
  if (next.has(id)) {
    next.delete(id)
  } else {
    next.add(id)
  }
  selectedIds.value = next
}

const filteredUsers = computed(() => {
  let list = [...users.value]

  // Filter by status
  if (statusFilter.value !== 'All status') {
    list = list.filter((u) => u.status.toLowerCase() === statusFilter.value.toLowerCase())
  }

  // Filter by rating
  if (ratingFilter.value !== 'All star') {
    const starLimit = parseInt(ratingFilter.value)
    if (starLimit === 5) {
      list = list.filter((u) => u.rating >= 5.0)
    } else if (starLimit === 4) {
      list = list.filter((u) => u.rating >= 4.0)
    }
  }

  // Sort
  if (sortBy.value === 'A-Z') {
    list.sort((a, b) => {
      const nameA = (a.name || a.email).toLowerCase()
      const nameB = (b.name || b.email).toLowerCase()
      return nameA.localeCompare(nameB)
    })
  } else if (sortBy.value === 'Z-A') {
    list.sort((a, b) => {
      const nameA = (a.name || a.email).toLowerCase()
      const nameB = (b.name || b.email).toLowerCase()
      return nameB.localeCompare(nameA)
    })
  } else if (sortBy.value === 'Newest') {
    list.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
      return dateB - dateA
    })
  }

  return list
})

const isAllSelected = computed(
  () => filteredUsers.value.length > 0 && selectedIds.value.size === filteredUsers.value.length,
)

const toggleSelectAll = () => {
  if (isAllSelected.value) {
    selectedIds.value = new Set()
  } else {
    selectedIds.value = new Set(filteredUsers.value.map((u) => u.id))
  }
}

const openConfirmModal = () => {
  if (selectedIds.value.size === 0) return
  showConfirmModal.value = true
}

const closeConfirmModal = () => {
  showConfirmModal.value = false
}

const formatDate = (value?: string) => {
  if (!value) {
    return '---'
  }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }
  return date.toISOString().split('T')[0]
}

const fetchUsers = async () => {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const token = getToken()
    const params = new URLSearchParams()
    params.set('page', String(page.value))
    params.set('limit', '10')
    if (searchQuery.value.trim()) {
      params.set('search', searchQuery.value.trim())
    }

    const response = await authFetch(`${API_BASE_URL}/admin/users?${params.toString()}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.message || 'Failed to load users')
    }

    const payload = (await response.json()) as {
      data: AdminUserApi[]
      meta: { total: number; page: number; lastPage: number }
    }

    users.value = (payload.data ?? []).map((item) => ({
      id: item._id,
      name: item.name,
      email: item.email,
      role: item.role ?? 'user',
      status: item.status ?? 'active',
      listingsCount: item.listingsCount ?? 0,
      rating: item.rating ?? 0,
      createdAt: item.createdAt,
    }))
    total.value = payload.meta?.total ?? 0
    page.value = payload.meta?.page ?? 1
    lastPage.value = payload.meta?.lastPage ?? 1
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Failed to load users'
  } finally {
    isLoading.value = false
  }
}

const confirmBulkDelete = async () => {
  isDeleting.value = true
  try {
    const token = getToken()
    const deletePromises = Array.from(selectedIds.value).map(async (userId) => {
      const response = await authFetch(`${API_BASE_URL}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })
      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.message || `Failed to delete user ${userId}`)
      }
    })

    await Promise.all(deletePromises)

    users.value = users.value.filter((u) => !selectedIds.value.has(u.id))
    selectedIds.value = new Set()
    selectMode.value = false
    showConfirmModal.value = false
    await fetchUsers()
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete users'
    alert(message)
  } finally {
    isDeleting.value = false
  }
}

const canGoPrev = computed(() => page.value > 1)
const canGoNext = computed(() => page.value < lastPage.value)

const goPrev = () => {
  if (!canGoPrev.value) return
  page.value -= 1
  fetchUsers()
}

const goNext = () => {
  if (!canGoNext.value) return
  page.value += 1
  fetchUsers()
}

let searchTimer: number | undefined
watch(searchQuery, () => {
  window.clearTimeout(searchTimer)
  searchTimer = window.setTimeout(() => {
    page.value = 1
    fetchUsers()
  }, 300)
})

onMounted(fetchUsers)
</script>

<template>
  <AdminLayout>
      <header class="admin-topbar">
        <div class="topbar-left">
          <div class="topbar-icon"></div>
          <div>
            <p class="topbar-label">Admin Panel</p>
            <h1>User management</h1>
          </div>
        </div>
        <div class="topbar-user">
          <span class="topbar-role">Admin</span>
          <div class="avatar"></div>
        </div>
      </header>

      <section class="user-panel">
        <div class="panel-header">
          <div>
            <p class="section-label">Manage platform users</p>
            <p class="section-subtitle">Review, verify, and moderate users in one place.</p>
          </div>
          <div class="header-actions">
            <button
              v-if="selectMode"
              class="btn-cancel"
              type="button"
              @click="toggleSelectMode"
            >
              Cancel
            </button>
            <button
              v-if="!selectMode"
              class="primary"
              type="button"
              @click="toggleSelectMode"
            >
              Select
            </button>
            <button
              v-else
              class="btn-remove"
              type="button"
              :disabled="selectedIds.size === 0"
              @click="openConfirmModal"
            >
              Remove{{ selectedIds.size > 0 ? ` (${selectedIds.size})` : '' }}
            </button>
          </div>
        </div>

        <div class="filters">
          <label class="search">
            <span class="search-icon"></span>
            <input v-model="searchQuery" type="text" placeholder="Search users..." />
          </label>
          <div class="filter-group">
            <label class="filter">
              <span>Filter :</span>
              <DropDownMenu v-model="sortBy" :items="sortItems" size="lg" />
            </label>
            <DropDownMenu v-model="statusFilter" :items="statusItems" size="sm" />
            <DropDownMenu v-model="ratingFilter" :items="ratingItems" size="sm" />
          </div>
        </div>

        <div class="table">
          <p v-if="isLoading" class="table-note">Loading users...</p>
          <p v-else-if="errorMessage" class="table-note error">{{ errorMessage }}</p>
          <div class="table-row header" :class="{ 'with-checkbox': selectMode }">
            <label v-if="selectMode" class="checkbox-cell" @click.stop>
              <input
                type="checkbox"
                :checked="isAllSelected"
                @change="toggleSelectAll"
              />
            </label>
            <span>Name</span>
            <span>Email</span>
            <span>Role</span>
            <span>Status</span>
            <span>Listings</span>
            <span>Rating</span>
            <span>Joined</span>
          </div>
          <div
            v-for="user in filteredUsers"
            :key="user.id"
            class="table-row body"
            :class="{ 'with-checkbox': selectMode, selected: selectedIds.has(user.id) }"
          >
            <label v-if="selectMode" class="checkbox-cell" @click.stop>
              <input
                type="checkbox"
                :checked="selectedIds.has(user.id)"
                @change="toggleSelect(user.id)"
              />
            </label>
            <div class="name-cell">
              <div class="avatar small"></div>
              <span>{{ user.name || user.email.split('@')[0] }}</span>
            </div>
            <span>{{ user.email }}</span>
            <span>{{ user.role }}</span>
            <span class="status" :class="user.status.toLowerCase()">{{ user.status }}</span>
            <span>{{ user.listingsCount }}</span>
            <span class="rating">
              <span class="star"></span>
              {{ Number(user.rating || 0).toFixed(1) }}
            </span>
            <span class="joined">{{ formatDate(user.createdAt) }}</span>
          </div>
        </div>

        <div class="pagination">
          <button class="ghost" type="button" :disabled="!canGoPrev" @click="goPrev">
            Previous
          </button>
          <span class="page-meta">Page {{ page }} of {{ lastPage }} · {{ total }} users</span>
          <button class="ghost" type="button" :disabled="!canGoNext" @click="goNext">
            Next
          </button>
        </div>
      </section>

      <!-- ─── Confirm Delete Modal ─────────────────────────────────────────── -->
      <Teleport to="body">
        <Transition name="modal-fade">
          <div v-if="showConfirmModal" class="modal-overlay" @click.self="closeConfirmModal">
            <div class="modal-card">
              <div class="modal-icon-wrap">
                <svg class="modal-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                  <path d="M10 11v6" />
                  <path d="M14 11v6" />
                  <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                </svg>
              </div>
              <h3 class="modal-title">Delete Users</h3>
              <p class="modal-body">
                Are you sure you want to delete
                <strong>{{ selectedIds.size }}</strong>
                {{ selectedIds.size === 1 ? 'user' : 'users' }}?
                This action cannot be undone.
              </p>
              <div class="modal-actions">
                <button class="modal-btn cancel" type="button" :disabled="isDeleting" @click="closeConfirmModal">
                  Cancel
                </button>
                <button class="modal-btn confirm" type="button" :disabled="isDeleting" @click="confirmBulkDelete">
                  {{ isDeleting ? 'Deleting...' : 'Yes, Delete' }}
                </button>
              </div>
            </div>
          </div>
        </Transition>
      </Teleport>
  </AdminLayout>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap');

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

.avatar.small {
  width: 30px;
  height: 30px;
  border-width: 1px;
  box-shadow: none;
}

.user-panel {
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

.filter {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #475569;
}

select {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  border: 1px solid rgba(148, 163, 184, 0.3);
  border-radius: 12px;
  padding: 10px 36px 10px 16px;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 13px;
  font-weight: 500;
  color: #1e293b;
  background-color: #ffffff;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23475569' stroke-width='2.5'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19.5 8.25l-7.5 7.5-7.5-7.5'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 14px;
  cursor: pointer;
  outline: none;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
}

select:hover {
  border-color: #6366f1;
  background-color: #f8fafc;
}

select:focus {
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
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

.table-row {
  display: grid;
  grid-template-columns: 2fr 2.2fr 1fr 1fr 1fr 1fr 1.2fr;
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

.pagination {
  margin-top: 16px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  font-size: 12px;
  color: #475569;
}

.page-meta {
  font-weight: 600;
}

.name-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.status {
  font-weight: 600;
  text-transform: capitalize;
}

.status.active {
  color: #16a34a;
}

.status.suspended {
  color: #ef4444;
}

.rating {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.star {
  width: 14px;
  height: 14px;
  background: linear-gradient(180deg, #fbbf24, #f59e0b);
  clip-path: polygon(50% 0%, 62% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 38% 35%);
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

.header-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.btn-remove {
  padding: 10px 18px;
  border-radius: 12px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  background: #ef4444;
  color: #fff;
  box-shadow: 0 8px 20px rgba(239, 68, 68, 0.3);
  transition: background 0.2s ease, box-shadow 0.2s ease, transform 0.15s ease;
}

.btn-remove:hover:not(:disabled) {
  background: #dc2626;
  transform: translateY(-1px);
  box-shadow: 0 10px 24px rgba(220, 38, 38, 0.35);
}

.btn-remove:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  box-shadow: none;
}

.btn-cancel {
  padding: 10px 18px;
  border-radius: 12px;
  font-weight: 600;
  border: 1px solid #cbd5e1;
  cursor: pointer;
  background: #fff;
  color: #475569;
  transition: background 0.15s ease, border-color 0.15s ease;
}

.btn-cancel:hover {
  background: #f1f5f9;
  border-color: #94a3b8;
}

.checkbox-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.checkbox-cell input[type='checkbox'] {
  width: 16px;
  height: 16px;
  accent-color: #1e1b4b;
  cursor: pointer;
  border-radius: 4px;
}

.table-row.with-checkbox {
  grid-template-columns: 36px 2fr 2.2fr 1fr 1fr 1fr 1fr 1.2fr;
}

.table-row.body.selected {
  background: rgba(239, 68, 68, 0.06);
  border-radius: 8px;
}

/* ─── Confirm Delete Modal ───────────────────────────────────────────── */

.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(15, 23, 42, 0.45);
  backdrop-filter: blur(4px);
}

.modal-card {
  background: #fff;
  border-radius: 20px;
  padding: 32px 28px 28px;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 24px 48px rgba(15, 23, 42, 0.18);
  text-align: center;
  animation: modal-pop 0.25s ease;
}

@keyframes modal-pop {
  0% {
    transform: scale(0.92);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.modal-icon-wrap {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #fee2e2;
  margin-bottom: 16px;
}

.modal-icon {
  width: 28px;
  height: 28px;
  color: #ef4444;
}

.modal-title {
  margin: 0 0 8px;
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
}

.modal-body {
  margin: 0 0 24px;
  font-size: 14px;
  color: #64748b;
  line-height: 1.5;
}

.modal-body strong {
  color: #0f172a;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.modal-btn {
  padding: 10px 22px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  border: none;
  transition: background 0.15s ease, transform 0.15s ease;
}

.modal-btn.cancel {
  background: #f1f5f9;
  color: #475569;
}

.modal-btn.cancel:hover:not(:disabled) {
  background: #e2e8f0;
}

.modal-btn.confirm {
  background: #ef4444;
  color: #fff;
  box-shadow: 0 8px 20px rgba(239, 68, 68, 0.25);
}

.modal-btn.confirm:hover:not(:disabled) {
  background: #dc2626;
  transform: translateY(-1px);
}

.modal-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* ─── Modal transition ───────────────────────────────────────────────── */

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
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
