import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { APP_GUARD } from '@nestjs/core';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { TimeModule } from './time/time.module';
import { LeaveModule } from './leave/leave.module';
import { SchedulingModule } from './scheduling/scheduling.module';
import { PayrollModule } from './payroll/payroll.module';
import { AiModule } from './ai/ai.module';
import { OrganizationModule } from './organization/organization.module';
import { NotificationsModule } from './notifications/notifications.module';
import { SageVipModule } from './sage-vip/sage-vip.module';
import { ReportsModule} from './reports/reports.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { typeOrmConfig } from './config/typeorm.config';
import { RolesGuard } from './auth/guards/roles.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot(typeOrmConfig),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'client', 'dist'),
      exclude: ['/api*', '/auth*', '/time*', '/leave*', '/scheduling*', '/payroll*', '/ai*', '/organization*', '/notifications*', '/sage-vip*', '/reports*', '/dashboard*'],
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
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
