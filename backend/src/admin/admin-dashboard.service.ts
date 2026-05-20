import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Post, PostDocument } from '../posts/entities/post.entity';
import {
  TrackItemUser,
  TrackItemUserDocument,
} from '../trackitemuser/schemas/trackitemuser.schema';

@Injectable()
export class AdminDashboardService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    @InjectModel(TrackItemUser.name)
    private trackModel: Model<TrackItemUserDocument>,
  ) {}

  async getDashboardStats() {
    // Run all database counts at the exact same time for maximum performance
    const [totalUsers, activeListings, totalTransactions] = await Promise.all([
      this.userModel.countDocuments(),
      this.postModel.countDocuments(),
      this.trackModel.countDocuments(),
    ]);

    return {
      totalUsers,
      activeListings,
      totalTransactions,
    };
  }
}
