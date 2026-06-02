import { ref, computed, onMounted } from 'vue'
import type { DateGroup, Notification, SidebarItem, SidebarKey } from '../types/notification'
import { notificationService } from '../services/notification'

export function useNotifications() {
  const activeTab = ref<SidebarKey>('all')
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const sidebarItems = ref<SidebarItem[]>([
    { key: 'all',       label: 'All Notification', icon: '🔔', count: 0 },
    { key: 'borrow',    label: 'Borrow Request',   icon: '📦', count: 0 },
    { key: 'exchanges', label: 'Exchanges',         icon: '🔄', count: 0 },
    { key: 'reviews',   label: 'Reviews',           icon: '⭐', count: 0 },
    { key: 'followed',  label: 'Followed Activity', icon: '📌', count: 0 },
    { key: 'following', label: 'Following',         icon: '👥', count: 0 },
  ])

  const allGroups = ref<DateGroup[]>([])

  const parseNotificationsResponse = (response: any): any[] => {
    if (Array.isArray(response)) return response
    if (response && Array.isArray(response.data)) return response.data
    if (response && response.data && Array.isArray(response.data.data)) return response.data.data
    if (response && Array.isArray(response.notifications)) return response.notifications
    return []
  }

  const defaultActionsForType = (type: string) => {
    switch (type) {
      case 'message':
        return [
          { label: 'Reply', variant: 'primary' },
          { label: 'View Thread', variant: 'outline' },
        ]
      case 'exchange':
        return [
          { label: 'Leave Review', variant: 'outline' },
          { label: 'Invoice', variant: 'primary' },
        ]
      case 'borrow':
        return [
          { label: 'Accept Request', variant: 'primary' },
          { label: 'View Details', variant: 'outline' },
        ]
      case 'review':
        return [
          { label: 'View Review', variant: 'outline' } ]
      case 'following':
        return [
          { label: 'View Profile', variant: 'outline' } ]
      case 'order':
        return [
          { label: 'View Order', variant: 'outline' },
          { label: 'Invoice', variant: 'primary' },
        ]
      case 'alert':
        return [
          { label: 'View Details', variant: 'outline' },
        ]
      default:
        return [
          { label: 'View Details', variant: 'outline' },
        ]
    }
  }

  const normalizeNotification = (notif: any) => {
    const id = notif.id ?? notif._id ?? notif._id?.toString() ?? notif.id
    const type = (notif.type || 'alert') as string
    const sender = String(
      notif.sender?.name ?? notif.sender ?? notif.title ?? notif.message ?? 'Notification'
    )
    const text = notif.text ?? notif.message ?? ''
    const richText = notif.richText ?? undefined
    const time = notif.time ??
      (notif.createdAt ? new Date(notif.createdAt).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: new Date(notif.createdAt).getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
      }) : '')
    const unread = notif.unread ?? notif.read === false ? true : false
    const actions = Array.isArray(notif.actions) && notif.actions.length > 0
      ? notif.actions
      : defaultActionsForType(type)

    return {
      id,
      type,
      sender,
      text,
      richText,
      time,
      unread,
      actions,
      isMock: notif.isMock === true,
    }
  }

  const transformNotifications = (notifications: any[]): DateGroup[] => {
    const grouped: Record<string, any[]> = {}

    notifications.forEach(notif => {
      const normalized = normalizeNotification(notif)
      const createdAt = new Date(notif.createdAt || notif.timestamp || Date.now())
      const today = new Date()
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)

      let dateLabel = 'Older'

      if (createdAt.toDateString() === today.toDateString()) {
        dateLabel = 'Today'
      } else if (createdAt.toDateString() === yesterday.toDateString()) {
        dateLabel = 'Yesterday'
      } else {
        dateLabel = createdAt.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: createdAt.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
        })
      }

      if (!grouped[dateLabel]) {
        grouped[dateLabel] = []
      }

      grouped[dateLabel]!.push(normalized)
    })

    return Object.entries(grouped).map(([label, items]) => ({ label, items }))
  }

  const typeMap: Record<SidebarKey, string> = {
    all:       '',
    borrow:    'borrow',
    exchanges: 'exchange',
    reviews:   'review',
    followed:  'following',
    following: 'following',
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

  /**
   * Update sidebar counts based on actual notifications
   */
  const updateSidebarCounts = () => {
    const allNotifs = allGroups.value.flatMap(g => g.items)
    
    // Count by type
    const counts: Record<SidebarKey, number> = {
      all: allNotifs.length,
      borrow: allNotifs.filter(n => n.type === 'borrow').length,
      exchanges: allNotifs.filter(n => n.type === 'exchange').length,
      reviews: allNotifs.filter(n => n.type === 'review').length,
      followed: allNotifs.filter(n => n.type === 'following').length,
      following: allNotifs.filter(n => n.type === 'following').length,
    }
    
    // Update sidebar items with new counts
    sidebarItems.value = sidebarItems.value.map(item => ({
      ...item,
      count: counts[item.key] || 0,
    }))
  }

  const isMockNotification = (notif: Notification): boolean => notif.isMock === true

  const isValidObjectId = (id: string | number): boolean =>
    typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id)

  // Fetch notifications from API
  const fetchNotifications = async () => {
    isLoading.value = true
    error.value = null
    try {
      const response = await notificationService.getAll()
      console.log('API Response:', response)

      const notifications = parseNotificationsResponse(response)

      if (notifications.length > 0) {
        allGroups.value = transformNotifications(notifications)
        error.value = null
      } else {
        allGroups.value = []
        error.value = null
      }

      updateSidebarCounts()
    } catch (err) {
      console.warn('Failed to fetch notifications from API:', err)
      error.value = 'Unable to load notifications.'
      allGroups.value = []
      updateSidebarCounts()
    } finally {
      isLoading.value = false
    }
  }

  function markRead(id: string | number): void {
    allGroups.value.forEach(g => {
      const item = g.items.find(n => n.id === id)
      if (item) item.unread = false
    })

    const shouldSendBackend = isValidObjectId(id) || allGroups.value.flatMap(g => g.items).some(n => !isMockNotification(n) && n.id === id)

    if (!shouldSendBackend) {
      return
    }

    notificationService.markAsRead(id).catch(err =>
      console.warn('Failed to mark notification as read:', err)
    )
  }

  function dismiss(id: string | number): void {
    allGroups.value.forEach(g => {
      const idx = g.items.findIndex(n => n.id === id)
      if (idx !== -1) g.items.splice(idx, 1)
    })

    updateSidebarCounts()

    const shouldSendBackend = isValidObjectId(id) || allGroups.value.flatMap(g => g.items).some(n => !isMockNotification(n) && n.id === id)

    if (!shouldSendBackend) {
      return
    }

    notificationService.delete(id).catch(err =>
      console.warn('Failed to delete notification:', err)
    )
  }

  // Load notifications on mount
  onMounted(() => {
    fetchNotifications()
    
    // Optional: Auto-refresh notifications every 30 seconds
    const refreshInterval = setInterval(() => {
      fetchNotifications()
    }, 30000)
    
    // Cleanup interval on unmount
    return () => clearInterval(refreshInterval)
  })

  return { activeTab, sidebarItems, filteredGroups, unreadCount, markRead, dismiss, isLoading, error, fetchNotifications }
}