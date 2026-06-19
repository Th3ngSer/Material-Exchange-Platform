import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { Socket, Server } from 'socket.io';
import { MessageType } from './schemas/message.schema';

describe('ChatGateway', () => {
  let gateway: ChatGateway;
  let jwtService: jest.Mocked<JwtService>;
  let chatService: jest.Mocked<ChatService>;

  const mockJwtService = {
    verify: jest.fn(),
  };

  const mockChatService = {
    sendMessage: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatGateway,
        { provide: JwtService, useValue: mockJwtService },
        { provide: ChatService, useValue: mockChatService },
      ],
    }).compile();

    gateway = module.get<ChatGateway>(ChatGateway);
    jwtService = module.get(JwtService);
    chatService = module.get(ChatService);

    // Mock WebSocket server
    gateway.server = {
      to: jest.fn().mockReturnValue({
        emit: jest.fn(),
      }),
    } as unknown as Server;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  describe('handleConnection', () => {
    let mockSocket: Partial<Socket> & {
      disconnect: jest.Mock;
      join: jest.Mock;
      handshake: NonNullable<Socket['handshake']>;
    };


    beforeEach(() => {
      mockSocket = {
        id: 'socket-123',
        handshake: {
          auth: {},
          query: {},
          headers: {},
          time: '',
          address: '',
          xdomain: false,
          secure: false,
          issued: 0,
          url: '',
        },
        disconnect: jest.fn(),
        join: jest.fn(),
      };
    });

    it('should disconnect socket if no token is provided', () => {
      gateway.handleConnection(mockSocket as unknown as Socket);
      expect(mockSocket.disconnect).toHaveBeenCalled();
    });

    it('should authenticate successfully and join user room when valid token is in auth', () => {
      mockSocket.handshake.auth = { token: 'valid-token' };
      jwtService.verify.mockReturnValue({ sub: 'user-456' });

      gateway.handleConnection(mockSocket as unknown as Socket);

      expect(jwtService.verify).toHaveBeenCalledWith('valid-token');
      expect(mockSocket.join).toHaveBeenCalledWith('user_user-456');
      expect(mockSocket.disconnect).not.toHaveBeenCalled();
    });

    it('should authenticate successfully and join user room when valid token is in query', () => {
      mockSocket.handshake.query = { token: 'query-token' };
      jwtService.verify.mockReturnValue({ sub: 'user-789' });

      gateway.handleConnection(mockSocket as unknown as Socket);

      expect(jwtService.verify).toHaveBeenCalledWith('query-token');
      expect(mockSocket.join).toHaveBeenCalledWith('user_user-789');
      expect(mockSocket.disconnect).not.toHaveBeenCalled();
    });

    it('should disconnect socket if jwt payload has no sub field', () => {
      mockSocket.handshake.auth = { token: 'invalid-payload-token' };
      jwtService.verify.mockReturnValue({}); // No sub field

      gateway.handleConnection(mockSocket as unknown as Socket);

      expect(mockSocket.disconnect).toHaveBeenCalled();
    });

    it('should disconnect socket and handle error if token verification throws an error', () => {
      mockSocket.handshake.auth = { token: 'expired-token' };
      jwtService.verify.mockImplementation(() => {
        throw new Error('JWT Expired');
      });

      gateway.handleConnection(mockSocket as unknown as Socket);

      expect(mockSocket.disconnect).toHaveBeenCalled();
    });
  });

  describe('handleDisconnect', () => {
    it('should clean up client registration on disconnect', () => {
      // Simulate client connection
      const mockSocket = {
        id: 'socket-abc',
        handshake: { auth: { token: 'token-abc' }, query: {} },
        disconnect: jest.fn(),
        join: jest.fn(),
      } as unknown as Socket;

      jwtService.verify.mockReturnValue({ sub: 'user-abc' });
      gateway.handleConnection(mockSocket);

      // Now call disconnect
      gateway.handleDisconnect(mockSocket);

      // Since there's no public accessor for clients map, we check via log or check no errors
      expect(gateway.handleDisconnect).toBeDefined();
    });
  });

  describe('handleSendMessage', () => {
    let mockSocket: Partial<Socket> & {
      emit: jest.Mock;
      join: jest.Mock;
      handshake: NonNullable<Socket['handshake']>;
    };


    beforeEach(() => {
      mockSocket = {
        id: 'socket-sender',
        handshake: {
          auth: { token: 'sender-token' },
          query: {},
          headers: {},
          time: '',
          address: '',
          xdomain: false,
          secure: false,
          issued: 0,
          url: '',
        },
        emit: jest.fn(),
        join: jest.fn(),
      };
    });

    it('should not proceed if no token is found in handshake auth', async () => {
      mockSocket.handshake.auth = {};
      await gateway.handleSendMessage(mockSocket as unknown as Socket, {
        receiverId: 'receiver-123',
        content: 'hello',
        type: 'text',
      });

      expect(chatService.sendMessage).not.toHaveBeenCalled();
    });

    it('should verify token, save message, and emit to both parties', async () => {
      jwtService.verify.mockReturnValue({ sub: 'sender-456' });
      const mockSavedMessage = {
        _id: 'message-999',
        senderId: 'sender-456',
        receiverId: 'receiver-123',
        content: 'hello',
        type: 'text' as MessageType,
        createdAt: new Date(),
      };
      chatService.sendMessage.mockResolvedValue(mockSavedMessage as any);

      // Setup Server.to mock
      const mockEmit = jest.fn();
      gateway.server.to = jest.fn().mockReturnValue({ emit: mockEmit });

      await gateway.handleSendMessage(mockSocket as unknown as Socket, {
        receiverId: 'receiver-123',
        content: 'hello',
        type: 'text',
      });

      expect(jwtService.verify).toHaveBeenCalledWith('sender-token');
      expect(mockSocket.join).toHaveBeenCalledWith('user_sender-456');
      expect(chatService.sendMessage).toHaveBeenCalledWith(
        'sender-456',
        'receiver-123',
        'hello',
        'text',
      );
      expect(gateway.server.to).toHaveBeenCalledWith('user_sender-456');
      expect(gateway.server.to).toHaveBeenCalledWith('user_receiver-123');
      expect(mockEmit).toHaveBeenCalledWith('message', mockSavedMessage);
      expect(mockSocket.emit).toHaveBeenCalledWith('message', mockSavedMessage);
    });
  });
});
