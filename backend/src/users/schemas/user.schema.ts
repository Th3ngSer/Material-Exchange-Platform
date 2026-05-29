import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

export enum UserStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
}

@Schema({ timestamps: true })
export class User {
  _id?: any;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email!: string;

  @Prop({ required: true })
  password!: string;

  @Prop({ trim: true })
  name?: string;

  @Prop({ trim: true })
  username?: string;

  @Prop({ trim: true })
  gender?: string;

  @Prop({ trim: true })
  phone?: string;

  @Prop({ trim: true })
  nationality?: string;

  @Prop({ trim: true })
  birthDate?: string;

  @Prop({ trim: true })
  avatar?: string;

  @Prop({ type: String, enum: UserRole, default: UserRole.USER })
  role!: UserRole;

  @Prop({ type: String, enum: UserStatus, default: UserStatus.ACTIVE })
  status!: UserStatus;

  @Prop({ type: Number, default: 0, min: 0 })
  listingsCount!: number;

  @Prop({ type: Number, default: 0, min: 0, max: 5 })
  rating!: number;

  createdAt?: Date;

  updatedAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
