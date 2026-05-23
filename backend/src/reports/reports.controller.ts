import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportStatusDto } from './dto/update-report-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@Controller()
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post('reports')
  create(@Body() dto: CreateReportDto) {
    return this.reportsService.create(dto);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get('admin/reports')
  findAllForAdmin() {
    return this.reportsService.findAllForAdmin();
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Patch('admin/reports/:id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateReportStatusDto) {
    return this.reportsService.updateStatus(id, dto.status);
  }
}
