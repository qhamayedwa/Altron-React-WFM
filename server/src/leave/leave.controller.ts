import { Controller, Post, Get, Put, Body, Query, Param, UseGuards, Req, ParseIntPipe } from '@nestjs/common';
import { LeaveService } from './leave.service';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateLeaveApplicationDto } from './dto/create-leave-application.dto';
import { UpdateLeaveApplicationDto } from './dto/update-leave-application.dto';
import { GetLeaveApplicationsDto } from './dto/get-leave-applications.dto';
import { CreateLeaveTypeDto } from './dto/create-leave-type.dto';
import { UpdateLeaveTypeDto } from './dto/update-leave-type.dto';
import { AdjustLeaveBalanceDto } from './dto/adjust-leave-balance.dto';

@Controller('leave')
@UseGuards(AuthenticatedGuard, RolesGuard)
export class LeaveController {
  constructor(private readonly leaveService: LeaveService) {}

  @Get('my-balances')
  async getMyLeaveBalances(@Req() req: any) {
    const result = await this.leaveService.getMyLeaveBalances(req.user.id);
    
    return {
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('applications')
  async createLeaveApplication(@Req() req: any, @Body() dto: CreateLeaveApplicationDto) {
    const isPrivileged = req.user.user_roles?.some(
      (ur: any) => ur.roles?.name === 'Super User' || ur.roles?.name === 'system_super_admin' || ur.roles?.name === 'Admin'
    );
    
    const managedDepartmentIds = await this.leaveService.getManagedDepartmentIds(req.user.id);
    
    const result = await this.leaveService.createLeaveApplication(
      req.user.id,
      dto,
      req.user.id,
      isPrivileged,
      managedDepartmentIds
    );
    
    return {
      success: true,
      data: result,
      message: dto.auto_approve ? 'Leave application approved' : 'Leave application submitted successfully',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('my-applications')
  async getMyApplications(@Req() req: any, @Query() dto: GetLeaveApplicationsDto) {
    const result = await this.leaveService.getMyApplications(req.user.id, dto);
    
    return {
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('team-applications')
  @Roles('Manager', 'Super User', 'system_super_admin', 'Admin')
  async getTeamApplications(@Req() req: any, @Query() dto: GetLeaveApplicationsDto) {
    const isPrivileged = req.user.user_roles?.some(
      (ur: any) => ur.roles?.name === 'Super User' || ur.roles?.name === 'system_super_admin' || ur.roles?.name === 'Admin'
    );
    
    const managedDepartmentIds = await this.leaveService.getManagedDepartmentIds(req.user.id);
    
    const result = await this.leaveService.getTeamApplications(
      req.user.id,
      dto,
      isPrivileged,
      managedDepartmentIds
    );
    
    return {
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('applications/:id/approve')
  @Roles('Manager', 'Super User', 'system_super_admin', 'Admin')
  async approveApplication(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateLeaveApplicationDto
  ) {
    const isPrivileged = req.user.user_roles?.some(
      (ur: any) => ur.roles?.name === 'Super User' || ur.roles?.name === 'system_super_admin' || ur.roles?.name === 'Admin'
    );
    
    const managedDepartmentIds = await this.leaveService.getManagedDepartmentIds(req.user.id);
    
    const result = await this.leaveService.approveApplication(
      id,
      req.user.id,
      dto,
      isPrivileged,
      managedDepartmentIds
    );
    
    return {
      success: true,
      data: result,
      message: 'Leave application approved successfully',
      timestamp: new Date().toISOString(),
    };
  }

  @Post('applications/:id/reject')
  @Roles('Manager', 'Super User', 'system_super_admin', 'Admin')
  async rejectApplication(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateLeaveApplicationDto
  ) {
    const isPrivileged = req.user.user_roles?.some(
      (ur: any) => ur.roles?.name === 'Super User' || ur.roles?.name === 'system_super_admin' || ur.roles?.name === 'Admin'
    );
    
    const managedDepartmentIds = await this.leaveService.getManagedDepartmentIds(req.user.id);
    
    const result = await this.leaveService.rejectApplication(
      id,
      req.user.id,
      dto,
      isPrivileged,
      managedDepartmentIds
    );
    
    return {
      success: true,
      data: result,
      message: 'Leave application rejected',
      timestamp: new Date().toISOString(),
    };
  }

  @Post('applications/:id/cancel')
  async cancelApplication(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    const result = await this.leaveService.cancelApplication(id, req.user.id);
    
    return {
      success: true,
      data: result,
      message: 'Leave application cancelled successfully',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('types')
  async getLeaveTypes() {
    const result = await this.leaveService.getLeaveTypes();
    
    return {
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('types/:id')
  @Roles('Admin', 'Super User', 'system_super_admin')
  async getLeaveType(@Param('id', ParseIntPipe) id: number) {
    const result = await this.leaveService.getLeaveType(id);
    
    return {
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('types')
  @Roles('Admin', 'Super User', 'system_super_admin')
  async createLeaveType(@Body() dto: CreateLeaveTypeDto) {
    const result = await this.leaveService.createLeaveType(dto);
    
    return {
      success: true,
      data: result,
      message: 'Leave type created successfully',
      timestamp: new Date().toISOString(),
    };
  }

  @Put('types/:id')
  @Roles('Admin', 'Super User', 'system_super_admin')
  async updateLeaveType(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateLeaveTypeDto) {
    const result = await this.leaveService.updateLeaveType(id, dto);
    
    return {
      success: true,
      data: result,
      message: 'Leave type updated successfully',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('balances')
  @Roles('Admin', 'Super User', 'system_super_admin')
  async getLeaveBalances(
    @Query('year') year?: string,
    @Query('user_id') userId?: string,
    @Query('leave_type_id') leaveTypeId?: string
  ) {
    const parsedYear = year ? parseInt(year, 10) : undefined;
    const parsedUserId = userId ? parseInt(userId, 10) : undefined;
    const parsedLeaveTypeId = leaveTypeId ? parseInt(leaveTypeId, 10) : undefined;
    
    const result = await this.leaveService.getLeaveBalances(parsedYear, parsedUserId, parsedLeaveTypeId);
    
    return {
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('balances/:id/adjust')
  @Roles('Admin', 'Super User', 'system_super_admin')
  async adjustLeaveBalance(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AdjustLeaveBalanceDto
  ) {
    const result = await this.leaveService.adjustLeaveBalance(id, dto);
    
    return {
      success: true,
      data: result,
      message: 'Leave balance adjusted successfully',
      timestamp: new Date().toISOString(),
    };
  }

  @Post('accrual/run')
  @Roles('Super User', 'system_super_admin')
  async runAccrual() {
    const result = await this.leaveService.runAccrual();
    
    return {
      success: true,
      data: result,
      message: `Leave accrual completed successfully. Processed ${result.users_processed} user records.`,
      timestamp: new Date().toISOString(),
    };
  }
}
