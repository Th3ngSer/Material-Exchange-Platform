import { IsIn, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateTrackItemUserDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  buyerName?: string;

  @IsOptional()
  @IsString()
  sellerName?: string;

  @IsOptional()
  @IsString()
  itemTitle?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;

  @IsOptional()
  @IsIn(['sell', 'exchange', 'borrow'])
  type?: 'sell' | 'exchange' | 'borrow';

  @IsOptional()
  @IsIn(['active', 'completed', 'failed'])
  transactionStatus?: 'active' | 'completed' | 'failed';

  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @IsOptional()
  @IsNumber()
  serviceFee?: number;

  @IsOptional()
  @IsNumber()
  deposit?: number;

  @IsOptional()
  @IsNumber()
  totalPaid?: number;

  @IsOptional()
  @IsString()
  paymentSlip?: string;
}
