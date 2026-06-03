import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type MessageDocument = HydratedDocument<Message>;
export type MessageType = 'text' | 'image' | 'voice';

@Schema({ timestamps: true })
export class Message {
  @Prop({ required: true })
  senderId!: string;

  @Prop({ required: true })
  receiverId!: string;

  @Prop({
    required: true,
    enum: ['text', 'image', 'voice'],
    default: 'text',
  })
  type!: MessageType;

  @Prop({ required: true })
  content!: string;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
