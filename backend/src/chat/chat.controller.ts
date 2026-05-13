// chat/chat.controller.ts
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

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @UseGuards(JwtAuthGuard)
  @Post('send')
  async sendMessage(
    @Body() body: { receiverId: string; content: string },
    @Req() req: any,
  ) {
    // 🔥 THIS WILL NOW WORK
    const senderId = req.user.id;

    return this.chatService.sendMessage(
      senderId,
      body.receiverId,
      body.content,
    );
  }

  @Get('history')
  async getHistory(
    @Query('user1') user1: string,
    @Query('user2') user2: string,
  ) {
    return this.chatService.getHistory(user1, user2);
  }
}
