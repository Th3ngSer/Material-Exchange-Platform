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

  @Transform(({ value }: { value: string | number }) =>
    typeof value === 'number' ? value : parseFloat(String(value)),
  ) // FormData sends strings
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
  @Transform(({ value }: { value?: string | number | null }) =>
    value === undefined || value === null || value === ''
      ? undefined
      : typeof value === 'number'
        ? value
        : parseFloat(String(value)),
  )
  @IsNumber()
  lat?: number;

  @IsOptional()
  @Transform(({ value }: { value?: string | number | null }) =>
    value === undefined || value === null || value === ''
      ? undefined
      : typeof value === 'number'
        ? value
        : parseFloat(String(value)),
  )
  @IsNumber()
  lng?: number;

  @IsOptional()
  @IsString()
  retainImages?: string;

  @IsOptional()
  @IsIn(['active', 'suspended', 'sold'])
  status?: string;
}
