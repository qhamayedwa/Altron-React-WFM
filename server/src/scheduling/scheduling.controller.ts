import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { SchedulingService } from './scheduling.service';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateShiftTypeDto } from './dto/create-shift-type.dto';
import { UpdateShiftTypeDto } from './dto/update-shift-type.dto';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { CheckConflictsDto } from './dto/check-conflicts.dto';

@Controller('scheduling')
@UseGuards(AuthenticatedGuard, RolesGuard)
export class SchedulingController {
  constructor(private readonly schedulingService: SchedulingService) {}

  @Post('shift-types')
  @Roles('Manager', 'Admin', 'Super User', 'system_super_admin')
  async createShiftType(@Body() dto: CreateShiftTypeDto) {
    const result = await this.schedulingService.createShiftType(dto);
    
    return {
      success: true,
      data: result,
      message: 'Shift type created successfully',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('shift-types')
  @Roles('Manager', 'Admin', 'Super User', 'system_super_admin', 'Employee')
  async getShiftTypes(@Query('include_inactive') includeInactive?: string) {
    const activeOnly = includeInactive !== 'true';
    const result = await this.schedulingService.getShiftTypes(activeOnly);
    
    return {
      success: true,
      data: result,
      message: 'Shift types retrieved successfully',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('shift-types/:id')
  @Roles('Manager', 'Admin', 'Super User', 'system_super_admin')
  async getShiftType(@Param('id') id: string) {
    const result = await this.schedulingService.getShiftType(parseInt(id, 10));
    
    return {
      success: true,
      data: result,
      message: 'Shift type retrieved successfully',
      timestamp: new Date().toISOString(),
    };
  }

  @Patch('shift-types/:id')
  @Roles('Manager', 'Admin', 'Super User', 'system_super_admin')
  async updateShiftType(
    @Param('id') id: string,
    @Body() dto: UpdateShiftTypeDto
  ) {
    const result = await this.schedulingService.updateShiftType(parseInt(id, 10), dto);
    
    return {
      success: true,
      data: result,
      message: 'Shift type updated successfully',
      timestamp: new Date().toISOString(),
    };
  }

  @Delete('shift-types/:id')
  @Roles('Admin', 'Super User', 'system_super_admin')
  async deleteShiftType(@Param('id') id: string) {
    await this.schedulingService.deleteShiftType(parseInt(id, 10));
    
    return {
      success: true,
      message: 'Shift type deleted successfully',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('schedules')
  @Roles('Manager', 'Admin', 'Super User', 'system_super_admin')
  async getSchedules(
    @Request() req: any,
    @Query('user_id') userId?: string,
    @Query('shift_type_id') shiftTypeId?: string,
    @Query('start_date') startDate?: string,
    @Query('end_date') endDate?: string,
    @Query('status') status?: string
  ) {
    const userRoles = req.user.user_roles?.map((ur: any) => ur.roles.name) || [];
    const isSuperUser = userRoles.includes('Super User') || userRoles.includes('system_super_admin');
    
    const managedDepartmentIds = await this.schedulingService.getManagedDepartmentIds(req.user.id);
    
    const filters = {
      user_id: userId ? parseInt(userId, 10) : undefined,
      shift_type_id: shiftTypeId ? parseInt(shiftTypeId, 10) : undefined,
      start_date: startDate,
      end_date: endDate,
      status,
    };
    
    const result = await this.schedulingService.getSchedules(
      req.user.id,
      isSuperUser,
      managedDepartmentIds,
      filters
    );
    
    return {
      success: true,
      data: result,
      message: 'Schedules retrieved successfully',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('my-schedule')
  async getMySchedule(
    @Request() req: any,
    @Query('start_date') startDate?: string,
    @Query('end_date') endDate?: string
  ) {
    const result = await this.schedulingService.getMySchedule(
      req.user.id,
      startDate,
      endDate
    );
    
    return {
      success: true,
      data: result,
      message: 'Your schedule retrieved successfully',
      timestamp: new Date().toISOString(),
    };
  }

  @Post('schedules')
  @Roles('Manager', 'Admin', 'Super User', 'system_super_admin')
  async createSchedule(@Request() req: any, @Body() dto: CreateScheduleDto) {
    const userRoles = req.user.user_roles?.map((ur: any) => ur.roles.name) || [];
    const isSuperUser = userRoles.includes('Super User') || userRoles.includes('system_super_admin');
    
    const managedDepartmentIds = await this.schedulingService.getManagedDepartmentIds(req.user.id);
    
    const result = await this.schedulingService.createSchedule(
      dto,
      req.user.id,
      isSuperUser,
      managedDepartmentIds
    );
    
    let message = '';
    if (result.created_count === 1) {
      message = 'Schedule created successfully!';
    } else {
      message = `Batch schedule created for ${result.created_count} employee(s)!`;
    }
    
    if (result.conflict_count > 0) {
      message += ` ${result.conflict_count} employee(s) had conflicts: ${result.conflict_employees.join(', ')}`;
    }
    
    return {
      success: true,
      data: result,
      message,
      timestamp: new Date().toISOString(),
    };
  }

  @Patch('schedules/:id')
  @Roles('Manager', 'Admin', 'Super User', 'system_super_admin')
  async updateSchedule(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateScheduleDto
  ) {
    const userRoles = req.user.user_roles?.map((ur: any) => ur.roles.name) || [];
    const isSuperUser = userRoles.includes('Super User') || userRoles.includes('system_super_admin');
    
    const managedDepartmentIds = await this.schedulingService.getManagedDepartmentIds(req.user.id);
    
    const result = await this.schedulingService.updateSchedule(
      parseInt(id, 10),
      dto,
      req.user.id,
      isSuperUser,
      managedDepartmentIds
    );
    
    return {
      success: true,
      data: result,
      message: 'Schedule updated successfully',
      timestamp: new Date().toISOString(),
    };
  }

  @Delete('schedules/:id')
  @Roles('Manager', 'Admin', 'Super User', 'system_super_admin')
  async deleteSchedule(@Request() req: any, @Param('id') id: string) {
    const userRoles = req.user.user_roles?.map((ur: any) => ur.roles.name) || [];
    const isSuperUser = userRoles.includes('Super User') || userRoles.includes('system_super_admin');
    
    const managedDepartmentIds = await this.schedulingService.getManagedDepartmentIds(req.user.id);
    
    await this.schedulingService.deleteSchedule(
      parseInt(id, 10),
      req.user.id,
      isSuperUser,
      managedDepartmentIds
    );
    
    return {
      success: true,
      message: 'Schedule deleted successfully',
      timestamp: new Date().toISOString(),
    };
  }

  @Post('check-conflicts')
  @Roles('Manager', 'Admin', 'Super User', 'system_super_admin')
  async checkConflicts(@Body() dto: CheckConflictsDto) {
    const result = await this.schedulingService.checkConflicts(dto);
    
    return {
      success: true,
      data: result,
      message: 'Conflict check completed',
      timestamp: new Date().toISOString(),
    };
  }
}
