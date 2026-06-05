import { Router }       from 'express'
import { protect }      from '../middleware/auth'
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
} from '../controller/notificationController'

const router = Router()

// All routes require a valid JWT
router.use(protect)

// GET    /api/notifications              → paginated list (?page=1&limit=20&type=&read=)
router.get('/',               getNotifications)

// GET    /api/notifications/unread-count → { count: number }
router.get('/unread-count',   getUnreadCount)

// PATCH  /api/notifications/read-all    → mark every notification as read
router.patch('/read-all',     markAllAsRead)

// PATCH  /api/notifications/:id/read   → mark one as read
router.patch('/:id/read',     markAsRead)

// DELETE /api/notifications/:id        → delete one
router.delete('/:id',         deleteNotification)

// DELETE /api/notifications            → delete all
router.delete('/',            deleteAllNotifications)

export default router