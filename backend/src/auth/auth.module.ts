import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtSignOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module';
import { PostsModule } from '../posts/posts.module';
import { RatingsModule } from '../ratings/ratings.module';
import { ChatModule } from '../chat/chat.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AdminDashboardModule } from '../admin/admin-dashboard.module';

@Module({
  imports: [
    ConfigModule,
    UsersModule,
    PostsModule,
    RatingsModule,
    AdminDashboardModule,

    // ChatModule provides ChatGateway which AuthController injects to emit events
    forwardRef(() => ChatModule),

    // 🔥 IMPORTANT
    PassportModule.register({ defaultStrategy: 'jwt' }),

    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const expiresIn = configService.get<string>('JWT_EXPIRES_IN', '1d');

        return {
          secret: configService.get<string>(
            'JWT_SECRET',
            'dev_secret_change_me',
          ),
          signOptions: {
            expiresIn: expiresIn as JwtSignOptions['expiresIn'],
          },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
