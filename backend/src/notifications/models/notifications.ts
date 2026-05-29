import { Schema, model, Document, Types } from 'mongoose';

export type NotifType =
  | 'message'
  | 'exchange'
  | 'borrow'
  | 'review'
  | 'following';

export type NotifActionVariant = 'primary' | 'outline' | 'green' | 'ghost';

export interface INotifAction {
  label: string;
  variant: NotifActionVariant;
}

export interface INotification extends Document {
  _id: Types.ObjectId;
  recipient: Types.ObjectId; // the user who receives this notification
  sender?: Types.ObjectId; // the user who triggered it (optional)
  type: NotifType;
  title: string; // e.g. "New message from Alex Rivet"
  body: string; // plain text preview
  richBody?: string; // HTML body with links (optional)
  actions: INotifAction[];
  read: boolean;
  orderId?: string; // linked order if relevant
  createdAt: Date;
  updatedAt: Date;
}

const notifActionSchema = new Schema<INotifAction>(
  {
    label: { type: String, required: true },
    variant: {
      type: String,
      enum: ['primary', 'outline', 'green', 'ghost'],
      default: 'outline',
    },
  },
  { _id: false },
);

const notificationSchema = new Schema<INotification>(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    sender: { type: Schema.Types.ObjectId, ref: 'User' },
    type: {
      type: String,
      enum: ['message', 'exchange', 'borrow', 'review', 'following'],
      required: true,
    },
    title: { type: String, required: true },
    body: { type: String, required: true },
    richBody: { type: String },
    actions: { type: [notifActionSchema], default: [] },
    read: { type: Boolean, default: false },
    orderId: { type: String },
  },
  { timestamps: true },
);

// Compound index for efficient user notification queries
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, read: 1 });

export const Notification = model<INotification>(
  'Notification',
  notificationSchema,
);
