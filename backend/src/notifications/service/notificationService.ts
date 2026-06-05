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

  async findAllForUser(
    userId: string,
    page  = 1,
    limit = 20,
  ): Promise<{ data: NotificationDocument[]; total: number }> {
    const filter = { userId: new Types.ObjectId(userId) }
    const skip   = (page - 1) * limit

    const [data, total] = await Promise.all([
      this.notificationModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      this.notificationModel.countDocuments(filter),
    ])

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
    )
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