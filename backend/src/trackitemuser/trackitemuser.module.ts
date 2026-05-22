import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { TrackitemuserController } from './trackitemuser.controller';
import { TrackitemuserService } from './trackitemuser.service';

import {
  TrackItemUser,
  TrackItemUserSchema,
} from './schemas/trackitemuser.schema';
import { Counter, CounterSchema } from './schemas/counter.schema';
import { TransactionsModule } from '../transactions/transactions.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TrackItemUser.name, schema: TrackItemUserSchema },
      { name: Counter.name, schema: CounterSchema },
    ]),
    TransactionsModule,
  ],
  controllers: [TrackitemuserController],
  providers: [TrackitemuserService],
})
export class TrackitemuserModule {}
