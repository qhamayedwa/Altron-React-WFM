import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { TimeEntry } from '../entities/time-entry.entity';
import { LeaveApplication } from '../entities/leave-application.entity';
import { PayCalculation } from '../entities/pay-calculation.entity';
import { User } from '../entities/user.entity';
import { Department } from '../entities/department.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TimeEntry,
      LeaveApplication,
      PayCalculation,
      User,
      Department,
    ]),
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}
