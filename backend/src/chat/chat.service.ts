import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Message,
  MessageDocument,
  MessageType,
} from './schemas/message.schema';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Message.name)
    private readonly messageModel: Model<MessageDocument>,
  ) {}

  // SEND MESSAGE (text, image, voice)
  async sendMessage(
    senderId: string,
    receiverId: string,
    content: string,
    type: MessageType = 'text',
  ) {
    return this.messageModel.create({
      senderId,
      receiverId,
      content,
      type,
    });
  }

  // GET CONVERSATION BETWEEN TWO USERS
  async getHistory(user1: string, user2: string) {
    return this.messageModel
      .find({
        $or: [
          { senderId: user1, receiverId: user2 },
          { senderId: user2, receiverId: user1 },
        ],
      })
      .sort({ createdAt: 1 })
      .exec();
  }
}
