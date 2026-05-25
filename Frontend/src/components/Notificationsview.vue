<template>
  <div class="flex flex-col min-h-screen">
    <NotificationNavBar />
    <div class="page-layout">
      <NotifSidebar
        :items="sidebarItems"
        v-model:active="activeTab"
      />

    <main class="main-content">
      <h1 class="page-title">Notifications</h1>
      <p class="page-desc">Manage your exchanges, incoming messages, and borrow requests</p>

      <!-- Loading state -->
      <div v-if="isLoading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading notifications...</p>
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="error-state">
        <span class="error-icon">⚠️</span>
        <p>{{ error }}</p>
        <p class="error-subtext">Using cached data. Please check your connection.</p>
      </div>

      <!-- Empty state -->
      <div v-else-if="filteredGroups.length === 0" class="empty-state">
        <span class="empty-icon">🔔</span>
        <p>No notifications in this category</p>
      </div>

      <!-- Date groups -->
      <TransitionGroup v-else name="group-fade" tag="div">
        <div
          v-for="group in filteredGroups"
          :key="group.label"
          class="date-group"
        >
          <div class="date-label">{{ group.label }}</div>

          <TransitionGroup name="card-fade" tag="div">
            <div
              v-for="notif in group.items"
              :key="notif.id"
              class="notif-wrapper"
              @click="openNotification(notif)"
            >
              <NotifCard
                :notif="notif"
                @action="handleAction(notif, $event)"
                @dismiss="dismiss"
                @read="markRead"
              />
            </div>
          </TransitionGroup>
        </div>
      </TransitionGroup>
    </main>
  </div>

  <!-- Detail Modal -->
  <NotificationDetailModal
    :notification="selectedNotification"
    :is-open="isModalOpen"
    @close="closeNotification"
    @reply="handleReply"
    @action="handleModalAction"
  />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import NotificationNavBar from './NotificationNavBar.vue'
import NotifSidebar from './Notifsidebar.vue'
import NotifCard from './Notifcard.vue'
import NotificationDetailModal from './NotificationDetailModal.vue'
import type { Notification } from '../types/notification'
import { useNotifications } from '../composable/useNotifications'

const {
  activeTab,
  sidebarItems,
  filteredGroups,
  markRead,
  dismiss,
  isLoading,
  error,
} = useNotifications()

const selectedNotification = ref<Notification | null>(null)
const isModalOpen = ref(false)

function openNotification(notif: Notification): void {
  selectedNotification.value = notif
  isModalOpen.value = true
  markRead(notif.id)
}

function closeNotification(): void {
  isModalOpen.value = false
  selectedNotification.value = null
}

function handleAction(notif: Notification, payload: { notifId: number; label: string }): void {
  console.log(`Action "${payload.label}" on notification #${payload.notifId}`)
  if (payload.label.toLowerCase().includes('reply') || payload.label.toLowerCase() === 'reply') {
    openNotification(notif)
  }
  if (payload.label.toLowerCase().includes('view')) {
    openNotification(notif)
  }
}

function handleReply(message: string): void {
  if (selectedNotification.value) {
    console.log(`Reply to notification #${selectedNotification.value.id}: ${message}`)
    // Here you would send the reply to your backend
  }
  closeNotification()
}

function handleModalAction(label: string): void {
  console.log(`Modal action: ${label}`)
  if (label.toLowerCase().includes('review')) {
    // Handle leave review
  }
  if (label.toLowerCase().includes('invoice')) {
    // Handle invoice
  }
}
</script>

<style scoped>
.page-layout {
  display: flex;
  flex: 1;
}

.main-content {
  flex: 1;
  padding: 36px 44px;
  max-width: 820px;
  min-height: calc(100vh - 56px);
}

.page-title {
  font-family: 'Sora', sans-serif;
  font-size: 28px;
  font-weight: 700;
  color: #1a1f3c;
  letter-spacing: -0.5px;
  margin-bottom: 6px;
}

.page-desc {
  font-size: 13.5px;
  color: #8b90a7;
  margin-bottom: 32px;
}

/* Date group */
.date-group { margin-bottom: 30px; }

.date-label {
  font-size: 11.5px;
  font-weight: 700;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: #8b90a7;
  margin-bottom: 12px;
}

/* Empty state */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 80px 0;
  color: #8b90a7;
  font-size: 14px;
}
.empty-icon { font-size: 40px; }

/* Loading state */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 80px 0;
  color: #8b90a7;
  font-size: 14px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f0f1ff;
  border-top: 3px solid #6366f1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Error state */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 80px 0;
  color: #ef4444;
  font-size: 14px;
}

.error-icon { 
  font-size: 40px; 
}

.error-subtext {
  color: #8b90a7;
  font-size: 12px;
}

/* Notification wrapper */
.notif-wrapper {
  cursor: pointer;
  transition: transform 0.2s;
}

.notif-wrapper:hover {
  transform: scale(1.01);
}

/* Transitions */
.group-fade-enter-active,
.group-fade-leave-active { transition: opacity .25s ease; }
.group-fade-enter-from,
.group-fade-leave-to { opacity: 0; }

.card-fade-enter-active { transition: all .28s ease; }
.card-fade-leave-active { transition: all .22s ease; position: absolute; width: 100%; }
.card-fade-enter-from   { opacity: 0; transform: translateY(10px); }
.card-fade-leave-to     { opacity: 0; transform: translateX(20px); }
</style>