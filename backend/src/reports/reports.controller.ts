import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportStatusDto } from './dto/update-report-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { ActivityLogService } from '../activity-log/activity-log.service';

@Controller()
export class ReportsController {
  constructor(
    private readonly reportsService: ReportsService,
    private readonly activityLogService: ActivityLogService,
  ) {}

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
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateReportStatusDto,
    @Req() req: { user: { id: string; email: string } },
  ) {
    const updated = await this.reportsService.updateStatus(id, dto.status);

    await this.activityLogService.logAction({
      adminId: req.user.id,
      adminName: req.user.email,
      action: dto.status === 'done' ? 'DONE_REPORT' : 'REVIEW_REPORT',
      details: `Marked report ${id} as ${dto.status}`,
    });

    return updated;
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Delete('admin/reports')
  bulkDelete(@Body() body: { ids: string[] }) {
    return this.reportsService.bulkDelete(body.ids ?? []);
  }
}
