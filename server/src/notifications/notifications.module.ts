import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { Notification } from '../entities/notification.entity';
import { NotificationType } from '../entities/notification-type.entity';
import { NotificationPreference } from '../entities/notification-preference.entity';
import { User } from '../entities/user.entity';
import { Department } from '../entities/department.entity';
import { LeaveApplication } from '../entities/leave-application.entity';
import { LeaveType } from '../entities/leave-type.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Notification,
      NotificationType,
      NotificationPreference,
      User,
      Department,
      LeaveApplication,
      LeaveType,
    ]),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
