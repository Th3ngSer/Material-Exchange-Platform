import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { Injectable, Logger } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'

@WebSocketGateway({ cors: { origin: 'http://localhost:5173' } })
@Injectable()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server

  private readonly logger = new Logger(ChatGateway.name)

  // userId -> set of socket ids
  private clients = new Map<string, Set<string>>()

  constructor(private readonly jwtService: JwtService) {}

  async handleConnection(socket: Socket) {
    try {
      const token = (socket.handshake.auth && socket.handshake.auth.token) || socket.handshake.query?.token
      if (!token) {
        socket.disconnect()
        return
      }

      const payload: any = this.jwtService.verify(String(token))
      const userId = payload?.sub
      if (!userId) {
        socket.disconnect()
        return
      }

      // store socket id
      const set = this.clients.get(String(userId)) || new Set<string>()
      set.add(socket.id)
      this.clients.set(String(userId), set)

      // join room for user
      socket.join(this.roomFor(userId))

      this.logger.log(`User ${userId} connected (socket ${socket.id})`)
    } catch (err) {
      this.logger.warn('Socket auth failed', err?.message)
      socket.disconnect()
    }
  }

  handleDisconnect(socket: Socket) {
    // remove socket id from any user sets
    for (const [userId, set] of this.clients.entries()) {
      if (set.has(socket.id)) {
        set.delete(socket.id)
        if (set.size === 0) this.clients.delete(userId)
        else this.clients.set(userId, set)
        this.logger.log(`User ${userId} disconnected (socket ${socket.id})`)
        break
      }
    }
  }

  roomFor(userId: string) {
    return `user_${userId}`
  }

  // send message object to a specific user
  sendToUser(userId: string, event: string, payload: any) {
    try {
      this.server.to(this.roomFor(userId)).emit(event, payload)
    } catch (err) {
      this.logger.error('Failed to emit to user', err?.message)
    }
  }
}
