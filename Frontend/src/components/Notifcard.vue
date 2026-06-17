<template>
  <div
    class="notif-card"
    :class="{ unread: notif.unread }"
    @mouseenter="handleHover"
  >
    <!-- Avatar -->
    <div class="notif-avatar" :class="notif.type">
      <img v-if="notif.imageUrl" :src="notif.imageUrl" class="avatar-img" alt="Avatar" />
      <template v-else>
        <svg v-if="notif.type === 'message'" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
        </svg>
        <svg v-else-if="notif.type === 'exchange'" viewBox="0 0 24 24" fill="currentColor">
          <path d="M7.5 21L3 16.5l4.5-4.5 1.42 1.43L6.85 15H16v2H6.85l2.07 2.07L7.5 21zm9-7.5L12 9l4.5-4.5 1.42 1.43L15.85 8H17V6h2v4h-3.15l2.07 2.07L16.5 13.5z"/>
        </svg>
        <svg v-else-if="notif.type === 'borrow'" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20 6h-2.18c.07-.44.18-.88.18-1.35C18 2.53 15.47 0 12.35 0 10.59 0 9.01.89 7.97 2.29L7 3.5l-1-.96C5.06 1.65 4.14 1 3.01 1c-1.66 0-3 1.34-3 3 0 1.1.6 2.04 1.47 2.57L2 8H1c-.55 0-1 .45-1 1v11c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-.55-.45-1-1-1z"/>
        </svg>
        <svg v-else-if="notif.type === 'review'" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
        </svg>
        <svg v-else-if="notif.type === 'following'" viewBox="0 0 24 24" fill="currentColor">
          <path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
        </svg>
        <svg v-else viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
      </template>
    </div>

    <!-- Body -->
    <div class="notif-body">
      <div class="notif-sender">{{ notif.sender }}</div>
      <!-- Rich text (with links) -->
      <div
        v-if="notif.richText"
        class="notif-text"
        v-html="notif.richText"
      ></div>
      <!-- Plain text -->
      <div v-else class="notif-text">{{ notif.text }}</div>

      <!-- Actions -->
      <div class="notif-actions" @click.stop>
        <button
          v-for="action in notif.actions"
          :key="action.label"
          class="btn"
          :class="`btn-${action.variant}`"
          @click="$emit('action', { notifId: notif.id, label: action.label })"
        >
          {{ action.label }}
        </button>
      </div>
    </div>

    <!-- Time + unread dot -->
    <div class="notif-meta">
      <span class="notif-time">{{ notif.time }}</span>
      <span v-if="notif.unread" class="unread-dot"></span>
    </div>

    <!-- Dismiss -->
    <button class="dismiss-btn" title="Dismiss" @click.stop="$emit('dismiss', notif.id)">
      <svg viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import type { Notification } from '../types/notification'

const props = defineProps<{ notif: Notification }>()

const emit = defineEmits<{
  (e: 'action',  payload: { notifId: string | number; label: string }): void
  (e: 'dismiss', id: string | number): void
  (e: 'read',    id: string | number): void
}>()

function handleHover(): void {
  if (props.notif.unread) emit('read', props.notif.id)
}
</script>

<style scoped>
.notif-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 16px 18px;
  display: flex;
  align-items: flex-start;
  gap: 14px;
  position: relative;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.notif-card:hover {
  border-color: #d1d5db;
  background: #f9fafb;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

.notif-card.unread {
  background: #fef3f2;
  border-color: #fed7d0;
}

.notif-card.unread::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: #f97316;
  border-radius: 10px 0 0 10px;
}

/* Avatar */
.notif-avatar {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #fff;
  font-weight: 600;
  font-size: 16px;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
}

.notif-avatar.message {
  background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
}

.notif-avatar.exchange {
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
}

.notif-avatar.borrow {
  background: linear-gradient(135deg, #10b981 0%, #047857 100%);
}

.notif-avatar.review {
  background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%);
}

.notif-avatar.following {
  background: linear-gradient(135deg, #ec4899 0%, #be185d 100%);
}

.notif-avatar.alert,
.notif-avatar.order {
  background: linear-gradient(135deg, #6b7280 0%, #374151 100%);
}

.notif-avatar svg {
  width: 20px;
  height: 20px;
}

/* Body */
.notif-body {
  flex: 1;
  min-width: 0;
}

.notif-sender {
  font-size: 13px;
  font-weight: 700;
  color: #1a1f3c;
  margin-bottom: 4px;
  letter-spacing: -0.3px;
}

.notif-text {
  font-size: 13px;
  color: #6b7280;
  line-height: 1.5;
  margin-bottom: 10px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
}

.notif-text :deep(a) {
  color: #f97316;
  font-weight: 600;
  text-decoration: none;
}

.notif-text :deep(a:hover) {
  text-decoration: underline;
}

/* Actions */
.notif-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 8px;
  pointer-events: auto;
  position: relative;
  z-index: 10;
}

.btn {
  display: inline-flex;
  align-items: center;
  font-family: 'DM Sans', sans-serif;
  font-size: 12px;
  font-weight: 600;
  padding: 6px 14px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  transition: all 0.15s ease;
  pointer-events: auto;
  position: relative;
  z-index: 10;
}

.btn:hover {
  transform: translateY(-1px);
}

.btn:active {
  transform: translateY(0);
}

.btn-primary {
  background: #f97316;
  color: white;
}

.btn-primary:hover {
  background: #ea580c;
}

.btn-outline {
  background: white;
  color: #6b7280;
  border: 1.5px solid #d1d5db;
}

.btn-outline:hover {
  background: #f9fafb;
  border-color: #9ca3af;
  color: #4b5563;
}

.btn-green {
  background: #d1fae5;
  color: #065f46;
}

.btn-green:hover {
  background: #a7f3d0;
}

.btn-ghost {
  background: #f3f4f6;
  color: #6b7280;
}

.btn-ghost:hover {
  background: #e5e7eb;
  color: #4b5563;
}

/* Meta */
.notif-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  flex-shrink: 0;
}

.notif-time {
  font-size: 12px;
  color: #9ca3af;
  white-space: nowrap;
}

.unread-dot {
  width: 8px;
  height: 8px;
  background: #f97316;
  border-radius: 50%;
  box-shadow: 0 0 4px rgba(249, 115, 22, 0.4);
}

/* Dismiss */
.dismiss-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  background: transparent;
  border: none;
  cursor: pointer;
  color: #d1d5db;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  opacity: 0;
  transition: all 0.15s ease;
}

.dismiss-btn svg {
  width: 16px;
  height: 16px;
}

.notif-card:hover .dismiss-btn {
  opacity: 1;
}

.dismiss-btn:hover {
  background: #f3f4f6;
  color: #6b7280;
}
</style>