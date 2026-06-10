<script setup lang="ts">
import AdminLayout from '@/components/Admin/AdminLayout.vue'
import DropDownMenu from '@/components/DropDownMenu.vue'
import { authFetch } from '@/utils/authFetch'
import { getToken } from '@/utils/tokenStorage'
import { onMounted, ref, computed, watch } from 'vue'

const searchQuery = ref('')
const sortBy = ref('A-Z')
const statusFilter = ref('All status')
const typeFilter = ref('All types')

const sortItems = [
  { label: 'A-Z', value: 'A-Z' },
  { label: 'Z-A', value: 'Z-A' },
  { label: 'Newest', value: 'Newest' },
]

const statusItems = [
  { label: 'All status', value: 'All status' },
  { label: 'Active', value: 'Active' },
  { label: 'Suspended', value: 'Suspended' },
  { label: 'Sold', value: 'Sold' },
]

const typeItems = [
  { label: 'All types', value: 'All types' },
  { label: 'Sell', value: 'Sell' },
  { label: 'Exchange', value: 'Exchange' },
  { label: 'Borrow', value: 'Borrow' },
]

type AdminListing = {
  id: string
  title: string
  lister: string
  category: string
  price: string
  type: string
  status: string
  date: string
}

type AdminListingApi = {
  _id: string
  title: string
  listerName?: string
  category: string
  price?: number
  type?: string
  status?: string
  createdAt?: string
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

const listings = ref<AdminListing[]>([])
const isLoading = ref(false)
const errorMessage = ref('')
const isDeleting = ref(false)

// Pagination & Selection state
const page = ref(1)
const limit = ref(5)

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

const formatDate = (value?: string): string => {
  if (!value) return '---'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value ?? '---'
  return date.toISOString().split('T')[0] ?? '---'
}

const formatPrice = (price?: number) => `$${Number(price ?? 0).toFixed(2)}`

const fetchListings = async () => {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const token = getToken()
    const response = await authFetch(`${API_BASE_URL}/posts/admin/all`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.message || 'Failed to load listings')
    }

    const data = (await response.json()) as AdminListingApi[]
    listings.value = (data ?? []).map((item) => ({
      id: item._id,
      title: item.title,
      lister: item.listerName ?? '---',
      category: item.category,
      price: formatPrice(item.price),
      type: item.type ? item.type.charAt(0).toUpperCase() + item.type.slice(1) : '---',
      status: item.status ? item.status.charAt(0).toUpperCase() + item.status.slice(1) : 'Active',
      date: formatDate(item.createdAt),
    }))
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Failed to load listings'
  } finally {
    isLoading.value = false
  }
}

const deleteListing = async (listingId: string, title: string) => {
  if (!confirm(`Delete listing "${title}"? This cannot be undone.`)) {
    return
  }

  isDeleting.value = true
  try {
    const token = getToken()
    const response = await authFetch(`${API_BASE_URL}/posts/admin/${listingId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.message || 'Failed to delete listing')
    }

    listings.value = listings.value.filter((item) => item.id !== listingId)
    selectedIds.value.delete(listingId)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete listing'
    alert(message)
  } finally {
    isDeleting.value = false
  }
}

const filteredListings = computed(() => {
  let list = [...listings.value]

  // Filter by search query
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim()
    list = list.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.lister.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q),
    )
  }

  // Filter by status
  if (statusFilter.value !== 'All status') {
    list = list.filter((item) => item.status.toLowerCase() === statusFilter.value.toLowerCase())
  }

  // Filter by type
  if (typeFilter.value !== 'All types') {
    list = list.filter((item) => item.type.toLowerCase() === typeFilter.value.toLowerCase())
  }

  // Sort
  if (sortBy.value === 'A-Z') {
    list.sort((a, b) => a.title.localeCompare(b.title))
  } else if (sortBy.value === 'Z-A') {
    list.sort((a, b) => b.title.localeCompare(a.title))
  } else if (sortBy.value === 'Newest') {
    list.sort((a, b) => {
      const dateA = a.date ? new Date(a.date).getTime() : 0
      const dateB = b.date ? new Date(b.date).getTime() : 0
      return dateB - dateA
    })
  }

  return list
})

// Pagination computed properties
const total = computed(() => filteredListings.value.length)
const lastPage = computed(() => Math.ceil(total.value / limit.value) || 1)

const paginatedListings = computed(() => {
  const start = (page.value - 1) * limit.value
  return filteredListings.value.slice(start, start + limit.value)
})

const isAllSelected = computed(
  () => paginatedListings.value.length > 0 && paginatedListings.value.every((item) => selectedIds.value.has(item.id))
)

const toggleSelectAll = () => {
  const next = new Set(selectedIds.value)
  if (isAllSelected.value) {
    paginatedListings.value.forEach((item) => {
      next.delete(item.id)
    })
  } else {
    paginatedListings.value.forEach((item) => {
      next.add(item.id)
    })
  }
  selectedIds.value = next
}

const openConfirmModal = () => {
  if (selectedIds.value.size === 0) return
  showConfirmModal.value = true
}

const closeConfirmModal = () => {
  showConfirmModal.value = false
}

const confirmBulkDelete = async () => {
  isDeleting.value = true
  try {
    const token = getToken()
    const deletePromises = Array.from(selectedIds.value).map(async (listingId) => {
      const response = await authFetch(`${API_BASE_URL}/posts/admin/${listingId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })
      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.message || `Failed to delete listing ${listingId}`)
      }
    })

    await Promise.all(deletePromises)

    listings.value = listings.value.filter((item) => !selectedIds.value.has(item.id))
    selectedIds.value = new Set()
    selectMode.value = false
    showConfirmModal.value = false
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete listings'
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
}

const goNext = () => {
  if (!canGoNext.value) return
  page.value += 1
}

watch([searchQuery, sortBy, statusFilter, typeFilter], () => {
  page.value = 1
})

onMounted(fetchListings)
</script>

<template>
  <AdminLayout>
      <header class="admin-topbar">
        <div class="topbar-left">
          <div class="topbar-icon"></div>
          <div>
            <p class="topbar-label">Admin Panel</p>
            <h1>Listings</h1>
          </div>
        </div>
        <div class="topbar-user">
          <span class="topbar-role">Admin</span>
          <div class="avatar"></div>
        </div>
      </header>

      <section class="listing-panel">
        <div class="panel-header">
          <div>
            <p class="section-label">Manage marketplace listings</p>
            <p class="section-subtitle">Review inventory, verify content, and approve posts.</p>
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
            <input v-model="searchQuery" type="text" placeholder="Search listings..." />
          </label>
          <div class="filter-group">
            <DropDownMenu v-model="sortBy" :items="sortItems" size="lg" />
            <DropDownMenu v-model="statusFilter" :items="statusItems" size="sm" />
            <DropDownMenu v-model="typeFilter" :items="typeItems" size="sm" />
          </div>
        </div>

        <div class="table">
          <p v-if="isLoading" class="table-note">Loading listings...</p>
          <p v-else-if="errorMessage" class="table-note error">{{ errorMessage }}</p>
          <div class="table-row header" :class="{ 'with-checkbox': selectMode }">
            <label v-if="selectMode" class="checkbox-cell" @click.stop>
              <input
                type="checkbox"
                :checked="isAllSelected"
                @change="toggleSelectAll"
              />
            </label>
            <span>Title</span>
            <span>Lister</span>
            <span>Category</span>
            <span>Price</span>
            <span>Type</span>
            <span>Status</span>
            <span>Date</span>
            <span>Actions</span>
          </div>
          <div
            v-for="listing in paginatedListings"
            :key="listing.id"
            class="table-row body"
            :class="{ 'with-checkbox': selectMode, selected: selectedIds.has(listing.id) }"
          >
            <label v-if="selectMode" class="checkbox-cell" @click.stop>
              <input
                type="checkbox"
                :checked="selectedIds.has(listing.id)"
                @change="toggleSelect(listing.id)"
              />
            </label>
            <span>{{ listing.title }}</span>
            <span>{{ listing.lister }}</span>
            <span>{{ listing.category }}</span>
            <span>{{ listing.price }}</span>
            <span>{{ listing.type }}</span>
            <span class="status" :class="listing.status.toLowerCase()">{{ listing.status }}</span>
            <span>{{ listing.date }}</span>
            <button
              class="delete"
              type="button"
              :disabled="isDeleting"
              @click="deleteListing(listing.id, listing.title)"
            >
              Delete
            </button>
          </div>
        </div>

        <div class="pagination">
          <button class="ghost" type="button" :disabled="!canGoPrev" @click="goPrev">
            Previous
          </button>
          <span class="page-meta">Page {{ page }} of {{ lastPage }} · {{ total }} listings</span>
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
              <h3 class="modal-title">Delete Listings</h3>
              <p class="modal-body">
                Are you sure you want to delete
                <strong>{{ selectedIds.size }}</strong>
                {{ selectedIds.size === 1 ? 'listing' : 'listings' }}?
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

.listing-panel {
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
  overflow-x: auto;
  width: 100%;
  -webkit-overflow-scrolling: touch;
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
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1fr 1fr 0.5fr;
  gap: 8px;
  font-size: 13px;
  padding: 10px 0;
  align-items: center;
  border-bottom: 1px solid #e2e8f0;
  min-width: 850px;
}

.table-row.with-checkbox {
  grid-template-columns: 36px 2fr 1fr 1fr 1fr 1fr 1fr 1fr 0.5fr;
}

.table-row.body.selected {
  background: rgba(239, 68, 68, 0.06);
  border-radius: 8px;
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

.status.sold {
  color: #2563eb;
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

.delete {
  border: none;
  border-radius: 999px;
  padding: 6px 14px;
  background: #ef4444;
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.delete:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.delete:hover:not(:disabled) {
  background: #dc2626;
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

.ghost {
  border: 1px solid #cbd5e1;
  background: transparent;
  padding: 6px 14px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  color: #475569;
}

.ghost:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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

@media (max-width: 720px) {
  .admin-topbar {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .panel-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .header-actions {
    width: 100%;
    display: flex;
    gap: 10px;
  }

  .header-actions button {
    flex: 1;
    text-align: center;
  }

  .filters {
    flex-direction: column;
    align-items: stretch;
    gap: 14px;
  }

  .search {
    width: 100%;
  }

  .search input {
    width: 100%;
  }

  .filter-group {
    flex-direction: column;
    align-items: stretch;
    width: 100%;
  }

  .filter-group :deep(.dropdown-menu),
  select {
    width: 100%;
  }
}
</style>
