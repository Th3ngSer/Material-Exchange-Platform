import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  AdminSettings,
  AdminSettingsDocument,
} from './schemas/admin-settings.schema';
import { Post, PostDocument } from '../posts/entities/post.entity';
import {
  Transaction,
  TransactionDocument,
} from '../transactions/schemas/transaction.schema';
import {
  TrackItemUser,
  TrackItemUserDocument,
} from '../trackitemuser/schemas/trackitemuser.schema';
import { Report, ReportDocument } from '../reports/schemas/report.schema';
import {
  ActivityLog,
  ActivityLogDocument,
} from '../activity-log/schemas/activity-log.schema';

@Injectable()
export class AdminSettingsService {
  constructor(
    @InjectModel(AdminSettings.name)
    private settingsModel: Model<AdminSettingsDocument>,
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    @InjectModel(Transaction.name)
    private transactionModel: Model<TransactionDocument>,
    @InjectModel(TrackItemUser.name)
    private trackModel: Model<TrackItemUserDocument>,
    @InjectModel(Report.name) private reportModel: Model<ReportDocument>,
    @InjectModel(ActivityLog.name)
    private activityLogModel: Model<ActivityLogDocument>,
  ) {}

  async getSettings(): Promise<AdminSettingsDocument> {
    let settings = await this.settingsModel.findOne().exec();
    if (!settings) {
      settings = new this.settingsModel();
      await settings.save();
    }
    return settings;
  }

  async updateSettings(
    data: Partial<AdminSettings>,
  ): Promise<AdminSettingsDocument> {
    let settings = await this.settingsModel.findOne().exec();
    if (!settings) {
      settings = new this.settingsModel(data);
    } else {
      Object.assign(settings, data);
    }
    return settings.save();
  }

  async clearAllListings(): Promise<{ message: string }> {
    await this.postModel.deleteMany({}).exec();
    return { message: 'All listings deleted successfully.' };
  }

  async resetPlatformData(): Promise<{ message: string }> {
    await Promise.all([
      this.transactionModel.deleteMany({}).exec(),
      this.trackModel.deleteMany({}).exec(),
      this.reportModel.deleteMany({}).exec(),
      this.activityLogModel.deleteMany({}).exec(),
    ]);
    return {
      message:
        'Platform data (transactions, track items, reports, and activity logs) has been reset successfully.',
    };
  }
}
