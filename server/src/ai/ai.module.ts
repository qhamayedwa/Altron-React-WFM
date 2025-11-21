import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { AiFallbackService } from './ai-fallback.service';
import { TimeEntry } from '../entities/time-entry.entity';
import { LeaveApplication } from '../entities/leave-application.entity';
import { Schedule } from '../entities/schedule.entity';
import { PayCalculation } from '../entities/pay-calculation.entity';
import { User } from '../entities/user.entity';
import { Department } from '../entities/department.entity';
import { ShiftType } from '../entities/shift-type.entity';
import { Role } from '../entities/role.entity';
import { UserRole } from '../entities/user-role.entity';
import { AuthModule } from '../auth/auth.module';
import { RolesGuard } from '../auth/guards/roles.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TimeEntry,
      LeaveApplication,
      Schedule,
      PayCalculation,
      User,
      Department,
      ShiftType,
      Role,
      UserRole,
    ]),
    AuthModule,
  ],
  controllers: [AiController],
  providers: [AiService, AiFallbackService],
  exports: [AiService, AiFallbackService],
})
export class AiModule {}
