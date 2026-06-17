import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel }                   from '@nestjs/mongoose'
import { Model, Types }                  from 'mongoose'
import { Notification, NotificationDocument } from '../schemas/notification.schema'
import { CreateNotificationDto }         from '../dto/create-notification.dto'

@Injectable()
export class NotificationService {

  constructor(
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<NotificationDocument>,
  ) {}

  // ── Create ───────────────────────────────────────────────

  async create(dto: CreateNotificationDto): Promise<NotificationDocument> {
    return this.notificationModel.create({
      userId:        dto.userId,
      title:         dto.title,
      message:       dto.message,
      type:          dto.type ?? 'alert',
      unread:        dto.unread ?? true,      // default true — new notifications are unread
      relatedPostId: dto.relatedPostId,
      relatedUserId: dto.relatedUserId,
      action:        dto.action,
      actionUrl:     dto.actionUrl,
      imageUrl:      dto.imageUrl,
    })
  }

  // ── Find all for user (paginated) ────────────────────────

  async seedMockNotifications(userId: string): Promise<void> {
    const mocks = [
      {
        userId: new Types.ObjectId(userId),
        title: 'New Borrow Request',
        message: 'John Doe requested to borrow your "Heavy Duty Ladder"',
        type: 'borrow',
        unread: true,
        relatedUserId: new Types.ObjectId('65c000000000000000000001'),
        action: 'Accept Request',
        actionUrl: '/profile/tracker',
      },
      {
        userId: new Types.ObjectId(userId),
        title: 'New Exchange Request',
        message: 'Jane Smith wants to exchange your "Industrial Scrap Metal" for "Plastic Pallets"',
        type: 'exchange',
        unread: true,
        relatedUserId: new Types.ObjectId('65c000000000000000000002'),
        action: 'View Details',
        actionUrl: '/profile/tracker',
      },
      {
        userId: new Types.ObjectId(userId),
        title: 'New Review Received',
        message: 'Michael Scott rated you 5 stars: "Excellent communicator, product was exactly as described!"',
        type: 'review',
        unread: true,
        relatedUserId: new Types.ObjectId('65c000000000000000000003'),
        action: 'View Review',
        actionUrl: '/profile/reviews',
      },
      {
        userId: new Types.ObjectId(userId),
        title: 'New Follower',
        message: 'Sarah started following your profile.',
        type: 'following',
        unread: true,
        relatedUserId: new Types.ObjectId('65c000000000000000000004'),
        action: 'View Profile',
        actionUrl: '/profile?user=Sarah',
      },
    ];

    try {
      await this.notificationModel.insertMany(mocks);
    } catch (err) {
      console.error('Failed to seed notifications:', err);
    }
  }

  async findAllForUser(
    userId: string,
    page  = 1,
    limit = 20,
  ): Promise<{ data: NotificationDocument[]; total: number }> {
    const filter = { userId: new Types.ObjectId(userId) }
    const skip   = (page - 1) * limit

    let total = await this.notificationModel.countDocuments(filter)
    if (total === 0 && page === 1) {
      await this.seedMockNotifications(userId)
      total = await this.notificationModel.countDocuments(filter)
    }

    const data = await this.notificationModel
      .find(filter)
      .populate('relatedUserId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    return { data, total }
  }

  // ── Unread count ─────────────────────────────────────────

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationModel.countDocuments({
      userId: new Types.ObjectId(userId),
      unread: true,
    })
  }

  // ── Mark one as read ─────────────────────────────────────

  async markRead(id: string, userId: string): Promise<NotificationDocument> {
    const notif = await this.notificationModel.findOneAndUpdate(
      { _id: id, userId: new Types.ObjectId(userId) },
      { unread: false },
      { new: true },
    ).populate('relatedUserId')
    if (!notif) throw new NotFoundException('Notification not found.')
    return notif
  }

  // ── Mark all as read ─────────────────────────────────────

  async markAllRead(userId: string): Promise<void> {
    await this.notificationModel.updateMany(
      { userId: new Types.ObjectId(userId), unread: true },
      { unread: false },
    )
  }

  async findOne(id: string, userId: string): Promise<NotificationDocument> {
    const notif = await this.notificationModel.findOne({
      _id: id,
      userId: new Types.ObjectId(userId)
    }).populate('relatedUserId')
    if (!notif) throw new NotFoundException('Notification not found.')
    return notif
  }

  // ── Delete one ───────────────────────────────────────────

  async delete(id: string, userId: string): Promise<void> {
    const result = await this.notificationModel.findOneAndDelete({
      _id:    id,
      userId: new Types.ObjectId(userId),
    })
    if (!result) throw new NotFoundException('Notification not found.')
  }

  // ── Delete all ───────────────────────────────────────────

  async deleteAll(userId: string): Promise<void> {
    await this.notificationModel.deleteMany({
      userId: new Types.ObjectId(userId),
    })
  }
}