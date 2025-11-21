import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SageVipController } from './sage-vip.controller';
import { SageVipService } from './sage-vip.service';
import { TimeEntry } from '../entities/time-entry.entity';
import { LeaveApplication } from '../entities/leave-application.entity';
import { User } from '../entities/user.entity';
import { PayCode } from '../entities/pay-code.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, TimeEntry, LeaveApplication, PayCode])],
  controllers: [SageVipController],
  providers: [SageVipService],
  exports: [SageVipService],
})
export class SageVipModule {}
