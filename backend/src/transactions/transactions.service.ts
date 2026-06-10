import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ClientSession } from 'mongoose';
import { Transaction } from './schemas/transaction.schema';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TrackItemUser } from '../trackitemuser/schemas/trackitemuser.schema';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectModel(Transaction.name) private transactionModel: Model<Transaction>,
    @InjectModel(TrackItemUser.name)
    private trackItemUserModel: Model<TrackItemUser>,
  ) {}

  findAllForAdmin() {
    return this.transactionModel
      .find()
      .select('buyerName sellerName itemTitle amount type status serviceFee createdAt')
      .sort({ createdAt: -1 })
      .lean()
      .exec();
  }

  create(input: CreateTransactionDto) {
    return this.transactionModel.create({
      buyerName: input.buyerName,
      sellerName: input.sellerName,
      itemTitle: input.itemTitle,
      amount: input.amount,
      type: input.type,
      status: input.status ?? 'active',
      serviceFee: input.serviceFee,
    });
  }

  async updateStatusByDetails(buyerName: string, sellerName: string, itemTitle: string, status: string) {
    const nextStatus = status.toLowerCase() === 'completed' ? 'completed' : status.toLowerCase() === 'cancelled' ? 'failed' : 'active';
    await this.transactionModel.findOneAndUpdate(
      { buyerName, sellerName, itemTitle, status: 'active' },
      { status: nextStatus }
    ).exec();
  }

  //  Add the Strict trancsaction logic and Save audit log
  async completeP2PTransaction(
    trackId: string,
    adminId: string,
    adminName: string,
  ): Promise<Transaction> {
    const session: ClientSession =
      await this.transactionModel.db.startSession();
    session.startTransaction();

    try {
      const trackingRecord = await this.trackItemUserModel
        .findById(trackId)
        .session(session);

      if (!trackingRecord || trackingRecord.status !== 'RESERVED') {
        throw new BadRequestException(
          'Transaction cannot be completed: Invalid or non-reserved record.',
        );
      }

      // Transition the state machine status
      trackingRecord.status = 'COMPLETED';
      await trackingRecord.save({ session });

      // Generate the official read-only system handshake audit log
      const completedTransaction = new this.transactionModel({
        itemId: trackingRecord.itemId,
        sellerId: trackingRecord.sellerId,
        buyerId: trackingRecord.buyerId,
        status: 'SUCCESS',
        moderatedBy: adminId,
        logDetails: `Handshake confirmed under ticket tracking ID: ${trackId} by administrator ${adminName}`,
      });

      const savedTransaction = await completedTransaction.save({ session });

      await session.commitTransaction();
      await session.endSession();
      return savedTransaction;
    } catch (error) {
      await session.abortTransaction();
      await session.endSession();
      throw error;
    }
  }

  async findAll(ownerId: string) {
    return this.trackItemUserModel
      .find({ ownerId })
      .select('itemId')
      .lean()
      .exec();
  }

  async remove(id: string) {
    return this.transactionModel.findByIdAndDelete(id).exec();
  }
}
