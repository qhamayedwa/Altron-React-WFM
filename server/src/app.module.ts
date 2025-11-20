import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { TimeModule } from './time/time.module';
import { PrismaService } from './prisma/prisma.service';
import { LeaveModule } from './leave/leave.module';
import { SchedulingModule } from './scheduling/scheduling.module';
import { PayrollModule } from './payroll/payroll.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    AuthModule,
    TimeModule,
    LeaveModule,
    SchedulingModule,
    PayrollModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
