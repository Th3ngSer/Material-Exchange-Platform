import { IsString } from 'class-validator';

export class SendMessageDto {
  @IsString()
  receiverId: string;

  @IsString()
  type: 'text' | 'image' | 'voice';

  @IsString()
  content: string;
}
