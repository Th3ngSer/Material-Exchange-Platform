import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message, MessageDocument } from './schemas/message.schema';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Message.name)
    private messageModel: Model<MessageDocument>,
  ) {}

  // SEND MESSAGE
  async sendMessage(senderId: string, receiverId: string, content: string) {
    return this.messageModel.create({
      senderId,
      receiverId,
      content,
      type: 'text',
    });
  }

  // GET CONVERSATION (SECURE)
  async getHistory(user1: string, user2: string) {
    return this.messageModel
      .find({
        $or: [
          { senderId: user1, receiverId: user2 },
          { senderId: user2, receiverId: user1 },
        ],
      })
      .sort({ createdAt: 1 });
  }
}
