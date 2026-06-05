import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'   
import { JwtModule } from '@nestjs/jwt'
import { NotificationController } from '../controller/notificationController'
import { NotificationService }    from '../service/notificationService'
import { Notification, NotificationSchema } from '../schemas/notification.schema'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Notification.name, schema: NotificationSchema },
    ]),
    JwtModule.registerAsync({
  useFactory: () => ({
    secret: process.env.JWT_SECRET ?? 'dev_secret_change_me',
    signOptions: { expiresIn: '7d' },  
  }),
}),
  ],
  controllers: [NotificationController],
  providers:   [NotificationService],
  exports:     [NotificationService],
})
export class NotificationModule {}