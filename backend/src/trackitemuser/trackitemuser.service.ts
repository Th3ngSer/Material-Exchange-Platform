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
import { TransactionsService } from '../transactions/transactions.service';
import { NotificationService } from '../notifications/service/notificationService';

@Injectable()
export class TrackitemuserService {
  constructor(
    @InjectModel(TrackItemUser.name)
    private trackModel: Model<TrackItemUserDocument>,

    @InjectModel(Counter.name)
    private counterModel: Model<CounterDocument>,
    private readonly transactionsService: TransactionsService,
    private readonly notificationService: NotificationService,
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
    const saved = await created.save();

    await this.transactionsService.create({
      buyerName: dto.buyerName ?? dto.name,
      sellerName: dto.sellerName ?? '---',
      itemTitle: dto.itemTitle ?? dto.name,
      amount: dto.amount,
      type: dto.type ?? 'sell',
      status: dto.transactionStatus ?? 'active',
      serviceFee: dto.serviceFee,
    });

    // CREATE NOTIFICATION FOR THE SELLER
    if (dto.sellerId) {
      try {
        const notifType = dto.type === 'borrow' ? 'borrow' : (dto.type === 'exchange' ? 'exchange' : 'order');
        await this.notificationService.create({
          userId: dto.sellerId,
          title: `New ${dto.type === 'borrow' ? 'Borrow' : (dto.type === 'exchange' ? 'Exchange' : 'Order')} Request`,
          message: `${dto.buyerName || 'A user'} has requested to ${dto.type || 'exchange'} your item "${dto.itemTitle || dto.name}"`,
          type: notifType,
          relatedPostId: dto.itemId ? dto.itemId as any : undefined,
          relatedUserId: dto.buyerId ? dto.buyerId as any : undefined,
          action: 'View Details',
          actionUrl: '/profile/tracker',
        });
      } catch (err) {
        console.error('Failed to create notification on tracker create:', err);
      }
    }

    // CREATE NOTIFICATION FOR THE BUYER
    if (dto.buyerId) {
      try {
        const notifType = dto.type === 'borrow' ? 'borrow' : (dto.type === 'exchange' ? 'exchange' : 'order');
        await this.notificationService.create({
          userId: dto.buyerId,
          title: `${dto.type === 'borrow' ? 'Borrow' : (dto.type === 'exchange' ? 'Exchange' : 'Order')} Request Sent`,
          message: `Your request to ${dto.type || 'exchange'} "${dto.itemTitle || dto.name}" has been sent to ${dto.sellerName || 'the owner'}.`,
          type: notifType,
          relatedPostId: dto.itemId ? dto.itemId as any : undefined,
          relatedUserId: dto.sellerId ? dto.sellerId as any : undefined,
          action: 'View Details',
          actionUrl: '/profile/tracker',
        });
      } catch (err) {
        console.error('Failed to create buyer notification on tracker create:', err);
      }
    }

    return saved;
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
    const updated = await this.trackModel.findOneAndUpdate(
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

    if (updated && (dto.status === 'Completed' || dto.status === 'Cancelled')) {
      await this.transactionsService.updateStatusByDetails(
        updated.buyerName ?? '',
        updated.sellerName ?? '',
        updated.itemTitle ?? '',
        dto.status
      );
    }

    if (updated) {
      // Notify Buyer
      if (updated.buyerId) {
        try {
          const notifType = updated.type === 'borrow' ? 'borrow' : (updated.type === 'exchange' ? 'exchange' : 'order');
          await this.notificationService.create({
            userId: updated.buyerId,
            title: `Transaction Status Updated`,
            message: `The status of your ${updated.type || 'exchange'} for "${updated.itemTitle}" has been updated to "${dto.status}".`,
            type: notifType,
            relatedPostId: updated.itemId ? updated.itemId as any : undefined,
            relatedUserId: updated.sellerId ? updated.sellerId as any : undefined,
            action: 'View Details',
            actionUrl: '/profile/tracker',
          });
        } catch (err) {
          console.error('Failed to create buyer notification on status update:', err);
        }
      }

      // Notify Seller / Owner
      if (updated.sellerId) {
        try {
          const notifType = updated.type === 'borrow' ? 'borrow' : (updated.type === 'exchange' ? 'exchange' : 'order');
          await this.notificationService.create({
            userId: updated.sellerId,
            title: `Transaction Status Updated`,
            message: `The status of the ${updated.type || 'exchange'} request by ${updated.buyerName || 'buyer'} for "${updated.itemTitle}" has been updated to "${dto.status}".`,
            type: notifType,
            relatedPostId: updated.itemId ? updated.itemId as any : undefined,
            relatedUserId: updated.buyerId ? updated.buyerId as any : undefined,
            action: 'View Details',
            actionUrl: '/profile/tracker',
          });
        } catch (err) {
          console.error('Failed to create seller notification on status update:', err);
        }
      }
    }

    return updated;
  }

  async removeByCustomId(id: number) {
    return this.trackModel.findOneAndDelete({ customId: id });
  }
}
