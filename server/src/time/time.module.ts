import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TimeController } from './time.controller';
import { TimeService } from './time.service';
import { TimeEntry } from '../entities/time-entry.entity';
import { Department } from '../entities/department.entity';
import { User } from '../entities/user.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TimeEntry, Department, User]),
    AuthModule,
  ],
  controllers: [TimeController],
  providers: [TimeService],
  exports: [TimeService],
})
export class TimeModule {}
