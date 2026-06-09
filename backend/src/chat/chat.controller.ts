import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Req,
  UseGuards,
  Logger,
  Delete,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { UsersService } from '../users/users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SendMessageDto } from './dto/send-message.dto';
import { GetConversationDto } from './dto/get-conversation.dto';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

interface AuthenticatedRequest {
  user: { id: string } & JwtPayload;
}

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  private readonly logger = new Logger(ChatController.name);

  constructor(
    private readonly chatService: ChatService,
    private readonly chatGateway: ChatGateway,
    private readonly usersService: UsersService,
  ) {}

  // ✅ Send message
  @Post('send')
  async sendMessage(
    @Body() body: SendMessageDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const senderId = req.user.id;

    const message = await this.chatService.sendMessage(
      senderId,
      body.receiverId,
      body.content,
      body.type,
    );

    this.logger.log(
      `Message from ${senderId} to ${body.receiverId} type=${body.type}`,
    );

    this.chatGateway.sendToUser(String(senderId), 'message', message);
    this.chatGateway.sendToUser(String(body.receiverId), 'message', message);

    return message;
  }

  // ✅ Get users (exclude current user)
  @Get('users')
  async getUsers(@Req() req: AuthenticatedRequest): Promise<any[]> {
    return this.usersService.findAllExcept(req.user.id);
  }

  // ✅ Get chat history
  @Get('history')
  async getHistory(
    @Query() query: GetConversationDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.chatService.getHistory(req.user.id, query.userId);
  }

  @Delete('conversation')
  async deleteConversation(
    @Query('userId') userId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const currentUserId = req.user.id;

    // 1. Delete chat messages
    const result = await this.chatService.deleteConversation(
      currentUserId,
      userId,
    );

    this.logger.log(
      `Deleted conversation between ${currentUserId} and ${userId}`,
    );



    return {
      deletedCount: result.deletedCount ?? 0,
    };
  }
}