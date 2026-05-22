import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null

export function connectSocket() {
  if (socket) return socket

  const token = sessionStorage.getItem('authToken')
  const base = import.meta.env.VITE_API_URL ? String(import.meta.env.VITE_API_URL).replace(/\/api\/?$/, '') : 'http://localhost:3000'

  socket = io(base, {
    auth: { token },
  })

  return socket
}

export function getSocket() {
  return socket
}

export function disconnectSocket() {
  if (!socket) return
  socket.disconnect()
  socket = null
}
