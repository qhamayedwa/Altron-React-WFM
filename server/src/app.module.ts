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
import { AiModule } from './ai/ai.module';
import { OrganizationModule } from './organization/organization.module';
import { NotificationsModule } from './notifications/notifications.module';
import { SageVipModule } from './sage-vip/sage-vip.module';
import { ReportsModule } from './reports/reports.module';
import { DashboardModule } from './dashboard/dashboard.module';

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
    AiModule,
    OrganizationModule,
    NotificationsModule,
    SageVipModule,
    ReportsModule,
    DashboardModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
