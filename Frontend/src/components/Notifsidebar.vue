<template>
  <aside class="sidebar">
    <div class="sidebar-title">Notifications</div>
    <div class="sidebar-sub">Monitor all platform notifications</div>

    <ul class="sidebar-menu">
      <li
        v-for="item in items"
        :key="item.key"
        :class="{ active: active === item.key }"
      >
        <a href="#" @click.prevent="$emit('update:active', item.key)">
          <span class="sidebar-icon">{{ item.icon }}</span>
          <span>{{ item.label }}</span>
          <span v-if="item.count" class="count-badge">{{ item.count }}</span>
        </a>
      </li>
    </ul>
  </aside>
</template>

<script setup lang="ts">
import type { SidebarItem, SidebarKey } from '../types/notification'

defineProps<{
  items: SidebarItem[]
  active: SidebarKey
}>()

defineEmits<{
  (e: 'update:active', key: SidebarKey): void
}>()
</script>

<style scoped>
.sidebar {
  width: 240px;
  background: white;
  border-right: 1px solid #e5e7eb;
  padding: 24px 0;
  flex-shrink: 0;
  position: sticky;
  top: 66px;
  height: calc(100vh - 66px);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.sidebar-title {
  font-family: 'Sora', sans-serif;
  font-size: 16px;
  font-weight: 700;
  color: #1a1f3c;
  padding: 0 20px 6px;
  letter-spacing: -0.3px;
}

.sidebar-sub {
  font-size: 12px;
  color: #9ca3af;
  padding: 0 20px 24px;
  line-height: 1.4;
}

.sidebar-menu {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 0 12px;
  flex: 1;
}

.sidebar-menu li a {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  text-decoration: none;
  transition: all 0.2s ease;
  position: relative;
}

.sidebar-icon {
  font-size: 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
}

.sidebar-menu li a:hover {
  background: #f3f4f6;
  color: #1a1f3c;
}

.sidebar-menu li.active a {
  background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
  color: white;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.2);
}

.sidebar-menu li.active a::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 20px;
  background: white;
  border-radius: 0 3px 3px 0;
  opacity: 0;
}

.count-badge {
  margin-left: auto;
  background: #f97316;
  color: white;
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 12px;
  min-width: 24px;
  text-align: center;
}

.sidebar-menu li.active a .count-badge {
  background: rgba(255, 255, 255, 0.3);
}

/* Scrollbar styling */
.sidebar::-webkit-scrollbar {
  width: 6px;
}

.sidebar::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}

.sidebar::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

/* Responsive */
@media (max-width: 1024px) {
  .sidebar {
    width: 200px;
    padding: 20px 0;
  }

  .sidebar-title {
    font-size: 15px;
    padding: 0 16px 4px;
  }

  .sidebar-sub {
    font-size: 11px;
    padding: 0 16px 20px;
  }

  .sidebar-menu {
    padding: 0 8px;
  }

  .sidebar-menu li a {
    font-size: 13px;
    padding: 9px 10px;
  }
}

@media (max-width: 768px) {
  .sidebar {
    display: none;
  }
}
</style>