import { Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { SageVipService } from './sage-vip.service';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('sage-vip')
@UseGuards(AuthenticatedGuard)
export class SageVipController {
  constructor(private readonly sageVipService: SageVipService) {}

  @Get('status')
  @Roles('Super User', 'Admin', 'Payroll', 'system_super_admin')
  async getStatus() {
    return this.sageVipService.getStatus();
  }

  @Post('test-connection')
  @Roles('Super User', 'Admin', 'system_super_admin')
  async testConnection() {
    return this.sageVipService.testConnection();
  }

  @Post('sync-employees')
  @Roles('Super User', 'Admin', 'HR', 'system_super_admin')
  async syncEmployees() {
    return this.sageVipService.syncEmployees();
  }

  @Post('push-timesheets')
  @Roles('Super User', 'Admin', 'Payroll', 'system_super_admin')
  async pushTimesheets(
    @Query('start_date') startDate: string,
    @Query('end_date') endDate: string,
  ) {
    const start = startDate ? new Date(startDate) : new Date();
    const end = endDate ? new Date(endDate) : new Date();
    return this.sageVipService.pushTimesheets(start, end);
  }

  @Post('transfer-leave')
  @Roles('Super User', 'Admin', 'HR', 'Payroll', 'system_super_admin')
  async transferLeave(
    @Query('start_date') startDate: string,
    @Query('end_date') endDate: string,
  ) {
    const start = startDate ? new Date(startDate) : new Date();
    const end = endDate ? new Date(endDate) : new Date();
    return this.sageVipService.transferLeave(start, end);
  }

  @Get('sync-history')
  @Roles('Super User', 'Admin', 'Payroll', 'system_super_admin')
  async getSyncHistory(@Query('limit') limit?: string) {
    const parsedLimit = limit ? parseInt(limit, 10) : 20;
    return this.sageVipService.getSyncHistory(parsedLimit);
  }
}
