import {
  Controller, Get, Post, Patch, Delete,
  Param, Query, Body, UseGuards,
  DefaultValuePipe, ParseIntPipe,
  HttpCode, HttpStatus,
} from '@nestjs/common'
import { Request, Response }         from 'express'
import { model }                     from 'mongoose'
import { NotificationService }       from '../service/notificationService'
import { JwtAuthGuard, CurrentUser } from '../middleware/auth'
import { CreateNotificationDto }     from '../dto/create-notification.dto'

interface AuthUser { _id: string; id: string }

// ─────────────────────────────────────────────────────────
// NestJS Controller  (used by NotificationModule)
// ─────────────────────────────────────────────────────────

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(private readonly svc: NotificationService) {}

  @Get()
  async findAll(
    @CurrentUser() user: AuthUser,
    @Query('page',  new DefaultValuePipe(1),  ParseIntPipe) page:  number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    const result = await this.svc.findAllForUser(user._id ?? user.id, page, limit)
    return { success: true, ...result }
  }

  @Get('unread-count')
  async unreadCount(@CurrentUser() user: AuthUser) {
    const count = await this.svc.getUnreadCount(user._id ?? user.id)
    return { success: true, count }
  }

  @Patch('read-all')
  async markAllRead(@CurrentUser() user: AuthUser) {
    await this.svc.markAllRead(user._id ?? user.id)
    return { success: true, message: 'All notifications marked as read.' }
  }

  @Patch(':id/read')
  async markRead(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    const notif = await this.svc.markRead(id, user._id ?? user.id)
    return { success: true, data: notif }
  }

  @Delete('all')
  @HttpCode(HttpStatus.OK)
  async deleteAll(@CurrentUser() user: AuthUser) {
    await this.svc.deleteAll(user._id ?? user.id)
    return { success: true, message: 'All notifications deleted.' }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deleteOne(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    await this.svc.delete(id, user._id ?? user.id)
    return { success: true, message: 'Notification deleted.' }
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateNotificationDto) {
    const notif = await this.svc.create(dto)
    return { success: true, data: notif }
  }
}

// ─────────────────────────────────────────────────────────
// Express handlers  (used by notification.routes.ts)
// Uses userId + unread to match notification.schema.ts
// ─────────────────────────────────────────────────────────

function NotifModel() {
  return model('Notification')
}

export const getNotifications = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId  = (req as any).user?.id
    const page    = Math.max(parseInt(req.query.page  as string) || 1, 1)
    const limit   = Math.min(parseInt(req.query.limit as string) || 20, 100)
    const skip    = (page - 1) * limit
    const filter: Record<string, any> = { userId }

    if (req.query.type)  filter.type  = req.query.type
    if (req.query.unread !== undefined) filter.unread = req.query.unread === 'true'

    const [data, total] = await Promise.all([
      NotifModel().find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      NotifModel().countDocuments(filter),
    ])

    res.json({
      success: true,
      data,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    })
  } catch {
    res.status(500).json({ success: false, message: 'Failed to fetch notifications.' })
  }
}

export const getUnreadCount = async (req: Request, res: Response): Promise<void> => {
  try {
    const count = await NotifModel().countDocuments({
      userId: (req as any).user?.id,
      unread: true,
    })
    res.json({ success: true, count })
  } catch {
    res.status(500).json({ success: false, message: 'Failed to get unread count.' })
  }
}

export const markAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const notif = await NotifModel().findOneAndUpdate(
      { _id: req.params.id, userId: (req as any).user?.id },
      { unread: false },
      { new: true },
    )
    if (!notif) { res.status(404).json({ success: false, message: 'Notification not found.' }); return }
    res.json({ success: true, data: notif })
  } catch {
    res.status(500).json({ success: false, message: 'Failed to mark as read.' })
  }
}

export const markAllAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    await NotifModel().updateMany(
      { userId: (req as any).user?.id, unread: true },
      { unread: false },
    )
    res.json({ success: true, message: 'All notifications marked as read.' })
  } catch {
    res.status(500).json({ success: false, message: 'Failed to mark all as read.' })
  }
}

export const deleteNotification = async (req: Request, res: Response): Promise<void> => {
  try {
    const notif = await NotifModel().findOneAndDelete({
      _id:    req.params.id,
      userId: (req as any).user?.id,
    })
    if (!notif) { res.status(404).json({ success: false, message: 'Notification not found.' }); return }
    res.json({ success: true, message: 'Notification deleted.' })
  } catch {
    res.status(500).json({ success: false, message: 'Failed to delete notification.' })
  }
}

export const deleteAllNotifications = async (req: Request, res: Response): Promise<void> => {
  try {
    await NotifModel().deleteMany({ userId: (req as any).user?.id })
    res.json({ success: true, message: 'All notifications deleted.' })
  } catch {
    res.status(500).json({ success: false, message: 'Failed to delete all notifications.' })
  }
}