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
          {{ item.label }}
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
  width: 200px;
  background: #fff;
  border-right: 1.5px solid #e8eaf2;
  padding: 24px 0;
  flex-shrink: 0;
  position: sticky;
  top: 56px;
  height: calc(100vh - 56px);
  overflow-y: auto;
}

.sidebar-title {
  font-family: 'Sora', sans-serif;
  font-size: 15px;
  font-weight: 700;
  color: #1a1f3c;
  padding: 0 18px 4px;
}

.sidebar-sub {
  font-size: 11px;
  color: #8b90a7;
  padding: 0 18px 20px;
}

.sidebar-menu {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 0 10px;
}

.sidebar-menu li a {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 10px;
  border-radius: 8px;
  font-size: 13.5px;
  font-weight: 500;
  color: #8b90a7;
  text-decoration: none;
  transition: background .13s, color .13s;
}

.sidebar-menu li a:hover {
  background: #f4f5fb;
  color: #1a1f3c;
}

.sidebar-menu li.active a {
  background: #f97316;
  color: #fff;
}

.count-badge {
  margin-left: auto;
  background: #f97316;
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  padding: 1px 7px;
  border-radius: 20px;
}

.sidebar-menu li.active a .count-badge {
  background: rgba(255, 255, 255, 0.25);
}
</style>