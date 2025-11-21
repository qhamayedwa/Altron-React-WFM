import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SageVipController } from './sage-vip.controller';
import { SageVipService } from './sage-vip.service';
import { TimeEntry } from '../entities/time-entry.entity';
import { LeaveApplication } from '../entities/leave-application.entity';
import { User } from '../entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TimeEntry, LeaveApplication, User])],
  controllers: [SageVipController],
  providers: [SageVipService],
  exports: [SageVipService],
})
export class SageVipModule {}
