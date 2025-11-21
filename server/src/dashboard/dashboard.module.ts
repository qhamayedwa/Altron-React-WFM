import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { DashboardConfig } from '../entities/dashboard-config.entity';
import { User } from '../entities/user.entity';
import { TimeEntry } from '../entities/time-entry.entity';
import { LeaveApplication } from '../entities/leave-application.entity';
import { LeaveBalance } from '../entities/leave-balance.entity';
import { Department } from '../entities/department.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DashboardConfig,
      User,
      TimeEntry,
      LeaveApplication,
      LeaveBalance,
      Department,
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
