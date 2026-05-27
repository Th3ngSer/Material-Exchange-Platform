<script setup lang="ts">
import type { ChatUser } from '@/types/chat'

const API_URL = 'http://localhost:3000'

const { users, selectedUser } = defineProps<{
  users: ChatUser[]
  selectedUser: ChatUser | null
}>()

const emit = defineEmits<{
  (e: 'select-user', user: ChatUser): void
}>()

const normalizeAvatarUrl = (value: string | undefined | null, name = 'User') => {
  const avatarValue = String(value || '').trim()
  if (!avatarValue || ['null', 'undefined'].includes(avatarValue.toLowerCase())) {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0D8ABC&color=fff`
  }
  if (avatarValue.startsWith('http')) {
    return avatarValue
  }
  if (avatarValue.startsWith('/')) {
    return `${API_URL}${avatarValue}`
  }
  return `${API_URL}/${avatarValue}`
}

const getAvatarUrl = (user: ChatUser) => {
  const avatarValue = user.avatar?.trim()
  if (avatarValue) {
    return normalizeAvatarUrl(avatarValue, user.name || 'User')
  }

  const stored = localStorage.getItem(`avatar_${String(user.id)}`)
  if (stored) {
    return normalizeAvatarUrl(stored, user.name || 'User')
  }

  return `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=0D8ABC&color=fff`
}

const handleAvatarError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.src = 'https://via.placeholder.com/48'
}
</script>

<template>
  <aside class="sidebar">

    <div class="sidebar-header">
      <h3>ប្រអប់សារ</h3>
    </div>

    <!-- ❗ FIX 1: empty state -->
    <div v-if="!users || users.length === 0" class="empty">
      No users found
    </div>

    <div v-else class="conversation-list">

      <div
        v-for="user in users"
        :key="user.id"
        :class="['user', { active: selectedUser?.id === user.id }]"
        @click="emit('select-user', user)"
      >
        <div class="avatar-wrapper" :class="{ online: user.online }">

          <img
            :src="getAvatarUrl(user)"
            :alt="user.name"
            class="avatar-img"
            @error="handleAvatarError"
          />

        </div>

        <div class="content">
          <div class="user-header">
            <p class="name">{{ user.name }}</p>
            <span class="time">{{ user.time }}</span>
          </div>
          <p class="message">{{ user.message }}</p>
        </div>

      </div>

    </div>

  </aside>
</template>

<style scoped>
.sidebar {
  width: 400px;
  background: #0f172a;
  color: white;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #1e293b;
  flex-shrink: 0;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #1e293b;
}

.sidebar-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
}

.user {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 15px 20px;
  cursor: pointer;
  transition: all 0.2s;
  border-left: 3px solid transparent;
}

.user.active {
  background: #1e293b;
  border-left-color: #ef4444;
}

.avatar-wrapper {
  position: relative;
  flex-shrink: 0;
  width: 48px;
  height: 48px;
}

.avatar-img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  background: #3b82f6;
}

.avatar-wrapper.online::after {
  content: '';
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 10px;
  height: 10px;
  background: #22c55e;
  border-radius: 50%;
  border: 2px solid #0f172a;
}

.content {
  flex: 1;
  min-width: 0;
}

.user-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.name {
  font-size: 14px;
  font-weight: 600;
  margin: 0;
  color: white;
}

.time {
  font-size: 12px;
  color: #64748b;
}

.message {
  font-size: 13px;
  color: #94a3b8;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ❗ FIX 3: empty state style */
.empty {
  padding: 20px;
  text-align: center;
  color: #64748b;
  font-size: 14px;
}
</style>