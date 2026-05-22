import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type TransactionDocument = HydratedDocument<Transaction>;

export type TransactionStatus = 'active' | 'completed' | 'failed';
export type TransactionType = 'sell' | 'exchange' | 'borrow';

@Schema({ timestamps: true })
export class Transaction {
  @Prop({ required: true, trim: true })
  buyerName!: string;

  @Prop({ required: true, trim: true })
  sellerName!: string;

  @Prop({ required: true, trim: true })
  itemTitle!: string;

  @Prop({ min: 0 })
  amount?: number;

  @Prop({ type: String, enum: ['sell', 'exchange', 'borrow'], required: true })
  type!: TransactionType;

  @Prop({
    type: String,
    enum: ['active', 'completed', 'failed'],
    default: 'active',
  })
  status!: TransactionStatus;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
