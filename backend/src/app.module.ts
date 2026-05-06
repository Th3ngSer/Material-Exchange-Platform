import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
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
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ...databaseImports,
    AuthModule,
    TrackitemuserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
