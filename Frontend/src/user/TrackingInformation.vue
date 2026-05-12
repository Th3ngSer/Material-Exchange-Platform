<template>
  <div class="tracker">
    <Sidebar />

    <div class="content">
      <h2 class="title"><!-- {{ languageStore.t('transactionOfItem') }} -->Transaction of Item</h2>

      <!-- ITEMS -->
      <div v-for="item in items" :key="item._id" class="item-card">
        <h3>{{ item.name }}</h3>

        <p>
          <!-- {{ languageStore.t('status') }} -->Status:
          <span :class="statusClass(item.status)">
            {{ translateStatus(item.status) }}
          </span>
        </p>

        <!-- ACTIONS -->
        <div class="actions">
          <button
            :class="['btn', { active: item.status === 'Pending' }]"
            @click="updateStatus(item, 'Pending')"
          >
            <!-- {{ languageStore.t('pending') }} -->Pending
          </button>

          <button
            :class="['btn', { active: item.status === 'Accepted' }]"
            @click="updateStatus(item, 'Accepted')"
          >
            <!-- {{ languageStore.t('accepted') }} -->Accepted
          </button>

          <button
            :class="['btn', { active: item.status === 'Completed' }]"
            @click="updateStatus(item, 'Completed')"
          >
            <!-- {{ languageStore.t('completed') }} -->Completed
          </button>

          <button
            :class="['btn', { active: item.status === 'Cancelled' }]"
            @click="openCancelModal(item)"
          >
            <!-- {{ languageStore.t('cancelled') }} -->Cancelled
          </button>
        </div>

        <!-- HISTORY -->
        <div class="history">
          <h4><!-- {{ languageStore.t('history') }} -->History</h4>
          <ul>
            <li v-for="(log, index) in item.history" :key="index">
              {{ log.time }} →
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
        <h3><!-- {{ languageStore.t('whyCancel') }} -->Why Cancel?</h3>

        <select v-model="selectedReason">
          <option disabled value=""><!-- {{ languageStore.t('selectReason') }} -->Select Reason</option>
          <option><!-- {{ languageStore.t('itemNotAvailable') }} -->Item Not Available</option>
          <option><!-- {{ languageStore.t('changedMyMind') }} -->Changed My Mind</option>
          <option><!-- {{ languageStore.t('wrongItemSelected') }} -->Wrong Item Selected</option>
          <option><!-- {{ languageStore.t('other') }} -->Other</option>
        </select>

        <div class="modal-actions">
          <button @click="confirmCancel">Confirm</button>
          <button @click="closeModal">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Sidebar from '../userprofileComponent/Sidebar.vue'
import { getItems, updateStatus as apiUpdateStatus } from '@/services/trackitemuser'

/* STATE */
const items = ref([])
const showCancelModal = ref(false)
const selectedReason = ref('')
const selectedItem = ref(null)

/* LOAD ITEMS */
const loadItems = async () => {
  try {
    const res = await getItems()
    items.value = res.data
  } catch (err) {
    console.error('Load error:', err)
  }
}

/* UPDATE STATUS */
const updateStatus = async (item, newStatus) => {
  try {
    await apiUpdateStatus(item._id, {
      status: newStatus,
    })

    await loadItems()
  } catch (err) {
    console.error('Update error:', err)
  }
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
    alert('Please select a reason')
    return
  }

  try {
    await apiUpdateStatus(selectedItem.value._id, {
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
  background: #f4f4f4;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 20px;
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

/* ACTIVE COLORS */
.btn.active:nth-child(1) {
  background: orange;
  color: white;
}
.btn.active:nth-child(2) {
  background: blue;
  color: white;
}
.btn.active:nth-child(3) {
  background: green;
  color: white;
}
.btn.active:nth-child(4) {
  background: red;
  color: white;
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
}
</style>
