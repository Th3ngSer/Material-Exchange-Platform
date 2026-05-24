export interface Message {
  _id: string
  senderId: string
  receiverId: string
  content: string
  createdAt: string
}

export interface ChatMessage {
  text: string
  sender: 'me' | 'them'
  time: string
  type?: 'text' | 'image' | 'voice'
  imageUrl?: string
  audioUrl?: string
  duration?: number
}

export interface ChatUser {
  id: string | number
  name: string
  role: string
  message: string
  time: string
  avatar?: string
  online?: boolean
  chat: ChatMessage[]
}