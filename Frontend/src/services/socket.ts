import { io, Socket } from 'socket.io-client'
import { getToken } from '@/utils/tokenStorage'

let socket: Socket | null = null

export function connectSocket() {
  if (socket?.connected) return socket

  const token = getToken()
  const base =
    import.meta.env.VITE_API_URL
      ? String(import.meta.env.VITE_API_URL).replace(/\/api\/?$/, '')
      : 'http://localhost:3000'

  socket = io(base, {
    auth: { token },
    transports: ['websocket'], 
    maxHttpBufferSize: 10 * 1024 * 1024, // Max socket message size = 10MB
  })

  return socket
}

export function getSocket() {
  return socket
}

export function disconnectSocket() {
  if (socket) {
    socket.removeAllListeners()
    socket.disconnect()
    socket = null
  }
}

export function sendMessageViaSocket(data: {
  receiverId: string
  content: string
  type: 'text' | 'image' | 'voice'
}) {
  if (!socket?.connected) {
    console.warn('Socket not connected')
    return
  }

  socket.emit('sendMessage', data)
}