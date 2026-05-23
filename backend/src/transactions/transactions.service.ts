import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Transaction, TransactionDocument } from './schemas/transaction.schema';
import { CreateTransactionDto } from './dto/create-transaction.dto';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectModel(Transaction.name)
    private readonly transactionModel: Model<TransactionDocument>,
  ) {}

  findAllForAdmin() {
    return this.transactionModel
      .find()
      .select('buyerName sellerName itemTitle amount type status createdAt')
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
    });
  }
}
