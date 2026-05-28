import {
  Controller,
  Delete,
  Get,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { UsersService } from './users.service';
import { ActivityLogService } from '../activity-log/activity-log.service';

@Controller('admin/users')
export class AdminUsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly activityLogService: ActivityLogService,
  ) {}

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get()
  listUsers(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    const parsedPage = page ? Number(page) : 1;
    const parsedLimit = limit ? Number(limit) : 10;
    const normalizedSearch = search?.trim() || undefined;

    return this.usersService.findAllForAdmin(
      Number.isFinite(parsedPage) ? parsedPage : 1,
      Number.isFinite(parsedLimit) ? parsedLimit : 10,
      normalizedSearch,
    );
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Delete(':id')
  async deleteUser(
    @Param('id') id: string,
    @Req() req: { user: { id: string; email: string } },
  ) {
    const result = await this.usersService.removeById(id);

    await this.activityLogService.logAction({
      adminId: req.user.id,
      adminName: req.user.email,
      action: 'DELETE_USER',
      details: `Deleted user ${id}`,
    });

    return result;
  }
}
