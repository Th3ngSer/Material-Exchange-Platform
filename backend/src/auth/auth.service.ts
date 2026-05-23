import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserDocument } from '../users/schemas/user.schema';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const email = registerDto.email.toLowerCase();
    const existingUser = await this.usersService.findByEmail(email);

    if (existingUser) {
      throw new ConflictException('Email is already registered');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const user = await this.usersService.createUser({
      email,
      password: hashedPassword,
      name: registerDto.name,
    });

    return this.buildAuthResponse(user);
  }

  async login(loginDto: LoginDto) {
    const email = loginDto.email.toLowerCase();
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return this.buildAuthResponse(user);
  }

  async updateProfile(userId: string, updateDto: UpdateProfileDto) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const email = updateDto.email?.toLowerCase();
    if (email && email !== user.email) {
      const existingUser = await this.usersService.findByEmail(email);
      if (existingUser && existingUser.id !== userId) {
        throw new ConflictException('Email is already registered');
      }
    }

    const updated = await this.usersService.updateUser(userId, {
      ...updateDto,
      email,
    });

    if (!updated) {
      throw new UnauthorizedException('User not found');
    }

    return this.serializeUser(updated);
  }

  async getProfile(userId: string) {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return this.serializeUser(user);
  }

  private buildAuthResponse(user: UserDocument) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user: this.serializeUser(user),
    };
  }

  private serializeUser(user: UserDocument) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      username: user.username,
      gender: user.gender,
      phone: user.phone,
      nationality: user.nationality,
      birthDate: user.birthDate,
      avatar: user.avatar,
      role: user.role,
      status: user.status,
      listingsCount: user.listingsCount,
      rating: user.rating,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
