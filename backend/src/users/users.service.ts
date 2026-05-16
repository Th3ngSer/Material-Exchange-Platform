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

export type UpdateUserInput = Partial<Omit<CreateUserInput, 'password'>>

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

  findAllForAdmin() {
    return this.userModel
      .find()
      .select('name email role status listingsCount rating createdAt')
      .sort({ createdAt: -1 })
      .lean()
      .exec();
  }
}
