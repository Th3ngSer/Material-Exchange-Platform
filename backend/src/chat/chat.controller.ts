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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SendMessageDto } from './dto/send-message.dto';
import { GetConversationDto } from './dto/get-conversation.dto';

@Controller('chat')
@UseGuards(JwtAuthGuard) // Protect all routes in this controller
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('send')
  async sendMessage(
    @Body() body: SendMessageDto,
    @Req() req: any,
  ) {
    const senderId = req.user.id;

    return this.chatService.sendMessage(
      senderId,
      body.receiverId,
      body.content,
      body.type, // supports text, image, voice
    );
  }

  @Get('history')
  async getHistory(
    @Query() query: GetConversationDto,
    @Req() req: any,
  ) {
    const currentUserId = req.user.id;

    return this.chatService.getHistory(
      currentUserId,
      query.userId,
    );
  }
}
