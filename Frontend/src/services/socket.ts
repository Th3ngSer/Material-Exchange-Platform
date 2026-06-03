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
  // Avoid re-initializing handlers if socket already initialized
  try {
    ;(window as any).__socket = socket
  } catch {}

  if (!(socket as any).__initialized) {
    socket.on('connect', () => {
      console.log('Socket connected', socket?.id)
      try { window.dispatchEvent(new CustomEvent('socketConnected', { detail: { id: socket?.id } })) } catch {}
    })

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected', reason)
      try { window.dispatchEvent(new CustomEvent('socketDisconnected', { detail: { reason } })) } catch {}
    })

    // Relay profile updates to the app via a CustomEvent so views can update caches
    socket.on('profileUpdated', (payload: { userId: string; avatar: string; username?: string }) => {
      try {
        window.dispatchEvent(new CustomEvent('profileUpdated', { detail: payload }))
      } catch (err) {
        console.warn('Failed to dispatch profileUpdated event', err)
      }
    })

    ;(socket as any).__initialized = true
    console.log('Socket initialized (connecting)...')
  }

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