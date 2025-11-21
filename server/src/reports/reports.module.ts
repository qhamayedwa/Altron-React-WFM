import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { TimeEntry } from '../entities/time-entry.entity';
import { LeaveApplication } from '../entities/leave-application.entity';
import { User } from '../entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TimeEntry, LeaveApplication, User])],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}
