<script setup lang="ts">
import AdminLayout from '@/components/Admin/AdminLayout.vue'
import { authFetch } from '@/utils/authFetch'
import { getToken } from '@/utils/tokenStorage'
import { computed, onMounted, ref } from 'vue'

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

// ─── Selection mode state ───────────────────────────────────────────────
const selectMode = ref(false)
const selectedIds = ref<Set<string>>(new Set())
const showConfirmModal = ref(false)
const isDeleting = ref(false)

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

const isAllSelected = computed(
  () => reports.value.length > 0 && selectedIds.value.size === reports.value.length,
)

const toggleSelectAll = () => {
  if (isAllSelected.value) {
    selectedIds.value = new Set()
  } else {
    selectedIds.value = new Set(reports.value.map((r) => r.id))
  }
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
    const response = await authFetch(`${API_BASE_URL}/admin/reports`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ ids: Array.from(selectedIds.value) }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.message || 'Failed to delete reports')
    }

    // Remove deleted reports from the local list
    reports.value = reports.value.filter((r) => !selectedIds.value.has(r.id))
    selectedIds.value = new Set()
    selectMode.value = false
    showConfirmModal.value = false
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete reports'
    alert(message)
  } finally {
    isDeleting.value = false
  }
}

const showViewModal = ref(false)
const viewingReport = ref<AdminReport | null>(null)

const openViewModal = (report: AdminReport) => {
  viewingReport.value = report
  showViewModal.value = true
  // Optionally, automatically mark as reviewed when they open it
  if (report.status === 'Pending') {
    updateStatus(report.id, 'reviewed')
  }
}

const closeViewModal = () => {
  showViewModal.value = false
  setTimeout(() => {
    viewingReport.value = null
  }, 200) // wait for animation
}

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

const formatDate = (value?: string): string => {
  if (!value) return '---'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value || '---'
  const parts = date.toISOString().split('T')
  return parts[0] ?? '---'
}

const fetchReports = async () => {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const token = getToken()
    const response = await authFetch(`${API_BASE_URL}/admin/reports`, {
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
    const token = getToken()
    const response = await authFetch(`${API_BASE_URL}/admin/reports/${reportId}/status`, {
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
</script>

<template>
  <AdminLayout>
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
          <div class="table-row header" :class="{ 'with-checkbox': selectMode }">
            <label v-if="selectMode" class="checkbox-cell" @click.stop>
              <input
                type="checkbox"
                :checked="isAllSelected"
                @change="toggleSelectAll"
              />
            </label>
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
          <div
            v-for="report in reports"
            :key="report.id"
            class="table-row body"
            :class="{ 'with-checkbox': selectMode, selected: selectedIds.has(report.id) }"
          >
            <label v-if="selectMode" class="checkbox-cell" @click.stop>
              <input
                type="checkbox"
                :checked="selectedIds.has(report.id)"
                @change="toggleSelect(report.id)"
              />
            </label>
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
                @click="openViewModal(report)"
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
            <h3 class="modal-title">Delete Reports</h3>
            <p class="modal-body">
              Are you sure you want to delete
              <strong>{{ selectedIds.size }}</strong>
              {{ selectedIds.size === 1 ? 'report' : 'reports' }}?
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

    <!-- ─── View Report Details Modal ────────────────────────────────────── -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="showViewModal" class="modal-overlay" @click.self="closeViewModal">
          <div class="modal-card view-modal">
            <div class="modal-header">
              <h3 class="modal-title">Report Details</h3>
              <button class="close-btn" @click="closeViewModal">&times;</button>
            </div>
            
            <div v-if="viewingReport" class="modal-content">
              <div class="detail-row">
                <span class="detail-label">Status:</span>
                <span class="status" :class="viewingReport.status.toLowerCase()">{{ viewingReport.status }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Report ID:</span>
                <span class="detail-value">#{{ viewingReport.id }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Date:</span>
                <span class="detail-value">{{ viewingReport.date }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Reported By:</span>
                <span class="detail-value">{{ viewingReport.name }} ({{ viewingReport.email }})</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Phone:</span>
                <span class="detail-value">{{ viewingReport.phone || 'N/A' }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Request Type:</span>
                <span class="detail-value">{{ viewingReport.request || 'N/A' }}</span>
              </div>
              
              <div class="detail-message-box">
                <span class="detail-label">Message / Reason:</span>
                <p class="detail-message">{{ viewingReport.message }}</p>
              </div>
            </div>

            <div class="modal-actions">
              <button class="modal-btn cancel" type="button" @click="closeViewModal">
                Close
              </button>
              <button 
                v-if="viewingReport?.status !== 'Done'"
                class="modal-btn confirm" 
                type="button" 
                @click="updateStatus(viewingReport!.id, 'done'); closeViewModal()"
              >
                Mark as Done
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

.reason,
.target {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.table-row {
  display: grid;
  grid-template-columns: 0.9fr 0.9fr 1.6fr 2fr 1fr 1fr 1.2fr;
  gap: 8px;
  font-size: 13px;
  padding: 10px 0;
  align-items: center;
  border-bottom: 1px solid #e2e8f0;
  min-width: 850px;
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

  .card-row {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
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

  select {
    width: 100%;
  }
}

/* ─── Selection mode ─────────────────────────────────────────────────── */

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
  grid-template-columns: 36px 0.9fr 0.9fr 1.6fr 2fr 1fr 1fr 0.5fr;
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

/* ─── View Modal Specifics ───────────────────────────────────────────── */

.view-modal {
  max-width: 500px;
  text-align: left;
  padding: 24px 28px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 12px;
  margin-bottom: 16px;
}

.modal-header .modal-title {
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  line-height: 1;
  color: #64748b;
  cursor: pointer;
  transition: color 0.2s ease;
}

.close-btn:hover {
  color: #0f172a;
}

.modal-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}

.detail-row {
  display: flex;
  gap: 8px;
  font-size: 14px;
}

.detail-label {
  font-weight: 600;
  color: #475569;
  min-width: 110px;
}

.detail-value {
  color: #0f172a;
}

.detail-message-box {
  margin-top: 8px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 12px;
}

.detail-message {
  margin: 8px 0 0;
  font-size: 14px;
  color: #0f172a;
  white-space: pre-wrap;
  line-height: 1.5;
}
</style>
