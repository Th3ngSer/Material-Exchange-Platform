import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument, UserRole } from './schemas/user.schema';

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

    const [total, data] = await Promise.all([
      this.userModel.countDocuments(filter).exec(),
      this.userModel
        .find(filter)
        .select('name email role status listingsCount rating createdAt')
        .sort({ createdAt: -1 })
        .skip((safePage - 1) * safeLimit)
        .limit(safeLimit)
        .lean()
        .exec(),
    ]);

    const lastPage = Math.max(1, Math.ceil(total / safeLimit));

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
