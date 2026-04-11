import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';

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
            'mongodb://localhost:27017/material_xchange?replicaSet=rs0',
          ),
        }),
      }),
    ];

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ...databaseImports,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
