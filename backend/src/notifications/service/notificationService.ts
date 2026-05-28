
import { Types } from 'mongoose'
import { Notification, NotifType, INotifAction } from '../models/notifications'

interface CreateNotifOptions {
  recipient: Types.ObjectId
  sender?: Types.ObjectId
  type: NotifType
  title: string
  body: string
  richBody?: string
  actions?: INotifAction[]
  orderId?: string
}

// Central helper — call this from any controller that needs to fire a notification
export async function createNotification(opts: CreateNotifOptions) {
  return Notification.create({
    recipient: opts.recipient,
    sender:    opts.sender,
    type:      opts.type,
    title:     opts.title,
    body:      opts.body,
    richBody:  opts.richBody,
    actions:   opts.actions ?? [],
    orderId:   opts.orderId,
  })
}

// Pre-built notification factory helpers
export const NotifFactory = {
  newMessage(recipient: Types.ObjectId, sender: Types.ObjectId, preview: string) {
    return createNotification({
      recipient,
      sender,
      type: 'message',
      title: 'New message',
      body: preview,
      actions: [
        { label: 'Reply',       variant: 'primary' },
        { label: 'View Thread', variant: 'outline' },
      ],
    })
  },

  exchangeCompleted(
    recipient: Types.ObjectId,
    orderId: string,
    itemName: string
  ) {
    return createNotification({
      recipient,
      type: 'exchange',
      title: 'Exchange Completed',
      body: `Your transaction for ${itemName} has been finalized.`,
      richBody: `The transaction for <a href="/orders/${orderId}">${itemName}</a> has been successfully finalized.`,
      actions: [
        { label: 'Leave Review', variant: 'outline' },
        { label: 'Invoice',      variant: 'primary' },
      ],
      orderId,
    })
  },

  borrowRequest(
    recipient: Types.ObjectId,
    sender: Types.ObjectId,
    itemName: string,
    days: number,
    orderId: string
  ) {
    return createNotification({
      recipient,
      sender,
      type: 'borrow',
      title: 'Borrow Request',
      body: `Requested: ${itemName} for ${days} days.`,
      actions: [
        { label: 'Leave Review', variant: 'outline' },
        { label: 'Invoice',      variant: 'green' },
      ],
      orderId,
    })
  },
}