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
    const msg = await this.messageModel.create({
      senderId,
      receiverId,
      content,
      type,
    });

    // Message is now emitted by the gateway after the message is saved
    return msg;
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

  // DELETE ALL MESSAGES BETWEEN TWO USERS
  async deleteConversation(user1: string, user2: string) {
    return this.messageModel.deleteMany({
      $or: [
        { senderId: user1, receiverId: user2 },
        { senderId: user2, receiverId: user1 },
      ],
    }).exec();
  }

  async getChatPartners(userId: string): Promise<string[]> {
    const messages = await this.messageModel
      .find({
        $or: [{ senderId: userId }, { receiverId: userId }],
      })
      .select('senderId receiverId')
      .exec();

    const partners = new Set<string>();
    messages.forEach((msg) => {
      const s = String(msg.senderId);
      const r = String(msg.receiverId);
      if (s !== String(userId)) partners.add(s);
      if (r !== String(userId)) partners.add(r);
    });

    return Array.from(partners);
  }
}
