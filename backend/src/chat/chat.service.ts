import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Message,
  MessageDocument,
  MessageType,
} from './schemas/message.schema';
import { ChatGateway } from './chat.gateway';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Message.name)
    private readonly messageModel: Model<MessageDocument>,
    private readonly chatGateway: ChatGateway,
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

    // emit to receiver if connected via websocket
    try {
      this.chatGateway.sendToUser(String(receiverId), 'message', msg);
      // also emit to sender's own room so sender sees the saved message
      this.chatGateway.sendToUser(String(senderId), 'message', msg);
    } catch (err) {
      // ignore emission errors
    }

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
}
