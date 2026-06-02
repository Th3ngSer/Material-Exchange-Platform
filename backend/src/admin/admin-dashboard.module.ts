import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminDashboardController } from './admin-dashboard.controller';
import { AdminDashboardService } from './admin-dashboard.service';
import { AdminSettingsController } from './admin-settings.controller';
import { AdminSettingsService } from './admin-settings.service';
import { Post, PostSchema } from '../posts/entities/post.entity';
import {
  TrackItemUser,
  TrackItemUserSchema,
} from '../trackitemuser/schemas/trackitemuser.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import {
  AdminSettings,
  AdminSettingsSchema,
} from './schemas/admin-settings.schema';
import {
  Transaction,
  TransactionSchema,
} from '../transactions/schemas/transaction.schema';
import { Report, ReportSchema } from '../reports/schemas/report.schema';
import {
  ActivityLog,
  ActivityLogSchema,
} from '../activity-log/schemas/activity-log.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Post.name, schema: PostSchema },
      { name: TrackItemUser.name, schema: TrackItemUserSchema },
      { name: AdminSettings.name, schema: AdminSettingsSchema },
      { name: Transaction.name, schema: TransactionSchema },
      { name: Report.name, schema: ReportSchema },
      { name: ActivityLog.name, schema: ActivityLogSchema },
    ]),
  ],
  controllers: [AdminDashboardController, AdminSettingsController],
  providers: [AdminDashboardService, AdminSettingsService],
  exports: [AdminSettingsService],
})
export class AdminDashboardModule {}
