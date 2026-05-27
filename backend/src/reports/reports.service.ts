import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateReportDto } from './dto/create-report.dto';
import { Report, ReportDocument } from './schemas/report.schema';

@Injectable()
export class ReportsService {
  constructor(
    @InjectModel(Report.name)
    private readonly reportModel: Model<ReportDocument>,
  ) {}

  create(input: CreateReportDto) {
    return this.reportModel.create({
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      phone: input.phone,
      message: input.message,
      request: input.request,
      userId: input.userId,
      status: 'pending',
    });
  }

  findAllForAdmin() {
    return this.reportModel
      .find()
      .select('firstName lastName email phone message request status createdAt')
      .sort({ createdAt: -1 })
      .lean()
      .exec();
  }

  updateStatus(id: string, status: 'pending' | 'reviewed' | 'done') {
    return this.reportModel
      .findByIdAndUpdate(id, { status }, { new: true })
      .select('firstName lastName email phone message request status createdAt')
      .lean()
      .exec();
  }

  async bulkDelete(ids: string[]): Promise<{ deleted: number }> {
    if (!ids.length) {
      return { deleted: 0 };
    }
    const result = await this.reportModel.deleteMany({ _id: { $in: ids } }).exec();
    return { deleted: result.deletedCount ?? 0 };
  }
}
