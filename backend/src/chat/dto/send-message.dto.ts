import { IsString, IsIn, IsNotEmpty, IsMongoId } from 'class-validator';

export class SendMessageDto {
  @IsMongoId()
  @IsNotEmpty()
  receiverId: string;

  @IsString()
  @IsIn(['text', 'image', 'voice'])
  type: 'text' | 'image' | 'voice';

  @IsString()
  @IsNotEmpty()
  content: string;
}
