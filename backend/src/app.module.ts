import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';
import { TrackitemuserModule } from './trackitemuser/trackitemuser.module';

const databaseImports =
  process.env.NODE_ENV === 'test'
    ? []
    : [
      MongooseModule.forRootAsync({
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          uri: configService.get<string>(
            'MONGODB_URI',
            'mongodb://127.0.0.1:27018/material_xchange?directConnection=true',
          ),
        }),
      }),
    ];

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
          'mongodb://127.0.0.1:27017/material_xchange';

        console.log('🔥 Mongo URI:', uri);

        return {
          uri,
        };
      },
    }),

    AuthModule,
    ChatModule,
    TrackitemuserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
