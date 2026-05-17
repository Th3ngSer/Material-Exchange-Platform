import { Controller, Post, Body, Get, Param, Query } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  // ✔ send message
  @Post('send')
  sendMessage(
    @Body()
    body: {
      senderId: string;
      receiverId: string;
      content: string;
    },
  ) {
    return this.chatService.sendMessage(
      body.senderId,
      body.receiverId,
      body.content,
    );
  }

  // ✔ chat history A ↔ B
  @Get('history')
  getHistory(@Query('user1') user1: string, @Query('user2') user2: string) {
    return this.chatService.getHistory(user1, user2);
  }

  // ✔ single user messages
  @Get('messages/:userId')
  getMessages(@Param('userId') userId: string) {
    return this.chatService.getMessages(userId);
  }
}
