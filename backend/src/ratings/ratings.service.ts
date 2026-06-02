import { Injectable } from '@nestjs/common';
import { CreateRatingDto } from '../ratingDTO/rating.dto';

interface Transaction {
  sellerId: number;
  status: string;
}

interface Rating {
  id: number;
}

interface Repo<T> {
  findOne(query: { where: Record<string, unknown> }): Promise<T | null>;
  save(data: Record<string, unknown>): Promise<T>;
}

@Injectable()
export class RatingsService {
  constructor(
    private transactionRepo: Repo<Transaction>,
    private ratingRepo: Repo<Rating>,
  ) {}

  async createRating(userId: number, dto: CreateRatingDto) {
    const { transactionId, rating, comment } = dto;

    // 1. Get transaction
    const transaction = await this.transactionRepo.findOne({
      where: { id: transactionId },
    });

    if (!transaction) {
      throw new Error('Transaction not found');
    }

    // 2. Check status
    if (transaction.status !== 'Completed') {
      throw new Error('Transaction not completed');
    }

    // 3. Prevent duplicate
    const existing = await this.ratingRepo.findOne({
      where: { transactionId, reviewerId: userId },
    });

    if (existing) {
      throw new Error('You already rated this transaction');
    }

    // 4. Save rating
    const newRating = await this.ratingRepo.save({
      transactionId,
      reviewerId: userId,
      sellerId: transaction.sellerId,
      rating,
      comment,
    });

    // 5. Update seller average
    this.updateSellerRating(transaction.sellerId, rating);

    return newRating;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private updateSellerRating(_sellerId: number, _rating: number) {
    return;
  }
}
