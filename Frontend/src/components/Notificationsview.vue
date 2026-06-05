<template>
  <div class="flex flex-col min-h-screen bg-gray-50">
    <Header />
    <div class="flex flex-1">
      <!-- Sidebar -->
      <NotifSidebar
        :items="sidebarItems"
        v-model:active="activeTab"
      />

      <!-- Main Content -->
      <main class="flex-1 max-w-4xl mx-auto w-full">
        <div class="container-view">
          <!-- Header Section -->
          <div class="header-section">
            <div>
              <h1 class="page-title">Notifications</h1>
              <p class="page-desc">Stay updated on your exchanges, messages, and activity</p>
            </div>
            <button 
              class="refresh-btn"
              @click="fetchNotifications"
              :disabled="isLoading"
              :class="{ 'is-loading': isLoading }"
              title="Refresh notifications"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="23 4 23 10 17 10"></polyline>
                <polyline points="1 20 1 14 7 14"></polyline>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36M20.49 15a9 9 0 0 1-14.85 3.36"></path>
              </svg>
              <span>Refresh</span>
            </button>
          </div>

          <!-- Loading state -->
          <div v-if="isLoading" class="state-container loading-state">
            <div class="spinner"></div>
            <p class="state-text">Loading your notifications...</p>
          </div>

          <!-- Error state -->
          <div v-else-if="error" class="state-container error-state">
            <div class="state-icon">⚠️</div>
            <p class="state-title">Unable to load notifications</p>
            <p class="state-subtext">{{ error }}</p>
          </div>

          <!-- Empty state -->
          <div v-else-if="filteredGroups.length === 0" class="state-container empty-state">
            <div class="state-icon">🔔</div>
            <p class="state-title">No notifications yet</p>
            <p class="state-subtext">You're all caught up! Notifications will appear here when you receive messages or updates.</p>
          </div>

          <!-- Notifications List -->
          <TransitionGroup v-else name="group-fade" tag="div" class="notifications-list">
            <div
              v-for="group in filteredGroups"
              :key="group.label"
              class="date-section"
            >
              <div class="date-divider">
                <span class="date-label">{{ group.label }}</span>
              </div>

              <TransitionGroup name="card-fade" tag="div" class="cards-group">
                <div
                  v-for="notif in group.items"
                  :key="notif.id"
                  class="notif-item"
                >
                  <NotifCard
                    :notif="notif"
                    @action="handleAction(notif, $event)"
                    @dismiss="dismiss"
                    @read="markRead"
                    @click="openNotification(notif)"
                  />
                </div>
              </TransitionGroup>
            </div>
          </TransitionGroup>
        </div>
      </main>
    </div>

    <!-- Detail Modal -->
    <NotificationDetailModal
      :notification="selectedNotification"
      :is-open="isModalOpen"
      :open-review="openReview"
      @close="closeNotification"
      @reply="handleReply"
      @action="handleModalAction"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Header from './layout/Header.vue'
import NotifSidebar from './Notifsidebar.vue'
import NotifCard from './Notifcard.vue'
import NotificationDetailModal from './NotificationDetailModal.vue'
import type { Notification } from '../types/notification'
import { useNotifications, fetchNotificationById } from '../composable/useNotifications'

const router = useRouter()

const {
  activeTab,
  sidebarItems,
  filteredGroups,
  markRead,
  dismiss,
  isLoading,
  error,
  fetchNotifications,
} = useNotifications()

const selectedNotification = ref<Notification | null>(null)
const isModalOpen = ref(false)
const openReview = ref(false)

async function openNotification(notif: Notification, review = false): Promise<void> {
  openReview.value = review
  markRead(notif.id)
  dismiss(notif.id)   //delete after read

  try {
    const loaded = await fetchNotificationById(notif.id)
    selectedNotification.value = loaded
  } catch (err) {
    console.warn('Failed to load notification details from API:', err)
    selectedNotification.value = notif
  }

  isModalOpen.value = true
}

function closeNotification(): void {
  isModalOpen.value = false
  selectedNotification.value = null
  openReview.value = false
}

function handleAction(notif: Notification, payload: { notifId: string | number; label: string }): void {
  console.log(`Action "${payload.label}" on notification #${payload.notifId}`)
  const action = payload.label.toLowerCase()

  if (action.includes('view profile')) {
    const profileKey = notif.relatedUserId || notif.sender || notif.title || ''
    if (profileKey) {
      dismiss(notif.id)
      void router.push({ path: '/profile', query: { user: String(profileKey) } })
      return
    }
  }

  if (action.includes('leave review')) {
    void openNotification(notif, true)
    return
  }

  if (
    action.includes('view details') ||
    action.includes('view review') ||
    action.includes('view thread') ||
    action.includes('view order') ||
    action.includes('invoice') ||
    action.includes('reply') ||
    action === 'reply'
  ) {
    void openNotification(notif)
    return
  }

  // Fallback: open details for any action that doesn't have a dedicated route.
  void openNotification(notif)
}

function handleReply(message: string): void {
  if (selectedNotification.value) {
    console.log(`Reply to notification #${selectedNotification.value.id}: ${message}`)
    dismiss(selectedNotification.value.id)
  }
  closeNotification()
}

function handleModalAction(label: string): void {
  console.log(`Modal action: ${label}`)
  if (label.toLowerCase().includes('view profile')) {
    const profileIdentifier = selectedNotification.value?.relatedUserId || selectedNotification.value?.sender || ''
    if (profileIdentifier) {
      closeNotification()
      void router.push({ path: '/profile', query: { user: String(profileIdentifier) } })
      return
    }
  }

  if (label.toLowerCase().includes('review')) {
    if (selectedNotification.value) {
      dismiss(selectedNotification.value.id)
    }
    closeNotification()
  }
}
</script>

<!-- function closeNotification(): void {
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
</script> -->

<style scoped>
.flex-col {
  display: flex;
  flex-direction: column;
}

.flex {
  display: flex;
}

.flex-1 {
  flex: 1;
}

.min-h-screen {
  min-height: 100vh;
}

.bg-gray-50 {
  background-color: #f9fafb;
}

.w-full {
  width: 100%;
}

.mx-auto {
  margin-left: auto;
  margin-right: auto;
}

.max-w-4xl {
  max-width: 56rem;
}

.container-view {
  padding: 32px 20px;
  width: 100%;
}

@media (min-width: 768px) {
  .container-view {
    padding: 40px 32px;
  }
}

.header-section {
  margin-bottom: 32px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
}

.page-title {
  font-family: 'Sora', sans-serif;
  font-size: 32px;
  font-weight: 700;
  color: #1a1f3c;
  letter-spacing: -0.5px;
  margin: 0;
  margin-bottom: 8px;
}

.refresh-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 16px;
  background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.refresh-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #ea580c 0%, #dc4a0d 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3);
}

.refresh-btn:active:not(:disabled) {
  transform: translateY(0);
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.refresh-btn svg {
  width: 16px;
  height: 16px;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.refresh-btn.is-loading svg {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.page-desc {
  font-size: 14px;
  color: #8b90a7;
  margin: 0;
  line-height: 1.5;
}

/* States */
.state-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 120px 24px;
  text-align: center;
  border-radius: 12px;
  background: white;
  min-height: 400px;
}

.state-icon {
  font-size: 56px;
  line-height: 1;
}

.state-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1a1f3c;
}

.state-text {
  margin: 0;
  font-size: 14px;
  color: #8b90a7;
}

.state-subtext {
  margin: 0;
  font-size: 13px;
  color: #8b90a7;
  max-width: 420px;
  line-height: 1.5;
}

/* Loading state */
.loading-state {
  gap: 20px;
}

.spinner {
  width: 44px;
  height: 44px;
  border: 3px solid #e5e7eb;
  border-top-color: #f97316;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Error state */
.error-state .state-icon {
  color: #ef4444;
}

.error-state .state-title {
  color: #dc2626;
}

/* Empty state */
.empty-state .state-icon {
  color: #f97316;
}

/* Notifications list */
.notifications-list {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.date-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.date-divider {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 8px 0;
}

.date-divider::before,
.date-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: #e5e7eb;
}

.date-label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #9ca3af;
  white-space: nowrap;
  padding: 0 4px;
}

.cards-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.notif-item {
  animation: slideIn 0.3s ease both;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Transitions */
.group-fade-enter-active,
.group-fade-leave-active {
  transition: opacity 0.25s ease;
}

.group-fade-enter-from,
.group-fade-leave-to {
  opacity: 0;
}

.card-fade-enter-active {
  transition: all 0.28s ease;
}

.card-fade-leave-active {
  transition: all 0.22s ease;
  position: absolute;
  width: 100%;
  left: 0;
}

.card-fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.card-fade-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

/* Responsive */
@media (max-width: 768px) {
  .container-view {
    padding: 20px 12px;
  }

  .page-title {
    font-size: 24px;
  }

  .page-desc {
    font-size: 13px;
  }
}
</style>