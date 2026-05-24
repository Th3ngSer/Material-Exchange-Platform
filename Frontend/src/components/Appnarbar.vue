<template>
  <nav class="navbar">
    <!-- Logo -->

    <img src="/logo.png" alt="DoOrii" class="logo-img" />

    <!-- Nav links -->
    <ul class="nav-links">
      <li v-for="link in links" :key="link.label">
        <a
          href="#"
          :class="{ active: link.active }"
          @click.prevent="link.active = true"
        >{{ link.label }}</a>
      </li>
    </ul>

    <!-- Search -->
    <div class="search-bar">
      <select v-model="category" class="cat-select">
        <option value="">Category</option>
        <option value="materials">Materials</option>
        <option value="equipment">Equipment</option>
      </select>
      <span class="divider">|</span>
      <input v-model="query" type="text" placeholder="Search materials" class="search-input" />
      <svg class="search-icon" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="9" cy="9" r="6" stroke="currentColor" stroke-width="1.8"/>
        <path d="M13.5 13.5L17 17" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
      </svg>
    </div>

    <!-- Bell -->
    <div class="bell-wrap" @click="$emit('toggleNotif')">
    <img src="/bell.png" alt="Notifications" class="bell-icon" />
    <span v-if="unreadCount" class="bell-badge">{{ unreadCount }}</span>
</div>
  </nav>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{ unreadCount: number }>()
defineEmits<{ (e: 'toggleNotif'): void }>()

const category = ref<string>('')
const query    = ref<string>('')

const links = ref([
  { label: 'Browse', active: true },
  { label: 'Post',   active: false },
])
</script>

<style scoped>
.navbar {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 0 28px;
  height: 56px;
  background: #fff;
  border-bottom: 1.5px solid #e8eaf2;
  position: sticky;
  top: 0;
  z-index: 100;
}

.logo-img {
  max-height: 32px;
  width: auto;
  display: block;
  object-fit: contain;
  flex-shrink: 0;
}

.logo {
  font-family: 'Sora', sans-serif;
  font-size: 20px;
  font-weight: 700;
  color: #1a1f3c;
  letter-spacing: -0.5px;
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .logo-img {
    max-height: 24px;
  }
  .navbar {
    gap: 12px;
    padding: 0 12px;
  }
  .search-input {
    width: 90px;
  }
}
.logo span { color: #f97316; }

.nav-links {
  display: flex;
  gap: 20px;
  list-style: none;
}
.nav-links a {
  font-size: 14px;
  font-weight: 500;
  color: #8b90a7;
  text-decoration: none;
  transition: color .15s;
}
.nav-links a.active,
.nav-links a:hover { color: #1a1f3c; }

.search-bar {
  margin-left: auto;
  display: flex;
  align-items: center;
  background: #f4f5fb;
  border: 1.5px solid #e8eaf2;
  border-radius: 8px;
  padding: 6px 12px;
  gap: 8px;
}

.cat-select {
  border: none;
  background: transparent;
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  color: #1a1f3c;
  outline: none;
  cursor: pointer;
}

.divider { color: #e8eaf2; font-size: 16px; }

.search-input {
  border: none;
  background: transparent;
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  color: #1a1f3c;
  outline: none;
  width: 140px;
}
.search-input::placeholder { color: #8b90a7; }

.search-icon {
  width: 16px;
  height: 16px;
  color: #8b90a7;
  flex-shrink: 0;
}

.bell-wrap {
  position: relative;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #1a1f3c;
  flex-shrink: 0;
}
.bell-wrap:hover { background: rgba(0, 0, 0, 0.04); }
.bell-wrap svg,
.bell-wrap .bell-icon { width: 18px; height: 18px; }

.bell-badge {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 16px;
  height: 16px;
  background: #ef4444;
  border-radius: 50%;
  font-size: 9px;
  font-weight: 700;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid white;
}

.bell-icon {
  width: 20px;
  height: 20px;
  object-fit: contain;
}
</style>