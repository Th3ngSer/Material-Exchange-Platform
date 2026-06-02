import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { ChatService } from './chat.service';
import { MessageType } from './schemas/message.schema';

@WebSocketGateway({
  transports: ['websocket'],
  maxHttpBufferSize: 10 * 1024 * 1024,
  cors: {
    origin: (
      origin: string,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      const allowedOrigins = [
        'https://material-exchange-platform.pages.dev',
        'http://localhost:5173',
        'http://localhost:3000',
      ];
      if (!origin) return callback(null, true);
      const isCloudflarePages =
        origin.endsWith('.material-exchange-platform.pages.dev') ||
        origin === 'https://material-exchange-platform.pages.dev';
      const isLocal = /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin);
      if (isCloudflarePages || isLocal || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    methods: 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    credentials: true,
  },
})
@Injectable()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(ChatGateway.name);

  // userId -> set of socket ids
  private clients = new Map<string, Set<string>>();

  constructor(
    private readonly jwtService: JwtService,
    private readonly chatService: ChatService,
  ) {}

  handleConnection(socket: Socket) {
    try {
      const tokenFromAuth = socket.handshake.auth?.token as string | undefined;
      const tokenFromQuery = socket.handshake.query?.token as
        | string
        | undefined;
      const token = tokenFromAuth ?? tokenFromQuery;
      if (!token) {
        socket.disconnect();
        return;
      }

      const payload = this.jwtService.verify<JwtPayload>(String(token));
      const userId = payload?.sub;
      if (!userId) {
        socket.disconnect();
        return;
      }

      // store socket id
      const set = this.clients.get(String(userId)) || new Set<string>();
      set.add(socket.id);
      this.clients.set(String(userId), set);

      // join room for user
      void socket.join(this.roomFor(userId));

      this.logger.log(`User ${userId} connected (socket ${socket.id})`);
    } catch (err) {
      if (err instanceof Error) {
        this.logger.warn(`Socket auth failed: ${err.message}`);
      } else {
        this.logger.warn('Socket auth failed');
      }
      socket.disconnect();
    }
  }

  handleDisconnect(socket: Socket) {
    // remove socket id from any user sets
    for (const [userId, set] of this.clients.entries()) {
      if (set.has(socket.id)) {
        set.delete(socket.id);
        if (set.size === 0) this.clients.delete(userId);
        else this.clients.set(userId, set);
        this.logger.log(`User ${userId} disconnected (socket ${socket.id})`);
        break;
      }
    }
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    socket: Socket,
    data: { receiverId: string; content: string; type: string },
  ) {
    try {
      const token = socket.handshake.auth?.token as string | undefined;
      if (!token) {
        this.logger.warn('No token for sendMessage');
        return;
      }

      const payload = this.jwtService.verify<JwtPayload>(String(token));
      const senderId = payload?.sub;

      if (!senderId) {
        this.logger.warn('No userId in token');
        return;
      }

      // Save message to database via service
      const message = await this.chatService.sendMessage(
        senderId,
        data.receiverId,
        data.content,
        data.type as MessageType,
      );

      // Emit the message to both sender and receiver
      this.sendToUser(String(senderId), 'message', message);
      this.sendToUser(String(data.receiverId), 'message', message);

      this.logger.log(
        `Message from ${senderId} to ${data.receiverId}: ${message._id?.toString()}`,
      );
    } catch (err) {
      if (err instanceof Error) {
        this.logger.error(`Error handling sendMessage: ${err.message}`);
      } else {
        this.logger.error('Error handling sendMessage');
      }
    }
  }

  roomFor(userId: string) {
    return `user_${userId}`;
  }

  // send message object to a specific user
  sendToUser(userId: string, event: string, payload: unknown) {
    try {
      this.server.to(this.roomFor(userId)).emit(event, payload);
    } catch (err) {
      if (err instanceof Error) {
        this.logger.error(`Failed to emit to user: ${err.message}`);
      } else {
        this.logger.error('Failed to emit to user');
      }
    }
  }
}
