<template>
  <div class="tracker">
    <Sidebar />

    <div class="content">
      <h2 class="title">{{ languageStore.t('transactionOfItem') }} </h2>

        <!-- ITEMS -->
        <div v-for="item in items" :key="item.customId" class="item-card">
          <div class="card-header">
            <h3>{{ item.name }}</h3>
            <span :class="['role-badge', getRoleClass(item)]">
              {{ getRoleBadge(item) }}
            </span>
          </div>

          <div class="card-details">
            <p>
              <strong>Transaction Type:</strong> 
              <span class="type-value ml-1 px-2 py-0.5 rounded text-xs font-semibold uppercase bg-gray-100 text-gray-700 font-mono">
                {{ getTransactionTypeLabel(item) }}
              </span>
            </p>
            <p>
              <strong>{{ getOwnerLabel(item) }}:</strong> {{ item.sellerName }}
            </p>
            <p>
              <strong>{{ getClientLabel(item) }}:</strong> {{ item.buyerName }}
            </p>
            <p>
              <strong>Status:</strong>
              <span :class="['status-badge', statusClass(item.status)]">
                {{ translateStatus(item.status) }}
              </span>
            </p>
          </div>

          <!-- EXPANDABLE PAYMENT & TRANSACTION DETAILS -->
          <div class="expand-details-btn-wrapper">
            <button 
              type="button" 
              class="btn-toggle-details"
              @click="toggleExpand(item.customId)"
            >
              {{ isExpanded(item.customId) ? 'Hide Payment Details ▴' : 'View Payment Details ▾' }}
            </button>
          </div>

          <div v-if="isExpanded(item.customId)" class="payment-details-panel">
            <h4 class="payment-title">Payment & Transaction Summary</h4>
            <div class="payment-grid">
              <div class="payment-field">
                <span class="field-label">Listing Price / Rate:</span>
                <span class="field-value">${{ Number(item.amount || 0).toFixed(2) }}</span>
              </div>
              <div class="payment-field">
                <span class="field-label">Platform Service Fee:</span>
                <span class="field-value">${{ Number(item.serviceFee || 0).toFixed(2) }}</span>
              </div>
              <div class="payment-field" v-if="item.deposit > 0">
                <span class="field-label">Refundable Deposit:</span>
                <span class="field-value">${{ Number(item.deposit || 0).toFixed(2) }}</span>
              </div>
              <div class="payment-field total-field">
                <span class="field-label font-bold">Total Paid/Amount:</span>
                <span class="field-value font-bold text-[#047857]">${{ Number(item.totalPaid || 0).toFixed(2) }}</span>
              </div>
              <div class="payment-field">
                <span class="field-label">Payment Method:</span>
                <span class="field-value capitalize font-semibold">{{ item.paymentMethod === 'card' ? '💳 Card' : '📱 QR transfer' }}</span>
              </div>
            </div>

            <!-- Slip Upload Preview -->
            <div v-if="item.paymentSlip" class="slip-preview-container">
              <span class="field-label">Payment Receipt Slip:</span>
              <div class="slip-image-wrapper">
                <img :src="item.paymentSlip" alt="Payment Slip Receipt" class="slip-image-preview" @click="openSlipFullSize(item.paymentSlip)" />
              </div>
              <p class="slip-click-hint">Click image to view in full resolution</p>
            </div>
          </div>

        <!-- ACTIONS -->
        <div class="actions" v-if="item.status !== 'Completed' && item.status !== 'Cancelled'">
          <!-- If current user is the Lender (Seller) -->
          <template v-if="isLender(item)">
            <button
              v-if="item.status === 'Pending'"
              class="btn btn-accept"
              @click="updateStatus(item, 'Accepted')"
            >
              Accept Request
            </button>

            <button
              v-if="item.status === 'Accepted'"
              class="btn btn-complete"
              @click="updateStatus(item, 'Completed')"
            >
              Confirm Completed
            </button>

            <button
              class="btn btn-cancel"
              @click="openCancelModal(item)"
            >
              Cancel Request
            </button>

            <button
              class="btn btn-chat"
              @click="openChatWith(item.buyerName)"
            >
              💬 Chat
            </button>
          </template>

          <!-- If current user is the Borrower (Buyer) -->
          <template v-else-if="isBorrower(item)">
            <button
              class="btn btn-cancel"
              @click="openCancelModal(item)"
            >
              Cancel Request
            </button>
            <button
              class="btn btn-chat"
              @click="openChatWith(item.sellerName)"
            >
              💬 Chat
            </button>
            <span class="status-waiting-msg">
              Waiting for lender action...
            </span>
          </template>
        </div>

        <!-- ACTIONS ON COMPLETE / CANCEL -->
        <div class="actions" v-if="item.status === 'Completed' || item.status === 'Cancelled'">
          <button
            class="btn btn-delete"
            @click="deleteTrackItem(item)"
          >
            🗑️ Delete Record
          </button>
        </div>

        <!-- HISTORY -->
        <div class="history">
          <h4>{{ languageStore.t('history') }}</h4>
          <ul>
            <li v-for="(log, index) in item.history" :key="index">
              {{ formatDate(log.time) }} →
              <strong>{{ translateStatus(log.status) }}</strong>
              <span v-if="log.reason"> ({{ log.reason }})</span>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- CANCEL MODAL -->
    <div v-if="showCancelModal" class="modal-overlay">
      <div class="modal">
        <h3>{{ languageStore.t('whyCancel') }}</h3>

        <select v-model="selectedReason">
          <option disabled value="">{{ languageStore.t('selectReason') }}</option>
          <option>{{ languageStore.t('itemNotAvailable') }} </option>
          <option>{{ languageStore.t('changedMyMind') }} </option>
          <option>{{ languageStore.t('wrongItemSelected') }}</option>
          <option>{{ languageStore.t('other') }}</option>
        </select>

        <div class="modal-actions">
          <button class="modal-btn confirm-btn" @click="confirmCancel">Confirm</button>
          <button class="modal-btn cancel-btn" @click="closeModal">Cancel</button>
        </div>
      </div>
    </div>

    <!-- CONFIRMATION DIALOG MODAL -->
    <div v-if="showConfirmModal" class="modal-overlay">
      <div class="modal">
        <h3>Confirm Action</h3>
        <p style="margin-top: 10px; font-size: 14px; color: #4b5563;">{{ confirmMessage }}</p>
        <div class="modal-actions">
          <button class="modal-btn confirm-btn" @click="handleConfirm">Yes</button>
          <button class="modal-btn cancel-btn" @click="closeConfirm">No</button>
        </div>
      </div>
    </div>

    <!-- WARNING MODAL -->
    <div v-if="showWarningModal" class="modal-overlay">
      <div class="modal">
        <h3>Warning</h3>
        <p style="margin-top: 10px; font-size: 14px; color: #4b5563;">{{ warningMessage }}</p>
        <div class="modal-actions">
          <button class="modal-btn confirm-btn" @click="showWarningModal = false">OK</button>
        </div>
      </div>
    </div>



    <!-- FULL SIZE SLIP MODAL -->
    <div v-if="showSlipModal" class="modal-overlay" @click="showSlipModal = false">
      <div class="modal slip-modal" @click.stop>
        <h3>Payment Receipt Slip</h3>
        <div class="full-slip-wrapper">
          <img :src="selectedSlip" alt="Full Receipt Slip" class="full-slip-img" />
        </div>
        <div class="modal-actions">
          <button class="modal-btn confirm-btn" @click="showSlipModal = false">Close</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Sidebar from '../userprofileComponent/Sidebar.vue'
import { getItems, updateStatus as apiUpdateStatus } from '@/services/trackitemuser'
import { useLanguageStore } from '../stores/language'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const languageStore = useLanguageStore()
const authStore = useAuthStore()
const router = useRouter()

const getRoleBadge = (item) => {
  const currentUser = authStore.user
  if (!currentUser) return 'User'
  
  const names = [currentUser.username, currentUser.name].filter(Boolean).map(n => n.toLowerCase())
  const isL = names.includes(String(item.sellerName || '').toLowerCase())
  
  const t = String(item.type || 'borrow').toLowerCase()
  if (t === 'sell') {
    return isL ? 'Seller' : 'Buyer'
  } else if (t === 'exchange') {
    return isL ? 'Owner' : 'Exchanger'
  } else {
    return isL ? 'Lender' : 'Borrower'
  }
}

const getRoleClass = (item) => {
  const currentUser = authStore.user
  if (!currentUser) return 'role-borrower'
  
  const names = [currentUser.username, currentUser.name].filter(Boolean).map(n => n.toLowerCase())
  const isL = names.includes(String(item.sellerName || '').toLowerCase())
  
  const t = String(item.type || 'borrow').toLowerCase()
  if (t === 'sell') {
    return isL ? 'role-seller' : 'role-buyer'
  } else if (t === 'exchange') {
    return isL ? 'role-owner' : 'role-exchanger'
  } else {
    return isL ? 'role-lender' : 'role-borrower'
  }
}

const getOwnerLabel = (item) => {
  const t = String(item.type || 'borrow').toLowerCase()
  if (t === 'sell') return 'Seller'
  if (t === 'exchange') return 'Owner'
  return 'Owner/Lender'
}

const getClientLabel = (item) => {
  const t = String(item.type || 'borrow').toLowerCase()
  if (t === 'sell') return 'Buyer'
  if (t === 'exchange') return 'Exchanger'
  return 'Borrower'
}

const getTransactionTypeLabel = (item) => {
  const t = String(item.type || 'borrow').toLowerCase()
  if (t === 'sell') return 'Sell'
  if (t === 'exchange') return 'Exchange'
  return 'Borrow / Lend'
}

/* STATE */
const items = ref([])
const showCancelModal = ref(false)
const selectedReason = ref('')
const selectedItem = ref(null)

const expandedItems = ref([])
const showSlipModal = ref(false)
const selectedSlip = ref('')

const toggleExpand = (customId) => {
  if (expandedItems.value.includes(customId)) {
    expandedItems.value = expandedItems.value.filter((id) => id !== customId)
  } else {
    expandedItems.value.push(customId)
  }
}

const isExpanded = (customId) => expandedItems.value.includes(customId)

const openSlipFullSize = (slipUrl) => {
  selectedSlip.value = slipUrl
  showSlipModal.value = true
}

const showConfirmModal = ref(false)
const confirmMessage = ref('')
let confirmCallback = null

const showWarningModal = ref(false)
const warningMessage = ref('')

const triggerConfirm = (message, onConfirm) => {
  confirmMessage.value = message
  confirmCallback = onConfirm
  showConfirmModal.value = true
}

const handleConfirm = () => {
  showConfirmModal.value = false
  if (confirmCallback) confirmCallback()
}

const closeConfirm = () => {
  showConfirmModal.value = false
  confirmCallback = null
}

const triggerWarning = (message) => {
  warningMessage.value = message
  showWarningModal.value = true
}

const openChatWith = (name) => {
  if (!name) return
  router.push({
    name: 'chat',
    query: {
      sellerId: name,
      sellerName: name
    }
  })
}

const deleteTrackItem = (item) => {
  triggerConfirm('Are you sure you want to delete this tracking record?', () => {
    try {
      const key = `hidden_trackers_${authStore.user?.id || 'guest'}`
      const hidden = JSON.parse(localStorage.getItem(key) || '[]')
      hidden.push(item.customId)
      localStorage.setItem(key, JSON.stringify(hidden))
      // Filter out the item instantly
      items.value = items.value.filter((i) => i.customId !== item.customId)
    } catch (err) {
      console.error('Delete/Hide error:', err)
    }
  })
}

const isBorrower = (item) => {
  const currentUser = authStore.user
  if (!currentUser) return false
  const names = [currentUser.username, currentUser.name].filter(Boolean).map(n => n.toLowerCase())
  return names.includes(String(item.buyerName || '').toLowerCase())
}

const isLender = (item) => {
  const currentUser = authStore.user
  if (!currentUser) return false
  const names = [currentUser.username, currentUser.name].filter(Boolean).map(n => n.toLowerCase())
  return names.includes(String(item.sellerName || '').toLowerCase())
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const year = d.getFullYear()
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')
  return `${month}/${day}/${year} ${hours}:${minutes}:${seconds}`
}

/* LOAD ITEMS */
const loadItems = async () => {
  try {
    const res = await getItems()
    console.log('Response:', res)
    const rawItems = Array.isArray(res.data) ? res.data : res.data?.data || []
    
    // Filter out locally hidden/deleted items
    const key = `hidden_trackers_${authStore.user?.id || 'guest'}`
    const hidden = JSON.parse(localStorage.getItem(key) || '[]')
    items.value = rawItems.filter((item) => !hidden.includes(item.customId))
    
    console.log('Items loaded:', items.value)
  } catch (err) {
    console.error('Load error:', err)
    items.value = []
  }
}

/* UPDATE STATUS */
const updateStatus = (item, newStatus) => {
  triggerConfirm(`Are you sure you want to change the status to "${newStatus}"?`, async () => {
    try {
      await apiUpdateStatus(item.customId, {
        status: newStatus,
      })
      await loadItems()
    } catch (err) {
      console.error('Update error:', err)
    }
  })
}

/* CANCEL MODAL */
const openCancelModal = (item) => {
  selectedItem.value = item
  selectedReason.value = ''
  showCancelModal.value = true
}

const closeModal = () => {
  showCancelModal.value = false
}

const confirmCancel = async () => {
  if (!selectedReason.value) {
    triggerWarning('Please select a reason')
    return
  }

  try {
    await apiUpdateStatus(selectedItem.value.customId, {
      status: 'Cancelled',
      reason: selectedReason.value,
    })

    showCancelModal.value = false
    await loadItems()
  } catch (err) {
    console.error('Cancel error:', err)
  }
}

/* STATUS COLORS */
const statusClass = (status) => ({
  available: status === 'Available',
  pending: status === 'Pending',
  accepted: status === 'Accepted',
  completed: status === 'Completed',
  cancelled: status === 'Cancelled',
})

const translateStatus = (status) => {
  const statusMap = {
    available: 'Available',
    pending: 'Pending',
    accepted: 'Accepted',
    completed: 'Completed',
    cancelled: 'Cancelled'
  }
  const lowerStatus = status.toLowerCase()
  return statusMap[lowerStatus] || status
}

/* INIT */
onMounted(loadItems)
</script>

<style scoped>
.tracker {
  display: flex;
  min-height: 100vh;
}

.content {
  flex: 1;
  padding: 30px;
}

.title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
}

/* ITEM */
.item-card {
  background: #f8fafc;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 24px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #f1f5f9;
  padding-bottom: 8px;
  margin-bottom: 12px;
}

.card-header h3 {
  margin: 0;
  font-size: 18px;
  color: #1e293b;
}

.role-badge {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  padding: 4px 10px;
  border-radius: 9999px;
  letter-spacing: 0.05em;
}

.role-seller {
  background-color: #ecfdf5;
  color: #047857;
  border: 1px solid #a7f3d0;
}

.role-buyer {
  background-color: #eff6ff;
  color: #1d4ed8;
  border: 1px solid #bfdbfe;
}

.role-owner {
  background-color: #fff7ed;
  color: #c2410c;
  border: 1px solid #ffedd5;
}

.role-exchanger {
  background-color: #faf5ff;
  color: #7e22ce;
  border: 1px solid #f3e8ff;
}

.role-lender {
  background-color: #f0fdfa;
  color: #0f766e;
  border: 1px solid #ccfbf1;
}

.role-borrower {
  background-color: #ecfeff;
  color: #0e7490;
  border: 1px solid #cffafe;
}

.card-details p {
  margin: 6px 0;
  font-size: 14px;
  color: #4b5563;
}

.status-badge {
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 13px;
  display: inline-block;
}

.status-badge.available {
  background-color: #d1fae5;
  color: #065f46;
}

.status-badge.pending {
  background-color: #fef3c7;
  color: #92400e;
}

.status-badge.accepted {
  background-color: #dbeafe;
  color: #1e40af;
}

.status-badge.completed {
  background-color: #d1fae5;
  color: #065f46;
}

.status-badge.cancelled {
  background-color: #fee2e2;
  color: #991b1b;
}

/* BUTTONS */
.actions {
  display: flex;
  gap: 10px;
  margin-top: 12px;
  margin-bottom: 20px;
}

.btn {
  padding: 8px 14px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  background: #e5e7eb;
}

/* ACTIVE & CUSTOM COLORS */
.btn-accept {
  background: #2563eb;
  color: white;
}
.btn-accept:hover {
  background: #1d4ed8;
}
.btn-complete {
  background: #16a34a;
  color: white;
}
.btn-complete:hover {
  background: #15803d;
}
.btn-cancel {
  background: #dc2626;
  color: white;
}
.btn-cancel:hover {
  background: #b91c1c;
}
.btn-chat {
  background: #0ea5e9;
  color: white;
}
.btn-chat:hover {
  background: #0284c7;
}
.btn-delete {
  background: #4b5563;
  color: white;
}
.btn-delete:hover {
  background: #374151;
}
.status-waiting-msg {
  font-size: 13px;
  color: #64748b;
  font-style: italic;
  align-self: center;
}

/* HISTORY */
.history {
  background: white;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #ddd;
}

/* STATUS COLORS */
.available {
  color: green;
}
.pending {
  color: orange;
}
.accepted {
  color: blue;
}
.completed {
  color: purple;
}
.cancelled {
  color: red;
}

/* MODAL */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal {
  background: white;
  padding: 20px;
  border-radius: 10px;
  width: 300px;
}

.modal select {
  width: 100%;
  margin-top: 10px;
  padding: 8px;
}

.modal-actions {
  margin-top: 15px;
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.modal-btn {
  flex: 1;
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.2s ease;
}

.confirm-btn {
  background: #1e1b4b;
  color: white;
}

.confirm-btn:hover {
  background: #2d2a5a;
}

.cancel-btn {
  background: #e5e7eb;
  color: #333;
}

.cancel-btn:hover {
  background: #d1d5db;
}

/* Expand Details Button styles */
.expand-details-btn-wrapper {
  margin-top: 14px;
  margin-bottom: 8px;
}

.btn-toggle-details {
  background: none;
  border: none;
  color: #ff8c00;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  padding: 0;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  transition: color 0.2s ease;
}

.btn-toggle-details:hover {
  color: #e07b00;
  text-decoration: underline;
}

/* Payment Details Panel */
.payment-details-panel {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 16px;
  margin-top: 12px;
  margin-bottom: 16px;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.02);
}

.payment-title {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 700;
  color: #0f172a;
  border-bottom: 1px solid #f1f5f9;
  padding-bottom: 6px;
}

.payment-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.payment-field {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.payment-field.total-field {
  border-top: 1px dashed #e2e8f0;
  padding-top: 8px;
}

.field-label {
  font-size: 11px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.field-value {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
}

/* Slip Preview */
.slip-preview-container {
  margin-top: 16px;
  border-top: 1px solid #f1f5f9;
  padding-top: 12px;
}

.slip-image-wrapper {
  margin-top: 8px;
  width: 120px;
  height: 120px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  overflow: hidden;
  cursor: pointer;
  background: #f8fafc;
  transition: transform 0.2s ease;
}

.slip-image-wrapper:hover {
  transform: scale(1.03);
}

.slip-image-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.slip-click-hint {
  margin: 4px 0 0 0;
  font-size: 11px;
  color: #94a3b8;
  font-style: italic;
}

/* Full Slip Modal */
.modal.slip-modal {
  width: 480px;
  max-width: 90%;
}

.full-slip-wrapper {
  margin-top: 12px;
  width: 100%;
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
}

.full-slip-img {
  width: 100%;
  height: auto;
  display: block;
}
</style>
