import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeaveController } from './leave.controller';
import { LeaveService } from './leave.service';
import { LeaveApplication } from '../entities/leave-application.entity';
import { LeaveBalance } from '../entities/leave-balance.entity';
import { LeaveType } from '../entities/leave-type.entity';
import { User } from '../entities/user.entity';
import { Department } from '../entities/department.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([LeaveApplication, LeaveBalance, LeaveType, User, Department]),
    AuthModule,
  ],
  controllers: [LeaveController],
  providers: [LeaveService],
  exports: [LeaveService],
})
export class LeaveModule {}
