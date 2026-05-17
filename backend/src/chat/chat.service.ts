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

  // ✔ Send message
  async sendMessage(senderId: string, receiverId: string, content: string) {
    return this.messageModel.create({
      senderId,
      receiverId,
      type: 'text',
      content,
    });
  }

  // ✔ FIXED: full chat (A ↔ B)
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

  // ✔ user messages
  async getMessages(userId: string) {
    return this.messageModel.find({
      $or: [{ senderId: userId }, { receiverId: userId }],
    });
  }
}
