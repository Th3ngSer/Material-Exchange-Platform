import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Rating, RatingDocument } from './schemas/rating.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { UsersService } from '../users/users.service';

export interface CreateRatingDto {
  userId: string; // user being rated
  raterId: string; // user giving the rating
  score: number; // 1-5
  comment?: string;
  tags?: string[];
  raterName?: string;
  raterAvatar?: string;
}

export interface RatingStats {
  averageScore: number;
  totalRatings: number;
  distribution: {
    [key: number]: number; // count of each rating (1-5)
  };
  recentRatings: RatingDocument[];
}

@Injectable()
export class RatingsService {
  constructor(
    @InjectModel(Rating.name)
    private readonly ratingModel: Model<RatingDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    private readonly usersService: UsersService,
  ) {}

  // CREATE OR UPDATE A RATING
  async createOrUpdateRating(data: CreateRatingDto): Promise<RatingDocument> {
    const { userId, raterId, score, comment, tags, raterName, raterAvatar } =
      data;

    // Check if rating already exists
    const existing = await this.ratingModel.findOne({
      userId,
      raterId,
    });

    let rating: RatingDocument;

    if (existing) {
      // Update existing rating
      existing.score = score;
      existing.comment = comment || existing.comment;
      existing.tags = tags || existing.tags;
      rating = await existing.save();
    } else {
      // Create new rating
      rating = await this.ratingModel.create({
        userId,
        raterId,
        score,
        comment,
        tags,
        raterName,
        raterAvatar,
      });
    }

    // Update user's average rating
    await this.updateUserAverageRating(userId);

    return rating;
  }

  // GET ALL RATINGS FOR A USER
  async getRatingsForUser(userId: string): Promise<RatingDocument[]> {
    return this.ratingModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .exec();
  }

  // GET RATING STATISTICS FOR A USER
  async getRatingStats(userId: string): Promise<RatingStats> {
    const ratings = await this.getRatingsForUser(userId);

    if (ratings.length === 0) {
      return {
        averageScore: 0,
        totalRatings: 0,
        distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        recentRatings: [],
      };
    }

    // Calculate average
    const totalScore = ratings.reduce((sum, r) => sum + r.score, 0);
    const averageScore = parseFloat((totalScore / ratings.length).toFixed(2));

    // Build distribution
    const distribution: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    ratings.forEach((r) => {
      distribution[r.score]++;
    });

    // Get up to 10 most recent (so UI can scroll through more recent reviews)
    const recentRatings = ratings.slice(0, Math.min(10, ratings.length));

    return {
      averageScore,
      totalRatings: ratings.length,
      distribution,
      recentRatings,
    };
  }

  // UPDATE USER'S AVERAGE RATING
  private async updateUserAverageRating(userId: string) {
    const ratings = await this.getRatingsForUser(userId);

    const averageScore = ratings.length === 0 
      ? 0 
      : parseFloat((ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length).toFixed(2));

    // Use User model to update rating field
    await this.userModel.findByIdAndUpdate(
      userId,
      { rating: averageScore },
      { new: true },
    ).exec();
  }

  // UPDATE RATER AVATAR IN EXISTING RATINGS
  async updateRaterAvatar(
    raterId: string,
    raterAvatar: string,
  ): Promise<{ modifiedCount: number }> {
    const result = await this.ratingModel.updateMany(
      { raterId },
      { $set: { raterAvatar } },
    );
    return { modifiedCount: result.modifiedCount };
  }

  // CHECK IF USER CAN RATE ANOTHER USER
  async canUserRate(userId: string, targetUserId: string): Promise<boolean> {
    if (userId === targetUserId) {
      return false; // Can't rate yourself
    }

    // In a real app, you'd check if they've bought from this user
    // For now, any logged-in user can rate
    return true;
  }

  // GET RATER INFO (name, avatar) FOR STORING IN RATING
  async getRaterInfo(userId: string): Promise<{ name?: string; avatar?: string } | null> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      return null;
    }
    return {
      name: user.name,
      avatar: user.avatar,
    };
  }

  // DELETE A RATING
  async deleteRating(ratingId: string, raterId: string): Promise<boolean> {
    const rating = await this.ratingModel.findById(ratingId);

    if (!rating) {
      return false;
    }

    // Only the rater can delete their rating
    if (String(rating.raterId) !== raterId) {
      return false;
    }

    await this.ratingModel.findByIdAndDelete(ratingId);

    // Update user's average rating
    await this.updateUserAverageRating(String(rating.userId));

    return true;
  }
}
