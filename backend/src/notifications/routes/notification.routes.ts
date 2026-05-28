import { Router } from 'express'
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
} from '../controller/notificationController'
import { protect } from '../middleware/auth'

const router = Router()

// All notification routes require auth
router.use(protect)

router.get('/',              getNotifications)
router.get('/unread-count',  getUnreadCount)
router.patch('/read-all',    markAllAsRead)
router.delete('/',           deleteAllNotifications)
router.patch('/:id/read',    markAsRead)
router.delete('/:id',        deleteNotification)

export default router