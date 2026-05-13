import { IsString, IsIn } from 'class-validator';

export class SendMessageDto {
  @IsString()
  receiverId: string;

  @IsIn(['text', 'image', 'voice'])
  type: 'text' | 'image' | 'voice';

  @IsString()
  content: string;
}
