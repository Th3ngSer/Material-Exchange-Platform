import { IsString } from 'class-validator';

export class GetConversationDto {
  @IsString()
  userId: string;
}
