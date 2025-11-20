import { Controller, Get, Query, UseGuards, Header } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('reports')
@UseGuards(AuthenticatedGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('time-entries')
  @Roles('Manager', 'Admin', 'Payroll', 'Super User', 'system_super_admin')
  async getTimeEntryReport(
    @Query('start_date') startDate: string,
    @Query('end_date') endDate: string,
    @Query('user_id') userId?: string,
    @Query('department_id') departmentId?: string,
  ) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const parsedUserId = userId ? parseInt(userId, 10) : undefined;
    const parsedDeptId = departmentId ? parseInt(departmentId, 10) : undefined;

    return this.reportsService.getTimeEntryReport(start, end, parsedUserId, parsedDeptId);
  }

  @Get('time-entries/csv')
  @Roles('Manager', 'Admin', 'Payroll', 'Super User', 'system_super_admin')
  @Header('Content-Type', 'text/csv')
  @Header('Content-Disposition', 'attachment; filename="time-entry-report.csv"')
  async getTimeEntryReportCSV(
    @Query('start_date') startDate: string,
    @Query('end_date') endDate: string,
    @Query('user_id') userId?: string,
    @Query('department_id') departmentId?: string,
  ) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const parsedUserId = userId ? parseInt(userId, 10) : undefined;
    const parsedDeptId = departmentId ? parseInt(departmentId, 10) : undefined;

    const report = await this.reportsService.getTimeEntryReport(start, end, parsedUserId, parsedDeptId);
    const headers = ['user_id', 'username', 'clock_in_time', 'clock_out_time', 'total_hours', 'status'];
    return this.reportsService.convertToCSV(report.entries, headers);
  }

  @Get('leave')
  @Roles('Manager', 'Admin', 'HR', 'Super User', 'system_super_admin')
  async getLeaveReport(
    @Query('start_date') startDate: string,
    @Query('end_date') endDate: string,
    @Query('user_id') userId?: string,
    @Query('department_id') departmentId?: string,
  ) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const parsedUserId = userId ? parseInt(userId, 10) : undefined;
    const parsedDeptId = departmentId ? parseInt(departmentId, 10) : undefined;

    return this.reportsService.getLeaveReport(start, end, parsedUserId, parsedDeptId);
  }

  @Get('leave/csv')
  @Roles('Manager', 'Admin', 'HR', 'Super User', 'system_super_admin')
  @Header('Content-Type', 'text/csv')
  @Header('Content-Disposition', 'attachment; filename="leave-report.csv"')
  async getLeaveReportCSV(
    @Query('start_date') startDate: string,
    @Query('end_date') endDate: string,
    @Query('user_id') userId?: string,
    @Query('department_id') departmentId?: string,
  ) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const parsedUserId = userId ? parseInt(userId, 10) : undefined;
    const parsedDeptId = departmentId ? parseInt(departmentId, 10) : undefined;

    const report = await this.reportsService.getLeaveReport(start, end, parsedUserId, parsedDeptId);
    const headers = ['user_id', 'username', 'start_date', 'end_date', 'status', 'reason'];
    return this.reportsService.convertToCSV(report.applications, headers);
  }

  @Get('attendance')
  @Roles('Manager', 'Admin', 'HR', 'Super User', 'system_super_admin')
  async getAttendanceReport(
    @Query('start_date') startDate: string,
    @Query('end_date') endDate: string,
    @Query('department_id') departmentId?: string,
  ) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const parsedDeptId = departmentId ? parseInt(departmentId, 10) : undefined;

    return this.reportsService.getAttendanceReport(start, end, parsedDeptId);
  }

  @Get('payroll-summary')
  @Roles('Admin', 'Payroll', 'Super User', 'system_super_admin')
  async getPayrollSummary(
    @Query('start_date') startDate: string,
    @Query('end_date') endDate: string,
    @Query('department_id') departmentId?: string,
  ) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const parsedDeptId = departmentId ? parseInt(departmentId, 10) : undefined;

    return this.reportsService.getPayrollSummary(start, end, parsedDeptId);
  }
}
