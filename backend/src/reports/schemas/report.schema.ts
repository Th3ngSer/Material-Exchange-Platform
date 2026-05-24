import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ReportDocument = HydratedDocument<Report>;
export type ReportStatus = 'pending' | 'reviewed' | 'done';

@Schema({ timestamps: true })
export class Report {
  @Prop({ required: true, trim: true })
  firstName!: string;

  @Prop({ required: true, trim: true })
  lastName!: string;

  @Prop({ required: true, trim: true })
  email!: string;

  @Prop({ required: true, trim: true })
  phone!: string;

  @Prop({ required: true, trim: true })
  message!: string;

  @Prop({ required: true, trim: true })
  request!: string;

  @Prop({ trim: true })
  userId?: string;

  @Prop({
    type: String,
    enum: ['pending', 'reviewed', 'done'],
    default: 'pending',
  })
  status!: ReportStatus;
}

export const ReportSchema = SchemaFactory.createForClass(Report);
