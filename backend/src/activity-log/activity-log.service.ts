import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ActivityLog,
  ActivityLogDocument,
} from './schemas/activity-log.schema';

export type ActivityLogInput = {
  adminId: string;
  adminName: string;
  action: string;
  details: string;
};

@Injectable()
export class ActivityLogService {
  constructor(
    @InjectModel(ActivityLog.name)
    private readonly activityModel: Model<ActivityLogDocument>,
  ) {}

  logAction(input: ActivityLogInput) {
    return this.activityModel.create(input);
  }

  /** Fetch the latest 50 admin actions, newest first */
  getRecentLogs() {
    return this.activityModel
      .find()
      .select('adminId adminName action details createdAt')
      .sort({ createdAt: -1 })
      .limit(50)
      .lean()
      .exec();
  }
}
