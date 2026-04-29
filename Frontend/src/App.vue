<template>
<<<<<<< HEAD
  <router-view v-slot="{ Component }">
    <transition name="fade" mode="out-in">
      <component :is="Component" />
    </transition>
  </router-view>
</template>

<script setup lang="ts">
import Header from "./components/Header.vue"
</script>
=======
  <div class="app">
    <AppNavbar :unread-count="unreadCount" @toggle-notif="onToggleNotif" />
    <div class="app-body">
      <NotificationsView />
    </div>
    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import AppNavbar        from './components/Appnarbar.vue'
import AppFooter        from './components/Appfooter.vue'
import NotificationsView from './components/Notificationsview.vue'
import { useNotifications } from './composable/useNotifications'

const { unreadCount } = useNotifications()

function onToggleNotif(): void {
  console.log('Notification bell clicked')
}
</script>

<style>
/* Global reset & fonts */
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&family=DM+Sans:wght@400;500;600&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: 'DM Sans', sans-serif;
  background: #f4f5fb;
  color: #1a1f3c;
}

.app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.app-body {
  display: flex;
  flex: 1;
}
</style>
>>>>>>> 4f244c2 (Add Notification)
