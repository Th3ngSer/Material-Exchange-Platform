import { ref, computed, onMounted } from 'vue'
import type { DateGroup, SidebarItem, SidebarKey, Notification } from '../types/notification'
import { notificationService } from '../services/notification'

export function useNotifications() {
  const activeTab = ref<SidebarKey>('all')
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const sidebarItems: SidebarItem[] = [
    { key: 'all',       label: 'All Notification', icon: '🔔', count: 4 },
    { key: 'borrow',    label: 'Borrow Request',   icon: '📦' },
    { key: 'exchanges', label: 'Exchanges',         icon: '🔄' },
    { key: 'reviews',   label: 'Reviews',           icon: '⭐' },
    { key: 'followed',  label: 'Followed Activity', icon: '📌' },
    { key: 'following', label: 'Following',         icon: '👥' },
  ]

  // Mock data as fallback
  const mockNotifications: DateGroup[] = [
    {
      label: 'Today',
      items: [
        {
          id: 1,
          type: 'message',
          sender: 'New message from Alex Rivet',
          text: '"Hey, I\'m interested in the polished aluminum sheets. Are they still available for pickup tomorrow?"',
          time: '2h ago',
          unread: true,
          actions: [
            { label: 'Reply',       variant: 'primary' },
            { label: 'View Thread', variant: 'outline' },
          ],
        },
        {
          id: 2,
          type: 'exchange',
          sender: 'Exchange Completed',
          richText: 'The transaction for <a href="#">Structural Steel Beam (H-Section)</a> has been successfully finalized.',
          text: '',
          time: '4h ago',
          actions: [
            { label: 'Leave Review', variant: 'outline' },
            { label: 'Invoice',      variant: 'primary' },
          ],
        },
      ],
    },
    {
      label: 'Yesterday',
      items: [
        {
          id: 3,
          type: 'message',
          sender: 'New message from Alex Rivet',
          text: '"Hey, I\'m interested in the polished aluminum sheets. Are they still available for pickup tomorrow?"',
          time: '01/4/25',
          actions: [
            { label: 'Reply',       variant: 'primary' },
            { label: 'View Thread', variant: 'outline' },
          ],
        },
        {
          id: 4,
          type: 'borrow',
          sender: 'Alice sent a borrow request',
          text: 'Requested: Oscilloscope Rig for 3 days.',
          time: '01/4/25',
          actions: [
            { label: 'Leave Review', variant: 'outline' },
            { label: 'Invoice',      variant: 'green' },
          ],
        },
      ],
    },
  ]

  const allGroups = ref<DateGroup[]>(mockNotifications)

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

  // Fetch notifications from API
  const fetchNotifications = async () => {
    isLoading.value = true
    error.value = null
    try {
      const response = await notificationService.getAll()
      // Transform API response to the expected format
      if (Array.isArray(response)) {
        allGroups.value = response as DateGroup[]
      } else if (response.data) {
        allGroups.value = response.data
      }
    } catch (err) {
      console.warn('Failed to fetch notifications from API, using mock data:', err)
      // Fall back to mock data if API fails
      allGroups.value = mockNotifications
    } finally {
      isLoading.value = false
    }
  }

  function markRead(id: number): void {
    allGroups.value.forEach(g => {
      const item = g.items.find(n => n.id === id)
      if (item) item.unread = false
    })
    // Also mark as read in backend
    notificationService.markAsRead(id).catch(err => 
      console.warn('Failed to mark notification as read:', err)
    )
  }

  function dismiss(id: number): void {
    allGroups.value.forEach(g => {
      const idx = g.items.findIndex(n => n.id === id)
      if (idx !== -1) g.items.splice(idx, 1)
    })
    // Also delete from backend
    notificationService.delete(id).catch(err => 
      console.warn('Failed to delete notification:', err)
    )
  }

  // Load notifications on mount
  onMounted(() => {
    fetchNotifications()
  })

  return { activeTab, sidebarItems, filteredGroups, unreadCount, markRead, dismiss, isLoading, error, fetchNotifications }
}