import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TrackItemUserDocument = TrackItemUser & Document;

@Schema({
  timestamps: true,
  toJSON: {
    transform: (doc, ret) => {
      const { _id: _unusedId, __v: _unusedV, ...result } = ret;
      void _unusedId;
      void _unusedV;
      return result;
    },
  },
})
export class TrackItemUser {
  @Prop()
  customId: number;

  @Prop({ required: true })
  name: string;

  @Prop({ default: 'Available' })
  status: string;

  @Prop([
    {
      status: String,
      time: String,
      reason: String,
    },
  ])
  history: {
    status: string;
    time: string;
    reason?: string;
  }[];
}

export const TrackItemUserSchema = SchemaFactory.createForClass(TrackItemUser);
