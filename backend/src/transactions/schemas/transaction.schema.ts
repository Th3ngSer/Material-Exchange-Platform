import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type TransactionDocument = HydratedDocument<Transaction>;

export type TransactionStatus = 'active' | 'completed' | 'failed' | 'SUCCESS';
export type TransactionType = 'sell' | 'exchange' | 'borrow';

@Schema({ timestamps: true })
export class Transaction {
  @Prop({ trim: true })
  buyerName?: string;

  @Prop({ trim: true })
  sellerName?: string;

  @Prop({ trim: true })
  itemTitle?: string;

  @Prop({ min: 0 })
  amount?: number;

  @Prop({ min: 0 })
  serviceFee?: number;

  @Prop({ type: String, enum: ['sell', 'exchange', 'borrow'] })
  type?: TransactionType;

  @Prop({
    type: String,
    enum: ['active', 'completed', 'failed', 'SUCCESS'],
    default: 'active',
  })
  status!: TransactionStatus;

  @Prop()
  itemId?: string;

  @Prop()
  sellerId?: string;

  @Prop()
  buyerId?: string;

  @Prop()
  moderatedBy?: string;

  @Prop()
  logDetails?: string;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
