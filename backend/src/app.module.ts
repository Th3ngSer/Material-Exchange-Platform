import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';
import { TrackitemuserModule } from './trackitemuser/trackitemuser.module';
import { UsersModule } from './users/users.module';
import { AdminDashboardModule } from './admin/admin-dashboard.module';
import { TransactionsModule } from './transactions/transactions.module';
import { PostsModule } from './posts/posts.module';
import { ReportsModule } from './reports/reports.module';

@Module({
  imports: [
    // Load .env globally
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // MongoDB connection
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const uri =
          config.get<string>('MONGODB_URI') ||
          'mongodb://127.0.0.1:27017/material_xchange?directConnection=true';

        console.log('🔥 Mongo URI:', uri);

        return {
          uri,
        };
      },
    }),

    // Atlas connection (keep commented for later use).
    // MongooseModule.forRoot(
    //   process.env.MONGODB_URI ||
    //     'mongodb+srv://Akainu_user:<Akainu1234>@material-exchange-platf.ahheacd.mongodb.net/?appName=Material-Exchange-Platform',
    // ),

    AuthModule,
    ChatModule,
    PostsModule,
    TrackitemuserModule,
    UsersModule,
    AdminDashboardModule,
    TransactionsModule,
    ReportsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
