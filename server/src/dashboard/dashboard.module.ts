import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { TimeEntry } from '../entities/time-entry.entity';
import { LeaveApplication } from '../entities/leave-application.entity';
import { LeaveBalance } from '../entities/leave-balance.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TimeEntry, LeaveApplication, LeaveBalance])],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
