import { IsIn } from 'class-validator';

export class UpdateReportStatusDto {
  @IsIn(['pending', 'reviewed', 'done'])
  status!: 'pending' | 'reviewed' | 'done';
}
