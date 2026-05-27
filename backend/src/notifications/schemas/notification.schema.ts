import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type NotificationDocument = Notification & Document;

@Schema({ timestamps: true })
export class Notification {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId!: Types.ObjectId;

  @Prop({ required: true })
  title!: string;

  @Prop()
  message?: string;

  @Prop({
    enum: ['message', 'exchange', 'review', 'following', 'order', 'alert'],
    default: 'alert',
  })
  type!: string;

  @Prop({ default: false })
  unread!: boolean;

  @Prop()
  relatedPostId?: Types.ObjectId;

  @Prop()
  relatedUserId?: Types.ObjectId;

  @Prop()
  action?: string;

  @Prop()
  actionUrl?: string;

  @Prop()
  imageUrl?: string;

  createdAt?: Date;
  updatedAt?: Date;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
