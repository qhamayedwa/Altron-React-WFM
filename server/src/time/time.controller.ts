import { Controller, Post, Get, Body, Query, UseGuards, Req } from '@nestjs/common';
import { TimeService } from './time.service';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ClockInDto } from './dto/clock-in.dto';
import { ClockOutDto } from './dto/clock-out.dto';
import { GetTimeEntriesDto } from './dto/get-time-entries.dto';
import { ApproveTimeEntryDto } from './dto/approve-time-entry.dto';

@Controller('time')
@UseGuards(AuthenticatedGuard, RolesGuard)
export class TimeController {
  constructor(private readonly timeService: TimeService) {}

  @Post('clock-in')
  async clockIn(@Req() req: any, @Body() dto: ClockInDto) {
    const result = await this.timeService.clockIn(req.user.id, dto);
    return {
      success: true,
      data: result,
      message: 'Successfully clocked in',
      timestamp: new Date().toISOString(),
    };
  }

  @Post('clock-out')
  async clockOut(@Req() req: any, @Body() dto: ClockOutDto) {
    const result = await this.timeService.clockOut(req.user.id, dto);
    return {
      success: true,
      data: result,
      message: 'Successfully clocked out',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('current-status')
  async getCurrentStatus(@Req() req: any) {
    const result = await this.timeService.getCurrentStatus(req.user.id);
    return {
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('entries')
  async getTimeEntries(@Req() req: any, @Query() dto: GetTimeEntriesDto) {
    const isSuperUser = req.user.user_roles?.some(
      (ur: any) => ur.roles?.name === 'Super User' || ur.roles?.name === 'system_super_admin' || ur.roles?.name === 'Admin'
    );
    
    const managedDepartmentIds = await this.timeService.getManagedDepartmentIds(req.user.id);
    
    const result = await this.timeService.getTimeEntries(
      req.user.id,
      dto,
      isSuperUser,
      managedDepartmentIds
    );
    
    return {
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('pending-approvals')
  @Roles('Manager', 'Super User', 'system_super_admin', 'Admin')
  async getPendingApprovals(@Req() req: any) {
    const isSuperUser = req.user.user_roles?.some(
      (ur: any) => ur.roles?.name === 'Super User' || ur.roles?.name === 'system_super_admin' || ur.roles?.name === 'Admin'
    );
    
    const managedDepartmentIds = await this.timeService.getManagedDepartmentIds(req.user.id);
    
    const result = await this.timeService.getPendingApprovals(
      req.user.id,
      isSuperUser,
      managedDepartmentIds
    );
    
    return {
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('approve')
  @Roles('Manager', 'Super User', 'system_super_admin', 'Admin')
  async approveTimeEntry(@Req() req: any, @Body() dto: ApproveTimeEntryDto) {
    const isSuperUser = req.user.user_roles?.some(
      (ur: any) => ur.roles?.name === 'Super User' || ur.roles?.name === 'system_super_admin' || ur.roles?.name === 'Admin'
    );
    
    const managedDepartmentIds = await this.timeService.getManagedDepartmentIds(req.user.id);
    
    const result = await this.timeService.approveTimeEntry(
      dto.entry_id,
      req.user.id,
      isSuperUser,
      managedDepartmentIds,
      dto.notes
    );
    
    return {
      success: true,
      data: result,
      message: 'Time entry approved successfully',
      timestamp: new Date().toISOString(),
    };
  }

  @Post('reject')
  @Roles('Manager', 'Super User', 'system_super_admin', 'Admin')
  async rejectTimeEntry(@Req() req: any, @Body() dto: ApproveTimeEntryDto) {
    const isSuperUser = req.user.user_roles?.some(
      (ur: any) => ur.roles?.name === 'Super User' || ur.roles?.name === 'system_super_admin' || ur.roles?.name === 'Admin'
    );
    
    const managedDepartmentIds = await this.timeService.getManagedDepartmentIds(req.user.id);
    
    const result = await this.timeService.rejectTimeEntry(
      dto.entry_id,
      req.user.id,
      isSuperUser,
      managedDepartmentIds,
      dto.notes
    );
    
    return {
      success: true,
      data: result,
      message: 'Time entry rejected',
      timestamp: new Date().toISOString(),
    };
  }
}
