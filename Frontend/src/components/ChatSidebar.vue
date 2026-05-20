<script setup lang="ts">
type User = {
  id: string | number
  name: string
  role: string
  message: string
  time: string
  avatar: string
  online?: boolean
}

defineProps<{
  users: User[]
  selectedUser: User | null
}>()

const emit = defineEmits<{
  (e: "select-user", user: User): void
}>()
</script>

<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <h3>Inboxes</h3>
    </div>

    <div class="conversation-list">
      <div
        v-for="user in users"
        :key="user.id"
        :class="['user', { active: selectedUser?.id === user.id }]"
        @click="emit('select-user', user)"
      >
        <div class="avatar-wrapper" :class="{ online: user.online }">
          <img
            :src="user.avatar"
            :alt="user.name"
            class="avatar-img"
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

.new-chat-btn {
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 6px;
  border-radius: 6px;
  transition: all 0.2s;
}

.search-box {
  padding: 15px 20px;
  position: relative;
  box-sizing: border-box;
}

.search-icon {
  position: absolute;
  left: 28px;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  color: #64748b;
  pointer-events: none;
  z-index: 1;
}

.search {
  width: 100%;
  max-width: 360px;
  padding: 10px 15px 10px 38px;
  border-radius: 8px;
  border: 1px solid #1e293b;
  background: #1e293b;
  color: white;
  font-size: 14px;
  outline: none;
  transition: all 0.2s;
  box-sizing: border-box;
  margin-left: 0;
}

.search::placeholder {
  color: #64748b;
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

/* Online Indicator */
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
  z-index: 2;
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
  flex-shrink: 0;
}

.message {
  font-size: 13px;
  color: #94a3b8;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
