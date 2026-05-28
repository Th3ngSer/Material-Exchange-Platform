import { IsString, IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { Types } from 'mongoose';

export class CreateNotificationDto {
  @IsString()
  userId!: string | Types.ObjectId;

  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  message?: string;

  @IsOptional()
  @IsEnum(['message', 'exchange', 'review', 'following', 'order', 'alert'])
  type?: string;

  @IsOptional()
  @IsBoolean()
  unread?: boolean;

  @IsOptional()
  @IsString()
  relatedPostId?: string;

  @IsOptional()
  @IsString()
  relatedUserId?: string;

  @IsOptional()
  @IsString()
  action?: string;

  @IsOptional()
  @IsString()
  actionUrl?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}
