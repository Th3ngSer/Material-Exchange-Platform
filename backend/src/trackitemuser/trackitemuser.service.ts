import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Counter, CounterDocument } from './schemas/counter.schema';
import {
  TrackItemUser,
  TrackItemUserDocument,
} from './schemas/trackitemuser.schema';
import { CreateTrackItemUserDto } from './dto/create-trackitemuser.dto';
import { UpdateTrackStatusUserDto } from './dto/update-trackstatususer.dto';

@Injectable()
export class TrackitemuserService {
  constructor(
    @InjectModel(TrackItemUser.name)
    private trackModel: Model<TrackItemUserDocument>,

    @InjectModel(Counter.name)
    private counterModel: Model<CounterDocument>, // 👈 ADD THIS
  ) {}
  private async getNextSequence(): Promise<number> {
    const counter = await this.counterModel.findByIdAndUpdate(
      { _id: 'trackitemuser' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true },
    );

    return counter.seq;
  }

  async create(dto: CreateTrackItemUserDto) {
    const nextId = await this.getNextSequence();

    const created = new this.trackModel({
      ...dto,
      customId: nextId,
    });

    return created.save();
  }

  async findOneByCustomId(id: number) {
    const item = await this.trackModel.findOne({ customId: id });

    if (!item) {
      throw new NotFoundException('Item not found');
    }

    return item;
  }

  async findAll() {
    return this.trackModel.find();
  }

  async updateByCustomId(id: number, dto: UpdateTrackStatusUserDto) {
    return this.trackModel.findOneAndUpdate(
      { customId: id },
      {
        status: dto.status,
        $push: {
          history: {
            status: dto.status,
            reason: dto.reason,
            time: new Date().toISOString(),
          },
        },
      },
      { new: true },
    );
  }

  async removeByCustomId(id: number) {
    return this.trackModel.findOneAndDelete({ customId: id });
  }
}
