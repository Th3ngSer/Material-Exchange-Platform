import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { UsersService } from '../users/users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SendMessageDto } from './dto/send-message.dto';
import { GetConversationDto } from './dto/get-conversation.dto';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

interface AuthenticatedRequest {
  user: { id: string } & JwtPayload;
}

@Controller('chat')
@UseGuards(JwtAuthGuard) // Protect all routes in this controller
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly usersService: UsersService,
  ) {}

  @Post('send')
  async sendMessage(
    @Body() body: SendMessageDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const senderId = req.user.id;

    return this.chatService.sendMessage(
      senderId,
      body.receiverId,
      body.content,
      body.type, // supports text, image, voice
    );
  }

  @Get('users')
  async getUsers(@Req() req: AuthenticatedRequest): Promise<any[]> {
    return await this.usersService.findAllExcept(req.user.id);
  }

  @Get('history')
  async getHistory(
    @Query() query: GetConversationDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const currentUserId = req.user.id;

    return this.chatService.getHistory(currentUserId, query.userId);
  }
}
