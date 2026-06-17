import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import type { DateGroup, Notification, NotifType, SidebarItem, SidebarKey } from '../types/notification'
import { notificationService } from '../services/notification'

// ── Helpers ───────────────────────────────────────────────

const defaultActions = (type: string) => {
  const map: Record<string, { label: string; variant: string }[]> = {
    message:   [{ label: 'Reply', variant: 'primary' }, { label: 'View Thread', variant: 'outline' }],
    exchange:  [{ label: 'Leave Review', variant: 'outline' }, { label: 'Invoice', variant: 'primary' }],
    borrow:    [{ label: 'Accept Request', variant: 'primary' }, { label: 'View Details', variant: 'outline' }],
    review:    [{ label: 'View Review', variant: 'outline' }],
    following: [{ label: 'View Profile', variant: 'outline' }],
    order:     [{ label: 'View Order', variant: 'outline' }, { label: 'Invoice', variant: 'primary' }],
    alert:     [{ label: 'View Details', variant: 'outline' }],
  }
  return map[type] ?? [{ label: 'View Details', variant: 'outline' }]
}

const toDateLabel = (createdAt: string | number | undefined): string => {
  const date      = new Date(createdAt || Date.now())
  const today     = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (date.toDateString() === today.toDateString())     return 'Today'
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day:   'numeric',
    year:  date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
  })
}

const isValidObjectId = (id: string | number): boolean =>
  typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id)

const resolveAvatarUrl = (avatar?: string | null): string | undefined => {
  if (!avatar) return undefined
  if (avatar.startsWith('http')) return avatar
  const apiBaseUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'
  const baseUrl = apiBaseUrl.replace(/\/api\/?$/, '')
  return `${baseUrl}/${avatar}`
}

export function normalizeNotification(raw: any): Notification {
  const relatedUserObj = raw.relatedUserId && typeof raw.relatedUserId === 'object' ? raw.relatedUserId : null
  const senderName = raw.sender?.username ?? raw.sender?.name ?? raw.sender ?? relatedUserObj?.username ?? relatedUserObj?.name
  const senderId = raw.sender?._id?.toString?.() ?? raw.sender?.toString?.() ?? relatedUserObj?._id?.toString?.() ?? (!relatedUserObj && raw.relatedUserId?.toString?.()) ?? undefined

  return {
    id:              raw.id ?? raw._id?.toString(),
    type:            (raw.type || 'alert') as NotifType,
    sender:          senderName ?? raw.title ?? 'Notification',
    text:            raw.text ?? raw.message ?? '',
    richText:        raw.richText ?? undefined,
    time:            raw.time ?? toDateLabel(raw.createdAt ?? raw.timestamp),
    unread:          raw.unread ?? raw.read === false,
    actions:         Array.isArray(raw.actions) && raw.actions.length > 0
                       ? raw.actions
                       : defaultActions(raw.type || 'alert'),
    isMock:          raw.isMock === true,
    relatedUserId:   senderId,
    relatedUsername: raw.sender?.username ?? raw.senderUsername ?? relatedUserObj?.username ?? relatedUserObj?.name ?? undefined,
    relatedPostId:   raw.relatedPostId?.toString?.() ?? undefined,
    actionUrl:       raw.actionUrl ?? undefined,
    title:           raw.title ?? undefined,
    message:         raw.message ?? undefined,
    imageUrl:        raw.imageUrl ?? resolveAvatarUrl(relatedUserObj?.avatar) ?? undefined,
  }
}

export async function fetchNotificationById(id: string | number): Promise<Notification> {
  const response = await notificationService.getOne(id)
  return normalizeNotification(response?.data ?? response)
}

// ── Composable ────────────────────────────────────────────

export function useNotifications() {
  const activeTab = ref<SidebarKey>('all')
  const isLoading = ref(false)
  const error     = ref<string | null>(null)

  const sidebarItems = ref<SidebarItem[]>([
    { key: 'all',       label: 'All Notification', icon: '🔔', count: 0 },
    { key: 'borrow',    label: 'Borrow Request',   icon: '📦', count: 0 },
    { key: 'exchanges', label: 'Exchanges',         icon: '🔄', count: 0 },
    { key: 'reviews',   label: 'Reviews',           icon: '⭐', count: 0 },
    { key: 'followed',  label: 'Followed Activity', icon: '📌', count: 0 },
    { key: 'following', label: 'Following',         icon: '👥', count: 0 },
  ])

  const allGroups = ref<DateGroup[]>([])

  // ── Computed ────────────────────────────────────────────

  const typeMap: Record<SidebarKey, string> = {
    all: '', borrow: 'borrow', exchanges: 'exchange',
    reviews: 'review', followed: 'following', following: 'following',
  }

  const filteredGroups = computed<DateGroup[]>(() => {
    const filter = typeMap[activeTab.value]
    if (!filter) return allGroups.value
    return allGroups.value
      .map(g => ({ ...g, items: g.items.filter(n => n.type === filter) }))
      .filter(g => g.items.length > 0)
  })

  const unreadCount = computed<number>(() =>
    allGroups.value.flatMap(g => g.items).filter(n => n.unread).length
  )

  // ── Internal helpers ────────────────────────────────────

  function parseResponse(response: any): any[] {
    if (Array.isArray(response))                          return response
    if (Array.isArray(response?.data))                   return response.data
    if (Array.isArray(response?.data?.data))             return response.data.data
    if (Array.isArray(response?.notifications))          return response.notifications
    return []
  }

  function groupNotifications(notifications: any[]): DateGroup[] {
    const grouped: Record<string, Notification[]> = {}
    for (const raw of notifications) {
      const label = toDateLabel(raw.createdAt ?? raw.timestamp)
      if (!grouped[label]) grouped[label] = []
      grouped[label]!.push(normalizeNotification(raw))
    }
    return Object.entries(grouped).map(([label, items]) => ({ label, items }))
  }

  function updateSidebarCounts(): void {
    const all = allGroups.value.flatMap(g => g.items)
    sidebarItems.value = sidebarItems.value.map(item => ({
      ...item,
      count: item.key === 'all'
        ? all.length
        : all.filter(n => n.type === typeMap[item.key]).length,
    }))
  }

  // ── Actions ─────────────────────────────────────────────

  const fetchNotifications = async (): Promise<void> => {
    if (isLoading.value) return   // ← guard against duplicate calls
    isLoading.value = true
    error.value     = null
    try {
      const response      = await notificationService.getAll()
      const notifications = parseResponse(response)
      allGroups.value     = notifications.length > 0 ? groupNotifications(notifications) : []
      updateSidebarCounts()
    } catch (err) {
      console.warn('Failed to fetch notifications:', err)
      error.value     = 'Unable to load notifications.'
      allGroups.value = []
    } finally {
      isLoading.value = false
    }
  }

  function markRead(id: string | number): void {
    // Optimistic update
    allGroups.value.forEach(g => {
      const item = g.items.find(n => n.id === id)
      if (item) item.unread = false
    })
    // Sync to backend only for real (non-mock) notifications
    if (isValidObjectId(id)) {
      notificationService.markAsRead(id).catch(err =>
        console.warn('Failed to mark as read:', err)
      )
    }
  }

  function dismiss(id: string | number): void {
    // Optimistic update
    allGroups.value.forEach(g => {
      const idx = g.items.findIndex(n => n.id === id)
      if (idx !== -1) g.items.splice(idx, 1)
    })
    updateSidebarCounts()
    // Sync to backend only for real notifications
    if (isValidObjectId(id)) {
      notificationService.delete(id).catch(err =>
        console.warn('Failed to delete notification:', err)
      )
    }
  }

  // ── Lifecycle ────────────────────────────────────────────

  let refreshInterval: ReturnType<typeof setInterval> | null = null

  onMounted(() => {
    fetchNotifications()
    // Refresh every 30s — guard prevents overlapping calls
    refreshInterval = setInterval(fetchNotifications, 30_000)
  })

  onBeforeUnmount(() => {
    if (refreshInterval) clearInterval(refreshInterval)
  })

  return {
    activeTab,
    sidebarItems,
    filteredGroups,
    unreadCount,
    isLoading,
    error,
    markRead,
    dismiss,
    fetchNotifications,
  }
}