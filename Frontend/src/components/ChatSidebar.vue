<script setup lang="ts">
import { ref, computed } from 'vue'
import type { ChatUser } from '../types/chat'

const API_URL = 'http://localhost:3000'

const { users, selectedUser } = defineProps<{
  users: ChatUser[]
  selectedUser: ChatUser | null
}>()

const emit = defineEmits<{
  (e: 'select-user', user: ChatUser): void
  (e: 'delete-users', userIds: string[]): void
}>()

const selectedUserIds = ref<string[]>([])
const selectedUserCount = computed(() => selectedUserIds.value.length)
const isSelectMode = ref(false)
const showDeleteConfirm = ref(false)
const actionLabel = computed(() => 'Select')

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

const toggleSelectMode = () => {
  isSelectMode.value = !isSelectMode.value
  if (!isSelectMode.value) {
    selectedUserIds.value = []
    showDeleteConfirm.value = false
  }
}

const requestDeleteUsers = () => {
  if (selectedUserCount.value === 0) return
  showDeleteConfirm.value = true
}

const cancelDelete = () => {
  showDeleteConfirm.value = false
}

const confirmDelete = () => {
  if (selectedUserCount.value === 0) {
    showDeleteConfirm.value = false
    return
  }

  emit('delete-users', [...selectedUserIds.value])
  selectedUserIds.value = []
  isSelectMode.value = false
  showDeleteConfirm.value = false
}

const toggleUserSelection = (event: Event, user: ChatUser) => {
  event.stopPropagation()
  const userId = String(user.id)
  const index = selectedUserIds.value.indexOf(userId)
  if (index !== -1) {
    selectedUserIds.value.splice(index, 1)
  } else {
    selectedUserIds.value.push(userId)
  }
}

const isUserSelected = (user: ChatUser) => {
  return selectedUserIds.value.includes(String(user.id))
}

const deleteSpecificUser = (user: ChatUser) => {
  emit('delete-users', [String(user.id)])
  selectedUserIds.value = selectedUserIds.value.filter(id => id !== String(user.id))
}
</script>

<template>
  <aside class="sidebar">

    <div class="sidebar-header">
      <h3>ប្រអប់សារ</h3>

      <div class="header-controls">
        <template v-if="isSelectMode">
          <button
            :disabled="selectedUserCount === 0"
            class="remove-selected-btn"
            @click="confirmDelete"
            title="Remove selected chats"
          >
            Remove
          </button>
          <button class="header-cancel-btn" @click="toggleSelectMode">
            Cancel
          </button>
        </template>

        <template v-else>
          <button 
            class="select-btn"
            @click="toggleSelectMode"
            title="Select"
          >
            {{ actionLabel }}
          </button>
        </template>
      </div>
    </div>

    <!--empty state -->
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
        <div v-if="isSelectMode" class="checkbox-wrapper">
          <button
            class="checkbox-btn"
            :class="{ checked: isUserSelected(user) }"
            @click="toggleUserSelection($event, user)"
            :title="`${isUserSelected(user) ? 'Deselect' : 'Select'} ${user.name}`"
          >
            <span v-if="isUserSelected(user)" class="checkmark">✓</span>
          </button>
        </div>

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
            <div class="user-meta">
              <span class="time">{{ user.time }}</span>
              <span v-if="user.unreadCount && user.unreadCount > 0" class="unread-badge">
                {{ user.unreadCount > 99 ? '99+' : user.unreadCount }}
              </span>
            </div>
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
  gap: 10px;
}

.header-controls {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.header-cancel {
  display: flex;
  align-items: center;
  gap: 8px;
}

.remove-selected-btn {
  background: #dc2626;
  color: white;
  border: 1px solid #dc2626;
  padding: 6px 12px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  transition: all 0.2s;
}

.remove-selected-btn:hover {
  background: #b91c1c;
}

.remove-selected-btn[disabled] {
  opacity: 0.5;
  cursor: not-allowed;
  background: #7f1d1d;
  border-color: #7f1d1d;
}

.header-cancel-btn {
  background: #1e293b;
  color: #94a3b8;
  border: 1px solid #334155;
  padding: 6px 12px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  transition: all 0.2s;
}

.header-cancel-btn:hover {
  background: #334155;
  color: #cbd5e1;
}

.delete-confirm {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #111827;
  padding: 6px 8px;
  border-radius: 10px;
  white-space: nowrap;
}

.delete-confirm button {
  border: 1px solid transparent;
  border-radius: 8px;
  padding: 6px 10px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
}

.delete-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.cancel-btn {
  background: #1e293b;
  color: #94a3b8;
  border: 1px solid #334155;
  padding: 6px 12px;
  border-radius: 8px;
  cursor: pointer;
}

.cancel-btn:hover {
  background: #334155;
  color: white;
}

.confirm-delete-btn {
  background: #dc2626;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 8px;
  cursor: pointer;
}

.confirm-delete-btn:hover {
  background: #b91c1c;
}

.cancel-btn,
.confirm-delete-btn {
  border: 1px solid transparent;
  border-radius: 8px;
  padding: 6px 10px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
}

.cancel-btn {
  background: #1e293b;
  color: #94a3b8;
  border-color: #334155;
}

.cancel-btn:hover {
  background: #334155;
}

.confirm-delete-btn {
  background: #dc2626;
  color: white;
  border-color: #dc2626;
}

.confirm-delete-btn:hover {
  background: #b91c1c;
}

.sidebar-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  flex: 1;
}

.select-btn,
.delete-header-btn {
  background: none;
  border: none;
  font-size: 18px;
  padding: 5px 10px;
  cursor: pointer;
  transition: all 0.2s;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.select-btn {
  color: #0f172a;
  border: 2px solid white;
  padding: 6px 14px;
  font-size: 14px;
  font-weight: 600;
  background: white;
}

.select-btn:hover {
  background: #e2e8f0;
  color: #6a6e74;
  border-color: #6a6e74;
}

.select-btn.active {
  background: #0d9488;
  color: white;
  border-color: #0d9488;
}

.delete-header-btn {
  color: #ef4444;
}

.delete-header-btn:hover {
  background: rgba(239, 68, 68, 0.1);
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

.checkbox-wrapper {
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

.checkbox-btn {
  width: 24px;
  height: 24px;
  border: 2px solid #64748b;
  border-radius: 50%;
  background: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  color: white;
  font-size: 12px;
  font-weight: bold;
}

.checkbox-btn:hover {
  border-color: #0d9488;
}

.checkbox-btn.checked {
  background: #0d9488;
  border-color: #0d9488;
}

.checkmark {
  font-size: 14px;
  font-weight: bold;
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

.user-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.unread-badge {
  min-width: 22px;
  height: 22px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 7px;
  border-radius: 999px;
  background: #ef4444;
  color: white;
  font-size: 12px;
  font-weight: 700;
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

.empty {
  padding: 20px;
  text-align: center;
  color: #64748b;
  font-size: 14px;
}
</style>