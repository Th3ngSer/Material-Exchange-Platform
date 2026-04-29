<template>
  <div class="tracker">
    <Sidebar />

    <div class="content">
      <h2 class="title">Transaction of Item</h2>

      <!-- ITEMS -->
      <div v-for="item in items" :key="item.id" class="item-card">

        <h3>{{ item.name }}</h3>

        <p>
          Status:
          <span :class="statusClass(item.status)">
            {{ item.status }}
          </span>
        </p>

        <!-- ACTIONS -->
        <div class="actions">
          <button
            :class="['btn', { active: item.status === 'Pending' }]"
            @click="updateStatus(item, 'Pending')"
          >
            Pending
          </button>

          <button
            :class="['btn', { active: item.status === 'Accepted' }]"
            @click="updateStatus(item, 'Accepted')"
          >
            Accepted
          </button>

          <button
            :class="['btn', { active: item.status === 'Completed' }]"
            @click="updateStatus(item, 'Completed')"
          >
            Completed
          </button>

          <!-- CANCEL BUTTON -->
          <button
            :class="['btn', { active: item.status === 'Cancelled' }]"
            @click="openCancelModal(item)"
          >
            Cancelled
          </button>
        </div>

        <!-- HISTORY -->
        <div class="history">
          <h4>History</h4>
          <ul>
            <li v-for="(log, index) in item.history" :key="index">
              {{ log.time }} →
              <strong>{{ log.status }}</strong>
              <span v-if="log.reason"> ({{ log.reason }})</span>
            </li>
          </ul>
        </div>

      </div>
    </div>

    <!-- CANCEL MODAL -->
    <div v-if="showCancelModal" class="modal-overlay">
      <div class="modal">
        <h3>Why do you want to cancel?</h3>

        <select v-model="selectedReason">
          <option disabled value="">Select a reason</option>
          <option>Item not available</option>
          <option>Changed my mind</option>
          <option>Wrong item selected</option>
          <option>Other</option>
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
import { reactive, ref } from 'vue'
import Sidebar from '@/userprofileComponent/Sidebar.vue'

/* ITEMS */
const items = reactive([
  { id: 1, name: 'MacBook Pro 2019', status: 'Available', history: [] },
  { id: 2, name: 'iPhone 13', status: 'Pending', history: [] },
  { id: 3, name: 'Canon Camera', status: 'Accepted', history: [] },
  { id: 4, name: 'Headphones Sony', status: 'Completed', history: [] }
])

/* NORMAL STATUS UPDATE */
const updateStatus = (item, newStatus) => {
  item.status = newStatus

  item.history.unshift({
    status: newStatus,
    time: new Date().toLocaleString()
  })
}

/* STATUS COLOR */
const statusClass = (status) => {
  return {
    available: status === 'Available',
    pending: status === 'Pending',
    accepted: status === 'Accepted',
    completed: status === 'Completed',
    cancelled: status === 'Cancelled'
  }
}

/* CANCEL MODAL STATE */
const showCancelModal = ref(false)
const selectedReason = ref('')
const selectedItem = ref(null)

/* OPEN MODAL */
const openCancelModal = (item) => {
  selectedItem.value = item
  selectedReason.value = ''
  showCancelModal.value = true
}

/* CLOSE MODAL */
const closeModal = () => {
  showCancelModal.value = false
}

/* CONFIRM CANCEL */
const confirmCancel = () => {
  if (!selectedReason.value) {
    alert("Please select a reason")
    return
  }

  selectedItem.value.status = 'Cancelled'

  selectedItem.value.history.unshift({
    status: 'Cancelled',
    reason: selectedReason.value,
    time: new Date().toLocaleString()
  })

  showCancelModal.value = false
}
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

/* ITEM CARD */
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
  color: black;
}

/* ACTIVE BUTTON COLORS */
.btn.active:nth-child(1) { background: orange; color: white; }
.btn.active:nth-child(2) { background: blue; color: white; }
.btn.active:nth-child(3) { background: green; color: white; }
.btn.active:nth-child(4) { background: red; color: white; }

/* HISTORY */
.history {
  background: white;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #ddd;
}

/* STATUS TEXT COLORS */
.available { color: green; }
.pending { color: orange; }
.accepted { color: blue; }
.completed { color: purple; }
.cancelled { color: red; }

/* MODAL */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.4);
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

.modal-actions button {
  padding: 6px 12px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
</style>