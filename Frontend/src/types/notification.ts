export type NotifType = 'message' | 'exchange' | 'borrow' | 'review' | 'following' | 'alert' | 'order'
export type NotifId = string | number

export interface NotifAction {
  label: string
  variant: 'primary' | 'outline' | 'green' | 'ghost'
}

export interface Notification {
  id: NotifId
  type: NotifType
  sender: string
  text: string
  richText?: string        // HTML with <a> tags
  time: string
  unread?: boolean
  actions: NotifAction[]
  isMock?: boolean
}

export interface DateGroup {
  label: string
  items: Notification[]
}

export type SidebarKey = 'all' | 'borrow' | 'exchanges' | 'reviews' | 'followed' | 'following'

export interface SidebarItem {
  key: SidebarKey
  label: string
  icon: string
  count?: number
}