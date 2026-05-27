import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Notification,
  NotificationDocument,
} from './schemas/notification.schema';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<NotificationDocument>,
  ) {}

  async create(
    createNotificationDto: CreateNotificationDto,
  ): Promise<Notification> {
    const notification = new this.notificationModel(createNotificationDto);
    return notification.save();
  }

  async findAllByUserId(userId: string): Promise<Notification[]> {
    // Auto-seed sample notifications on first fetch if none exist
    const existingCount = await this.notificationModel
      .countDocuments({ userId: new Types.ObjectId(userId) })
      .exec();

    if (existingCount === 0) {
      const sampleNotifications = [
        {
          userId: new Types.ObjectId(userId),
          title: 'Welcome to Notifications!',
          message: 'You have successfully activated notifications.',
          type: 'alert',
          unread: true,
          imageUrl: '📬',
        },
        {
          userId: new Types.ObjectId(userId),
          title: 'New Exchange Request',
          message: 'Someone is interested in your laptop for exchange.',
          type: 'exchange',
          unread: true,
          imageUrl: '🔄',
        },
        {
          userId: new Types.ObjectId(userId),
          title: 'Message from John',
          message: 'Hi! Is this item still available?',
          type: 'message',
          unread: true,
          imageUrl: '💬',
        },
        {
          userId: new Types.ObjectId(userId),
          title: '5-Star Review Received',
          message: 'You received a 5-star review for your recent transaction.',
          type: 'review',
          unread: false,
          imageUrl: '⭐',
        },
        {
          userId: new Types.ObjectId(userId),
          title: 'New Follower',
          message: 'Sarah started following your profile.',
          type: 'following',
          unread: false,
          imageUrl: '👥',
        },
      ];

      await this.notificationModel.insertMany(sampleNotifications);
    }

    return this.notificationModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string): Promise<Notification | null> {
    return this.notificationModel.findById(new Types.ObjectId(id)).exec();
  }

  async update(
    id: string,
    updateNotificationDto: UpdateNotificationDto,
  ): Promise<Notification | null> {
    return this.notificationModel
      .findByIdAndUpdate(new Types.ObjectId(id), updateNotificationDto, {
        new: true,
      })
      .exec();
  }

  async remove(id: string): Promise<Notification | null> {
    return this.notificationModel
      .findByIdAndDelete(new Types.ObjectId(id))
      .exec();
  }

  async markAsRead(id: string): Promise<Notification | null> {
    return this.notificationModel
      .findByIdAndUpdate(
        new Types.ObjectId(id),
        { unread: false },
        { new: true },
      )
      .exec();
  }

  async markAllAsReadByUserId(userId: string): Promise<any> {
    return this.notificationModel
      .updateMany({ userId: new Types.ObjectId(userId) }, { unread: false })
      .exec();
  }

  async deleteAllByUserId(userId: string): Promise<any> {
    return this.notificationModel
      .deleteMany({ userId: new Types.ObjectId(userId) })
      .exec();
  }
}
