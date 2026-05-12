import { IsOptional, IsString } from 'class-validator';

export class UpdateTrackStatusUserDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  reason?: string;
}
