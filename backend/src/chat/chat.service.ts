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

  async sendMessage(
    senderId: string,
    receiverId: string,
    content: string,
  ) {
    return this.messageModel.create({
      senderId,
      receiverId,
      type: 'text',
      content,
    });
  }

  async getMessages(userId: string) {
    return this.messageModel.find({
      $or: [{ senderId: userId }, { receiverId: userId }],
    });
  }
}
