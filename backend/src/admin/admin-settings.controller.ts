import { Controller, Get, Put, Delete, Body, UseGuards } from '@nestjs/common';
import { AdminSettingsService } from './admin-settings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { AdminSettings } from './schemas/admin-settings.schema';

@Controller('admin/settings')
export class AdminSettingsController {
  constructor(private readonly settingsService: AdminSettingsService) {}

  @Get('public')
  async getPublicSettings() {
    const settings = await this.settingsService.getSettings();
    return {
      siteName: settings.siteName,
      maintenanceMode: settings.maintenanceMode,
      allowNewRegistrations: settings.allowNewRegistrations,
      defaultCurrency: settings.defaultCurrency,
    };
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get()
  async getSettings() {
    return this.settingsService.getSettings();
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Put()
  async updateSettings(@Body() data: Partial<AdminSettings>) {
    return this.settingsService.updateSettings(data);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Delete('listings')
  async clearAllListings() {
    return this.settingsService.clearAllListings();
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Delete('reset')
  async resetPlatformData() {
    return this.settingsService.resetPlatformData();
  }
}
