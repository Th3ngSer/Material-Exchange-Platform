import { IsString, IsOptional } from 'class-validator';

export class CreateTrackItemUserDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  status?: string;
}
