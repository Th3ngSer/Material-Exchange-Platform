import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  User,
  UserDocument,
  UserRole,
  UserStatus,
} from './schemas/user.schema';

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

export interface AdminUserSummary {
  id: string;
  name?: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  listingsCount: number;
  rating: number;
  createdAt?: Date;
}

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

  async findAllForAdmin(): Promise<AdminUserSummary[]> {
    const users = await this.userModel
      .find()
      .select('name email role status listingsCount rating createdAt')
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    return users.map((user) => ({
      id: String(user._id),
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      listingsCount: user.listingsCount ?? 0,
      rating: user.rating ?? 0,
      createdAt: user.createdAt,
    }));
  }
}
