import { IsEmail, IsOptional, IsString } from 'class-validator';

export class CreateReportDto {
  @IsString()
  firstName!: string;

  @IsString()
  lastName!: string;

  @IsEmail()
  email!: string;

  @IsString()
  phone!: string;

  @IsString()
  message!: string;

  @IsString()
  request!: string;

  @IsOptional()
  @IsString()
  userId?: string;
}
