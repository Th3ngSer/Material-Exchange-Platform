import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type RatingDocument = HydratedDocument<Rating>;

@Schema({ timestamps: true })
export class Rating {
  @Prop({ required: true, type: Types.ObjectId, index: true })
  userId!: string; // The user being rated (seller)

  @Prop({ required: true, type: Types.ObjectId, index: true })
  raterId!: string; // The user giving the rating (buyer/reviewer)

  @Prop({ required: true, min: 1, max: 5 })
  score!: number; // 1-5 star rating

  @Prop({ trim: true, maxlength: 500 })
  comment?: string; // Optional review text

  @Prop({ type: [String], default: [] })
  tags?: string[]; // Predefined tags like 'Trustworthy', 'Fast Delivery'

  @Prop({ trim: true })
  raterName?: string; // Denormalized for performance

  @Prop({ trim: true })
  raterAvatar?: string; // Denormalized for performance

  createdAt?: Date;

  updatedAt?: Date;
}

export const RatingSchema = SchemaFactory.createForClass(Rating);
