import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PostDocument = HydratedDocument<Post>;

@Schema({ timestamps: true })
export class Post {
  @Prop({ required: true, enum: ['sell', 'exchange', 'lend'] })
  type!: string;

  @Prop({ required: true, trim: true, minlength: 3 })
  title!: string;

  @Prop({ required: true, minlength: 10 })
  description!: string;

  @Prop({ required: true })
  category!: string;

  @Prop({ required: true, enum: ['new', 'used'] })
  condition!: string;

  @Prop({ required: true, min: 0, default: 0 })
  price!: number;

  @Prop()
  exchangeFor?: string;

  @Prop({ required: true })
  contact!: string;

  @Prop({ required: true, index: true })
  ownerId!: string;

  @Prop({ required: true })
  location!: string;

  @Prop({ type: Number })
  lat?: number;

  @Prop({ type: Number })
  lng?: number;

  @Prop({ trim: true })
  listerName?: string;

  @Prop({ trim: true })
  listerAvatar?: string;

  @Prop({
    type: String,
    enum: ['active', 'suspended', 'sold'],
    default: 'active',
  })
  status!: string;

  @Prop({ type: [String], default: [] })
  images!: string[];
}

export const PostSchema = SchemaFactory.createForClass(Post);
