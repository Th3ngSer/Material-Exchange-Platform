import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument, UserRole } from './schemas/user.schema';
import { Post, PostDocument } from '../posts/entities/post.entity';

export interface CreateUserInput {
  email: string;
  password: string;
  name?: string;
  role?: UserRole;
  username?: string;
  gender?: string;
  phone?: string;
  nationality?: string;
  birthDate?: string;
}

export type UpdateUserInput = Partial<Omit<CreateUserInput, 'password'>>;

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Post.name) private readonly postModel: Model<PostDocument>,
  ) {}

  createUser(input: CreateUserInput): Promise<UserDocument> {
    const created = new this.userModel(input);
    return created.save();
  }

  findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email: email.toLowerCase() }).exec();
  }

  findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  // Return basic info for all users except the provided userId
  async findAllExcept(userId: string): Promise<any[]> {
    return this.userModel
      .find({ _id: { $ne: userId } })
      .select('name email username role createdAt')
      .lean()
      .exec();
  }

  updateUser(
    userId: string,
    update: UpdateUserInput,
  ): Promise<UserDocument | null> {
    return this.userModel
      .findByIdAndUpdate(userId, update, { new: true })
      .exec();
  }

  async findAllForAdmin(
    page = 1,
    limit = 10,
    search?: string,
  ): Promise<{
    data: Array<{
      _id: string;
      name?: string;
      email: string;
      role: UserRole;
      status: string;
      listingsCount: number;
      rating: number;
      createdAt?: Date;
    }>;
    meta: { total: number; page: number; lastPage: number };
  }> {
    const safePage = Math.max(1, page);
    const safeLimit = Math.min(Math.max(1, limit), 100);
    const filter = search
      ? {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
          ],
        }
      : {};

    const total = await this.userModel.countDocuments(filter).exec();
    const lastPage = Math.max(1, Math.ceil(total / safeLimit));

    // Fetch users with pagination
    const users = await this.userModel
      .find(filter)
      .select('name email role status rating createdAt')
      .sort({ createdAt: -1 })
      .skip((safePage - 1) * safeLimit)
      .limit(safeLimit)
      .lean()
      .exec();

    // Get listings count for each user from the posts collection
    const userIds = users.map((u) => String(u._id));
    const listingCounts = await this.postModel.aggregate<{
      _id: string;
      count: number;
    }>([
      { $match: { ownerId: { $in: userIds } } },
      { $group: { _id: '$ownerId', count: { $sum: 1 } } },
    ]);

    // Build a quick lookup map: ownerId -> count
    const countMap = new Map<string, number>();
    for (const entry of listingCounts) {
      countMap.set(String(entry._id), entry.count);
    }

    const data = users.map((u) => ({
      _id: String(u._id),
      name: u.name,
      email: u.email,
      role: u.role ?? UserRole.USER,
      status: u.status ?? 'active',
      listingsCount: countMap.get(String(u._id)) ?? 0,
      rating: u.rating ?? 0,
      createdAt: u.createdAt,
    }));

    return {
      data,
      meta: { total, page: safePage, lastPage },
    };
  }

  async removeById(userId: string): Promise<{ message: string }> {
    const removed = await this.userModel.findByIdAndDelete(userId).exec();
    if (!removed) {
      return { message: 'User not found' };
    }

    return { message: 'User deleted successfully' };
  }
}
