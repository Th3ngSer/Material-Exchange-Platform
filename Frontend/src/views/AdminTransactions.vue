<script setup lang="ts">
import AdminLayout from '@/components/Admin/AdminLayout.vue'
import DropDownMenu from '@/components/DropDownMenu.vue'
import { authFetch } from '@/utils/authFetch'
import { getToken } from '@/utils/tokenStorage'
import { onMounted, ref, computed } from 'vue'

const searchQuery = ref('')
const sortBy = ref('A-Z')
const statusFilter = ref('All status')

const sortItems = [
  { label: 'A-Z', value: 'A-Z' },
  { label: 'Z-A', value: 'Z-A' },
  { label: 'Newest', value: 'Newest' },
]

const statusItems = [
  { label: 'All status', value: 'All status' },
  { label: 'Active', value: 'Active' },
  { label: 'Completed', value: 'Completed' },
  { label: 'Failed', value: 'Failed' },
]

type Transaction = {
  id: string
  buyer: string
  seller: string
  item: string
  amount: string
  commission: string
  type: string
  status: string
  date: string
  rawType: string
  rawAmount: number
  rawServiceFee?: number
}

type TransactionApi = {
  _id: string
  buyerName: string
  sellerName: string
  itemTitle: string
  amount?: number
  serviceFee?: number
  type: string
  status: string
  createdAt?: string
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

const transactions = ref<Transaction[]>([])
const isLoading = ref(false)
const errorMessage = ref('')

const formatDate = (value?: string): string => {
  if (!value) return '---'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value ?? '---'
  
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  const hh = String(date.getHours()).padStart(2, '0')
  const min = String(date.getMinutes()).padStart(2, '0')
  const ss = String(date.getSeconds()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`
}

const calculateCommission = (type: string, amount: number | undefined): string => {
  if (amount === undefined || Number.isNaN(amount)) return '---'
  const t = type.toLowerCase()
  if (t === 'borrow') {
    return `$${(amount * 0.10).toFixed(2)} (10%)`
  }
  if (t === 'sell') {
    return `$${(amount * 0.05).toFixed(2)} (5%)`
  }
  if (t === 'exchange') {
    return '$1.00 (Flat)'
  }
  return '---'
}

const rawCommission = (type: string, amount: number | undefined, serviceFee: number | undefined): number => {
  if (serviceFee !== undefined && serviceFee !== null) return serviceFee
  if (amount === undefined || Number.isNaN(amount)) return 0
  const t = type.toLowerCase()
  if (t === 'borrow') return amount * 0.10
  if (t === 'sell') return amount * 0.05
  if (t === 'exchange') return 1.00
  return 0
}

const fetchTransactions = async () => {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const token = getToken()
    const response = await authFetch(`${API_BASE_URL}/transactions/admin/all`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.message || 'Failed to load transactions')
    }

    const data = (await response.json()) as TransactionApi[]
    transactions.value = (data ?? []).map((item) => ({
      id: `#${item._id.slice(-6)}`,
      buyer: item.buyerName,
      seller: item.sellerName,
      item: item.itemTitle,
      amount: item.amount !== undefined ? `$${Number(item.amount).toFixed(2)}` : '---',
      commission: item.serviceFee !== undefined && item.serviceFee !== null
        ? `$${Number(item.serviceFee).toFixed(2)}`
        : calculateCommission(item.type, item.amount),
      type: item.type ? item.type.charAt(0).toUpperCase() + item.type.slice(1) : '---',
      status: item.status ? item.status.charAt(0).toUpperCase() + item.status.slice(1) : 'Active',
      date: formatDate(item.createdAt),
      rawType: item.type || '',
      rawAmount: item.amount || 0,
      rawServiceFee: item.serviceFee,
    }))
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Failed to load transactions'
  } finally {
    isLoading.value = false
  }
}

const filteredTransactions = computed(() => {
  let list = [...transactions.value]

  // Filter by search query
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim()
    list = list.filter(
      (item) =>
          item.buyer.toLowerCase().includes(q) ||
          item.seller.toLowerCase().includes(q) ||
          item.item.toLowerCase().includes(q) ||
          item.id.toLowerCase().includes(q),
    )
  }

  // Filter by status
  if (statusFilter.value !== 'All status') {
    list = list.filter((item) => item.status.toLowerCase() === statusFilter.value.toLowerCase())
  }

  // Sort
  if (sortBy.value === 'A-Z') {
    list.sort((a, b) => a.item.localeCompare(b.item))
  } else if (sortBy.value === 'Z-A') {
    list.sort((a, b) => b.item.localeCompare(a.item))
  } else if (sortBy.value === 'Newest') {
    list.sort((a, b) => {
      const dateA = a.date ? new Date(a.date).getTime() : 0
      const dateB = b.date ? new Date(b.date).getTime() : 0
      return dateB - dateA
    })
  }

  return list
})

const totalVolume = computed(() => {
  const sum = transactions.value.reduce((acc, curr) => acc + (curr.rawAmount || 0), 0)
  return `$${sum.toFixed(2)}`
})

const totalCommission = computed(() => {
  const sum = transactions.value.reduce((acc, curr) => {
    return acc + rawCommission(curr.rawType, curr.rawAmount, curr.rawServiceFee)
  }, 0)
  return `$${sum.toFixed(2)}`
})

const activeCount = computed(() => {
  return transactions.value.filter((t) => t.status.toLowerCase() === 'active').length
})

onMounted(fetchTransactions)
</script>

<template>
  <AdminLayout>
      <header class="admin-topbar">
        <div class="topbar-left">
          <div class="topbar-icon"></div>
          <div>
            <p class="topbar-label">Admin Panel</p>
            <h1>Transactions</h1>
          </div>
        </div>
        <div class="topbar-user">
          <span class="topbar-role">Admin</span>
          <div class="avatar"></div>
        </div>
      </header>

      <section class="transaction-panel">
        <div class="panel-header">
          <div>
            <p class="section-label">Monitor all platform transactions</p>
            <p class="section-subtitle">Track the flow of payments and exchanges across listings.</p>
          </div>
          <button class="primary">Select</button>
        </div>

        <!-- Summary Cards Grid -->
        <div class="summary-cards">
          <div class="summary-card">
            <div class="card-icon volume">💼</div>
            <div class="card-info">
              <span class="card-label">Total Volume</span>
              <span class="card-value">{{ totalVolume }}</span>
            </div>
          </div>
          <div class="summary-card">
            <div class="card-icon commission">📈</div>
            <div class="card-info">
              <span class="card-label">Total Commission</span>
              <span class="card-value">{{ totalCommission }}</span>
            </div>
          </div>
          <div class="summary-card">
            <div class="card-icon active-tx">🔄</div>
            <div class="card-info">
              <span class="card-label">Active Transacts</span>
              <span class="card-value">{{ activeCount }}</span>
            </div>
          </div>
        </div>

        <div class="filters">
          <label class="search">
            <span class="search-icon"></span>
            <input v-model="searchQuery" type="text" placeholder="Search transactions..." />
          </label>
          <div class="filter-group">
            <DropDownMenu v-model="sortBy" :items="sortItems" size="lg" />
            <DropDownMenu v-model="statusFilter" :items="statusItems" size="sm" />
          </div>
        </div>

        <div class="table">
          <p v-if="isLoading" class="table-note">Loading transactions...</p>
          <p v-else-if="errorMessage" class="table-note error">{{ errorMessage }}</p>
          <div class="table-row header">
            <span>ID</span>
            <span>Buyer</span>
            <span>Seller</span>
            <span>Item</span>
            <span>Amount</span>
            <span>Commission</span>
            <span>Type</span>
            <span>Status</span>
            <span>Date</span>
          </div>
          <div v-for="transaction in filteredTransactions" :key="transaction.id" class="table-row body">
            <span>{{ transaction.id }}</span>
            <span>{{ transaction.buyer }}</span>
            <span>{{ transaction.seller }}</span>
            <span>{{ transaction.item }}</span>
            <span>{{ transaction.amount }}</span>
            <span>{{ transaction.commission }}</span>
            <span>{{ transaction.type }}</span>
            <span class="status" :class="transaction.status.toLowerCase()">{{ transaction.status }}</span>
            <span>{{ transaction.date }}</span>
          </div>
        </div>
      </section>
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

.transaction-panel {
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

.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.summary-card {
  display: flex;
  align-items: center;
  gap: 16px;
  background: #f8fafc;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.card-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.card-icon.volume {
  background: rgba(37, 99, 235, 0.1);
}

.card-icon.commission {
  background: rgba(22, 163, 74, 0.1);
}

.card-icon.active-tx {
  background: rgba(234, 179, 8, 0.1);
}

.card-info {
  display: flex;
  flex-direction: column;
}

.card-label {
  font-size: 12px;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.card-value {
  font-size: 20px;
  font-weight: 700;
  color: #0f172a;
}

.table-row {
  display: grid;
  grid-template-columns: 0.7fr 1fr 1fr 1.6fr 1fr 1.2fr 1fr 1fr 1fr;
  gap: 8px;
  font-size: 13px;
  padding: 10px 0;
  align-items: center;
  border-bottom: 1px solid #e2e8f0;
  min-width: 950px;
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

.status.completed {
  color: #2563eb;
}

.status.failed {
  color: #ef4444;
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
