import { IsString, IsNumber, IsOptional, IsArray, Min, Max } from 'class-validator';

export class CreateRatingDto {
  @IsString()
  userId!: string; // User being rated

  @IsNumber()
  @Min(1)
  @Max(5)
  score!: number;

  @IsOptional()
  @IsString()
  comment?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
