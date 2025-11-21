import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PayrollController } from './payroll.controller';
import { PayrollService } from './payroll.service';
import { PayCalculation } from '../entities/pay-calculation.entity';
import { PayCode } from '../entities/pay-code.entity';
import { PayRule } from '../entities/pay-rule.entity';
import { TimeEntry } from '../entities/time-entry.entity';
import { User } from '../entities/user.entity';
import { UserRole } from '../entities/user-role.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PayCalculation,
      PayCode,
      PayRule,
      TimeEntry,
      User,
      UserRole,
    ]),
  ],
  controllers: [PayrollController],
  providers: [PayrollService],
  exports: [PayrollService],
})
export class PayrollModule {}
