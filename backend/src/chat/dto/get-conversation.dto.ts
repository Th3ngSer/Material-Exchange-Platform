import { IsMongoId, IsNotEmpty } from 'class-validator';

export class GetConversationDto {
  @IsMongoId()
  @IsNotEmpty()
  userId: string;
}
