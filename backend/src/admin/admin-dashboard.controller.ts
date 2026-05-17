import { Controller, Get, UseGuards } from '@nestjs/common';
import { AdminDashboardService } from './admin-dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@Controller('admin/dashboard')
export class AdminDashboardController {
  constructor(private readonly dashboardService: AdminDashboardService) {}

  // Lock this down so only admins can see the stats
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get('stats')
  getStats() {
    return this.dashboardService.getDashboardStats();
  }
}
