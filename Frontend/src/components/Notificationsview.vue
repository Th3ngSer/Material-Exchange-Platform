<template>
  <div class="page-layout">
    <NotifSidebar
      :items="sidebarItems"
      v-model:active="activeTab"
    />

    <main class="main-content">
      <h1 class="page-title">Notifications</h1>
      <p class="page-desc">Manage your exchanges, incoming messages, and borrow requests</p>

      <!-- Empty state -->
      <div v-if="filteredGroups.length === 0" class="empty-state">
        <span class="empty-icon">🔔</span>
        <p>No notifications in this category</p>
      </div>

      <!-- Date groups -->
      <TransitionGroup name="group-fade" tag="div">
        <div
          v-for="group in filteredGroups"
          :key="group.label"
          class="date-group"
        >
          <div class="date-label">{{ group.label }}</div>

          <TransitionGroup name="card-fade" tag="div">
            <NotifCard
              v-for="notif in group.items"
              :key="notif.id"
              :notif="notif"
              @action="handleAction"
              @dismiss="dismiss"
              @read="markRead"
            />
          </TransitionGroup>
        </div>
      </TransitionGroup>
    </main>
  </div>
</template>

<script setup lang="ts">
import NotifSidebar from './Notifsidebar.vue'
import NotifCard    from './Notifcard.vue'
import { useNotifications } from '../composable/useNotifications'

const {
  activeTab,
  sidebarItems,
  filteredGroups,
  markRead,
  dismiss,
} = useNotifications()

function handleAction(payload: { notifId: number; label: string }): void {
  console.log(`Action "${payload.label}" on notification #${payload.notifId}`)
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