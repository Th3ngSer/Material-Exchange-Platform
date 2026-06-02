import {
  IsString,
  IsIn,
  IsNumber,
  IsOptional,
  MinLength,
  Min,
  IsNotEmpty,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreatePostDto {
  @IsIn(['sell', 'exchange', 'lend'])
  type!: string;

  @IsString()
  @MinLength(3)
  title!: string;

  @IsString()
  @MinLength(10)
  description!: string;

  @IsString()
  @IsNotEmpty()
  category!: string;

  @IsIn(['new', 'used'])
  condition!: string;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  @Transform(({ value }) => parseFloat(value)) // FormData sends strings
  @IsNumber()
  @Min(0)
  price!: number;

  @IsOptional()
  @IsString()
  exchangeFor?: string;

  @IsString()
  @IsNotEmpty()
  contact!: string;

  @IsString()
  @IsNotEmpty()
  location!: string;

  @IsOptional()
  @IsString()
  listerName?: string;

  @IsOptional()
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  @Transform(({ value }) => (value === undefined || value === null || value === '' ? undefined : parseFloat(value)))
  @IsNumber()
  lat?: number;

  @IsOptional()
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  @Transform(({ value }) => (value === undefined || value === null || value === '' ? undefined : parseFloat(value)))
  @IsNumber()
  lng?: number;

  @IsOptional()
  @IsString()
  retainImages?: string;

  @IsOptional()
  @IsIn(['active', 'suspended', 'sold'])
  status?: string;
}
