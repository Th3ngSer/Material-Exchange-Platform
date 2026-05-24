<template>
  <div
    class="notif-card"
    :class="{ unread: notif.unread }"
    @mouseenter="handleHover"
  >
    <!-- Avatar -->
    <div class="notif-avatar" :class="notif.type">
      <svg v-if="notif.type === 'message'" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
      </svg>
      <svg v-else-if="notif.type === 'exchange'" viewBox="0 0 24 24" fill="currentColor">
        <path d="M7.5 21L3 16.5l4.5-4.5 1.42 1.43L6.85 15H16v2H6.85l2.07 2.07L7.5 21zm9-7.5L12 9l4.5-4.5 1.42 1.43L15.85 8H17V6h2v4h-3.15l2.07 2.07L16.5 13.5z"/>
      </svg>
      <svg v-else-if="notif.type === 'borrow'" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20 6h-2.18c.07-.44.18-.88.18-1.35C18 2.53 15.47 0 12.35 0 10.59 0 9.01.89 7.97 2.29L7 3.5l-1-.96C5.06 1.65 4.14 1 3.01 1c-1.66 0-3 1.34-3 3 0 1.1.6 2.04 1.47 2.57L2 8H1c-.55 0-1 .45-1 1v11c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-.55-.45-1-1-1z"/>
      </svg>
      <svg v-else viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
      </svg>
    </div>

    <!-- Body -->
    <div class="notif-body">
      <div class="notif-sender">{{ notif.sender }}</div>
      <!-- Rich text (with links) -->
      <div
        v-if="notif.richText"
        class="notif-text"
        v-html="notif.richText"
      />
      <!-- Plain text -->
      <div v-else class="notif-text">{{ notif.text }}</div>

      <!-- Actions -->
      <div class="notif-actions">
        <button
          v-for="action in notif.actions"
          :key="action.label"
          class="btn"
          :class="`btn-${action.variant}`"
          @click.stop="$emit('action', { notifId: notif.id, label: action.label })"
        >
          {{ action.label }}
        </button>
      </div>
    </div>

    <!-- Time + unread dot -->
    <div class="notif-meta">
      <span class="notif-time">{{ notif.time }}</span>
      <span v-if="notif.unread" class="unread-dot" />
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
  (e: 'action',  payload: { notifId: number; label: string }): void
  (e: 'dismiss', id: number): void
  (e: 'read',    id: number): void
}>()

function handleHover(): void {
  if (props.notif.unread) emit('read', props.notif.id)
}
</script>

<style scoped>
.notif-card {
  background: #1a1f3c;
  border-radius: 12px;
  padding: 16px 20px;
  display: flex;
  align-items: flex-start;
  gap: 14px;
  margin-bottom: 10px;
  position: relative;
  transition: transform .18s, box-shadow .18s;
  animation: slideIn .3s ease both;
}

.notif-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(26, 31, 60, 0.22);
}

@keyframes slideIn {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Avatar */
.notif-avatar {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #fff;
}
.notif-avatar.message  { background: #f97316; }
.notif-avatar.exchange { background: #3b4a8a; }
.notif-avatar.borrow   { background: #2e7d6e; }
.notif-avatar.review   { background: #7c3aed; }
.notif-avatar svg { width: 18px; height: 18px; }

/* Body */
.notif-body { flex: 1; min-width: 0; }

.notif-sender {
  font-size: 13px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 3px;
}

.notif-text {
  font-size: 12.5px;
  color: rgba(255, 255, 255, 0.58);
  line-height: 1.5;
  margin-bottom: 10px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
}

/* Deep so v-html <a> tags get styled */
.notif-text :deep(a) {
  color: #f97316;
  font-weight: 600;
  text-decoration: none;
}
.notif-text :deep(a:hover) { text-decoration: underline; }

/* Actions */
.notif-actions { display: flex; gap: 8px; flex-wrap: wrap; }

.btn {
  display: inline-flex;
  align-items: center;
  font-family: 'DM Sans', sans-serif;
  font-size: 11.5px;
  font-weight: 600;
  padding: 5px 13px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  transition: opacity .13s, transform .13s;
}
.btn:hover { opacity: .82; transform: scale(.97); }

.btn-primary { background: #f97316; color: #fff; }
.btn-outline  { background: rgba(255,255,255,.12); color: rgba(255,255,255,.85); }
.btn-green    { background: #22c55e; color: #fff; }
.btn-ghost    { background: rgba(255,255,255,.08); color: rgba(255,255,255,.6); }

/* Meta */
.notif-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
  flex-shrink: 0;
}

.notif-time {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.32);
  white-space: nowrap;
}

.unread-dot {
  width: 7px;
  height: 7px;
  background: #f97316;
  border-radius: 50%;
}

/* Dismiss */
.dismiss-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: transparent;
  border: none;
  cursor: pointer;
  color: rgba(255,255,255,.2);
  display: flex;
  align-items: center;
  padding: 3px;
  border-radius: 4px;
  opacity: 0;
  transition: opacity .15s, color .15s;
}
.dismiss-btn svg { width: 14px; height: 14px; }
.notif-card:hover .dismiss-btn { opacity: 1; }
.dismiss-btn:hover { color: rgba(255,255,255,.7); }
</style>