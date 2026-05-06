import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('send')
  sendMessage(
    @Body() body: { senderId: string; receiverId: string; text: string },
  ) {
    return this.chatService.sendMessage(
      body.senderId,
      body.receiverId,
      body.text,
    );
  }

  @Get('messages/:userId')
  getMessages(@Param('userId') userId: string) {
    return this.chatService.getMessages(userId);
  }
}
