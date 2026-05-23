import { IsIn, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateTransactionDto {
  @IsString()
  buyerName!: string;

  @IsString()
  sellerName!: string;

  @IsString()
  itemTitle!: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;

  @IsIn(['sell', 'exchange', 'borrow'])
  type!: 'sell' | 'exchange' | 'borrow';

  @IsOptional()
  @IsIn(['active', 'completed', 'failed'])
  status?: 'active' | 'completed' | 'failed';
}
