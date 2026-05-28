import type { Request, Response } from 'express'
import { Notification } from '../models/notifications'
import { asyncHandler } from '../middleware/errorHandler'


// GET /api/notifications
export const getNotifications = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id
  const { type, read, page = '1', limit = '20' } = req.query

  const filter: Record<string, any> = { recipient: userId }

  if (type) filter.type = type
  if (read !== undefined) filter.read = read === 'true'

  const pageNum = Math.max(parseInt(page as string, 10), 1)
  const limitNum = Math.min(parseInt(limit as string, 10), 100)
  const skip = (pageNum - 1) * limitNum

  const [notifications, total] = await Promise.all([
    Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('sender', 'name avatar'),

    Notification.countDocuments(filter),
  ])

  res.status(200).json({
    success: true,
    data: notifications,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    },
  })
})

export const getUnreadCount = asyncHandler(async (req: Request, res: Response) => {
  const count = await Notification.countDocuments({
    recipient: req.user!.id,
    read: false,
  })

  res.status(200).json({ success: true, count })
})

export const markAsRead = asyncHandler(async (req: Request, res: Response) => {
  const notif = await Notification.findOneAndUpdate(
    { _id: req.params.id, recipient: req.user!.id },
    { read: true },
    { new: true }
  )

  if (!notif) {
    return res.status(404).json({
      success: false,
      message: 'Notification not found.',
    })
  }

  res.status(200).json({ success: true, data: notif })
})

export const markAllAsRead = asyncHandler(async (req: Request, res: Response) => {
  await Notification.updateMany(
    { recipient: req.user!.id, read: false },
    { read: true }
  )

  res.status(200).json({
    success: true,
    message: 'All notifications marked as read.',
  })
})

export const deleteNotification = asyncHandler(async (req: Request, res: Response) => {
  const notif = await Notification.findOneAndDelete({
    _id: req.params.id,
    recipient: req.user!.id,
  })

  if (!notif) {
    return res.status(404).json({
      success: false,
      message: 'Notification not found.',
    })
  }

  res.status(200).json({
    success: true,
    message: 'Notification deleted.',
  })
})

export const deleteAllNotifications = asyncHandler(async (req: Request, res: Response) => {
  await Notification.deleteMany({ recipient: req.user!.id })

  res.status(200).json({
    success: true,
    message: 'All notifications deleted.',
  })
})