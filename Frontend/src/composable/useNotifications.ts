import { ref, computed } from 'vue'
import type { DateGroup, SidebarItem, SidebarKey, Notification } from '../types/notification'

export function useNotifications() {
  const activeTab = ref<SidebarKey>('all')

  const sidebarItems: SidebarItem[] = [
    { key: 'all',       label: 'All Notification', icon: '🔔', count: 4 },
    { key: 'borrow',    label: 'Borrow Request',   icon: '📦' },
    { key: 'exchanges', label: 'Exchanges',         icon: '🔄' },
    { key: 'reviews',   label: 'Reviews',           icon: '⭐' },
    { key: 'followed',  label: 'Followed Activity', icon: '📌' },
    { key: 'following', label: 'Following',         icon: '👥' },
  ]

  const allGroups: DateGroup[] = [
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
    if (!filter) return allGroups
    return allGroups
      .map(g => ({ ...g, items: g.items.filter(n => n.type === filter) }))
      .filter(g => g.items.length > 0)
  })

  const unreadCount = computed<number>(() =>
    allGroups.flatMap(g => g.items).filter(n => n.unread).length
  )

  function markRead(id: number): void {
    allGroups.forEach(g => {
      const item = g.items.find(n => n.id === id)
      if (item) item.unread = false
    })
  }

  function dismiss(id: number): void {
    allGroups.forEach(g => {
      const idx = g.items.findIndex(n => n.id === id)
      if (idx !== -1) g.items.splice(idx, 1)
    })
  }

  return { activeTab, sidebarItems, filteredGroups, unreadCount, markRead, dismiss }
}