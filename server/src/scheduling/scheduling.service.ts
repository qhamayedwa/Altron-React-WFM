import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateShiftTypeDto } from './dto/create-shift-type.dto';
import { UpdateShiftTypeDto } from './dto/update-shift-type.dto';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { CheckConflictsDto } from './dto/check-conflicts.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class SchedulingService {
  constructor(private prisma: PrismaService) {}

  async getManagedDepartmentIds(userId: number): Promise<number[]> {
    const departments = await this.prisma.departments.findMany({
      where: {
        OR: [
          { manager_id: userId },
          { deputy_manager_id: userId },
        ],
      },
      select: { id: true },
    });
    return departments.map(d => d.id);
  }

  async createShiftType(dto: CreateShiftTypeDto) {
    const existing = await this.prisma.shift_types.findUnique({
      where: { name: dto.name },
    });

    if (existing) {
      throw new BadRequestException('A shift type with this name already exists');
    }

    const startTime = new Date(`1970-01-01T${dto.default_start_time}:00Z`);
    const endTime = new Date(`1970-01-01T${dto.default_end_time}:00Z`);

    return this.prisma.shift_types.create({
      data: {
        name: dto.name,
        description: dto.description || null,
        default_start_time: startTime,
        default_end_time: endTime,
        is_active: dto.is_active !== undefined ? dto.is_active : true,
      },
    });
  }

  async getShiftTypes(activeOnly = true) {
    const where = activeOnly ? { is_active: true } : {};
    
    return this.prisma.shift_types.findMany({
      where,
      orderBy: { name: 'asc' },
    });
  }

  async getShiftType(id: number) {
    const shiftType = await this.prisma.shift_types.findUnique({
      where: { id },
    });

    if (!shiftType) {
      throw new NotFoundException('Shift type not found');
    }

    return shiftType;
  }

  async updateShiftType(id: number, dto: UpdateShiftTypeDto) {
    const shiftType = await this.getShiftType(id);

    if (dto.name && dto.name !== shiftType.name) {
      const existing = await this.prisma.shift_types.findUnique({
        where: { name: dto.name },
      });

      if (existing) {
        throw new BadRequestException('A shift type with this name already exists');
      }
    }

    const updateData: any = {};
    
    if (dto.name) updateData.name = dto.name;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.is_active !== undefined) updateData.is_active = dto.is_active;
    
    if (dto.default_start_time) {
      updateData.default_start_time = new Date(`1970-01-01T${dto.default_start_time}:00Z`);
    }
    
    if (dto.default_end_time) {
      updateData.default_end_time = new Date(`1970-01-01T${dto.default_end_time}:00Z`);
    }

    return this.prisma.shift_types.update({
      where: { id },
      data: updateData,
    });
  }

  async deleteShiftType(id: number) {
    const shiftType = await this.getShiftType(id);

    const scheduleCount = await this.prisma.schedules.count({
      where: { shift_type_id: id },
    });

    if (scheduleCount > 0) {
      throw new BadRequestException(
        `Cannot delete shift type "${shiftType.name}" because it is used in ${scheduleCount} schedule(s)`
      );
    }

    return this.prisma.shift_types.delete({
      where: { id },
    });
  }

  async getSchedules(
    userId: number,
    isSuperUser: boolean,
    managedDepartmentIds: number[],
    filters?: {
      user_id?: number;
      shift_type_id?: number;
      start_date?: string;
      end_date?: string;
      status?: string;
    }
  ) {
    if (!isSuperUser && managedDepartmentIds.length === 0) {
      throw new ForbiddenException('You do not have permission to view schedules. No managed departments assigned.');
    }

    const where: any = {};

    if (!isSuperUser) {
      where.users_schedules_user_idTousers = {
        department_id: { in: managedDepartmentIds },
      };
    }

    if (filters?.user_id) {
      where.user_id = filters.user_id;
    }

    if (filters?.shift_type_id) {
      where.shift_type_id = filters.shift_type_id;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.start_date) {
      where.start_time = {
        ...where.start_time,
        gte: new Date(filters.start_date),
      };
    }

    if (filters?.end_date) {
      const endDate = new Date(filters.end_date);
      endDate.setDate(endDate.getDate() + 1);
      where.start_time = {
        ...where.start_time,
        lte: endDate,
      };
    }

    return this.prisma.schedules.findMany({
      where,
      include: {
        users_schedules_user_idTousers: {
          select: {
            id: true,
            username: true,
            first_name: true,
            last_name: true,
            department_id: true,
          },
        },
        shift_types: {
          select: {
            id: true,
            name: true,
          },
        },
        users_schedules_assigned_by_manager_idTousers: {
          select: {
            id: true,
            username: true,
            first_name: true,
            last_name: true,
          },
        },
      },
      orderBy: [
        { batch_id: 'desc' },
        { start_time: 'desc' },
      ],
    });
  }

  async getMySchedule(userId: number, startDate?: string, endDate?: string) {
    const where: any = { user_id: userId };

    if (startDate) {
      where.start_time = {
        ...where.start_time,
        gte: new Date(startDate),
      };
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setDate(end.getDate() + 1);
      where.start_time = {
        ...where.start_time,
        lte: end,
      };
    }

    return this.prisma.schedules.findMany({
      where,
      include: {
        shift_types: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { start_time: 'asc' },
    });
  }

  async checkConflicts(dto: CheckConflictsDto) {
    const startTime = new Date(dto.start_time);
    const endTime = new Date(dto.end_time);

    const where: any = {
      user_id: dto.user_id,
      status: { in: ['Scheduled', 'Confirmed'] },
      OR: [
        {
          AND: [
            { start_time: { lte: startTime } },
            { end_time: { gt: startTime } },
          ],
        },
        {
          AND: [
            { start_time: { lt: endTime } },
            { end_time: { gte: endTime } },
          ],
        },
        {
          AND: [
            { start_time: { gte: startTime } },
            { end_time: { lte: endTime } },
          ],
        },
      ],
    };

    if (dto.exclude_schedule_id) {
      where.NOT = { id: dto.exclude_schedule_id };
    }

    const conflicts = await this.prisma.schedules.findMany({
      where,
      include: {
        shift_types: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return {
      has_conflicts: conflicts.length > 0,
      conflicts: conflicts.map(s => ({
        id: s.id,
        start_time: s.start_time,
        end_time: s.end_time,
        shift_type: s.shift_types?.name || 'Custom',
      })),
    };
  }

  async createSchedule(dto: CreateScheduleDto, assignedByManagerId: number, isSuperUser: boolean, managedDepartmentIds: number[]) {
    if (!isSuperUser && managedDepartmentIds.length === 0) {
      throw new ForbiddenException('You do not have permission to create schedules. No managed departments assigned.');
    }

    const startTime = new Date(dto.start_datetime);
    const endTime = new Date(dto.end_datetime);

    if (endTime <= startTime) {
      throw new BadRequestException('End time must be after start time');
    }

    const batchId = dto.user_ids.length > 1 ? uuidv4() : null;
    const createdSchedules = [];
    const conflictEmployees = [];

    for (const userId of dto.user_ids) {
      if (!isSuperUser) {
        const user = await this.prisma.users.findUnique({
          where: { id: userId },
          select: { department_id: true },
        });

        if (!user || !user.department_id || !managedDepartmentIds.includes(user.department_id)) {
          throw new ForbiddenException(`You do not have permission to schedule user ${userId}`);
        }
      }

      const conflicts = await this.checkConflicts({
        user_id: userId,
        start_time: dto.start_datetime,
        end_time: dto.end_datetime,
      });

      if (conflicts.has_conflicts) {
        const user = await this.prisma.users.findUnique({
          where: { id: userId },
          select: { username: true, first_name: true, last_name: true },
        });

        const displayName = user?.first_name && user?.last_name 
          ? `${user.first_name} ${user.last_name}` 
          : user?.username || `User ${userId}`;
        
        conflictEmployees.push(displayName);
        continue;
      }

      const schedule = await this.prisma.schedules.create({
        data: {
          user_id: userId,
          shift_type_id: dto.shift_type_id || null,
          start_time: startTime,
          end_time: endTime,
          assigned_by_manager_id: assignedByManagerId,
          notes: dto.notes || null,
          batch_id: batchId,
          status: 'Scheduled',
        },
      });

      createdSchedules.push(schedule);
    }

    return {
      created_count: createdSchedules.length,
      conflict_count: conflictEmployees.length,
      conflict_employees: conflictEmployees,
      schedules: createdSchedules,
      batch_id: batchId,
    };
  }

  async updateSchedule(id: number, dto: UpdateScheduleDto, userId: number, isSuperUser: boolean, managedDepartmentIds: number[]) {
    if (!isSuperUser && managedDepartmentIds.length === 0) {
      throw new ForbiddenException('You do not have permission to update schedules. No managed departments assigned.');
    }

    const schedule = await this.prisma.schedules.findUnique({
      where: { id },
      include: {
        users_schedules_user_idTousers: {
          select: { department_id: true },
        },
      },
    });

    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }

    if (!isSuperUser) {
      if (!schedule.users_schedules_user_idTousers.department_id || !managedDepartmentIds.includes(schedule.users_schedules_user_idTousers.department_id)) {
        throw new ForbiddenException('You do not have permission to update this schedule');
      }
    }

    const startTime = dto.start_datetime ? new Date(dto.start_datetime) : schedule.start_time;
    const endTime = dto.end_datetime ? new Date(dto.end_datetime) : schedule.end_time;

    if (endTime <= startTime) {
      throw new BadRequestException('End time must be after start time');
    }

    const conflicts = await this.checkConflicts({
      user_id: schedule.user_id,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      exclude_schedule_id: id,
    });

    if (conflicts.has_conflicts) {
      throw new BadRequestException('This schedule conflicts with an existing schedule');
    }

    const updateData: any = {};
    if (dto.shift_type_id !== undefined) updateData.shift_type_id = dto.shift_type_id;
    if (dto.start_datetime) updateData.start_time = startTime;
    if (dto.end_datetime) updateData.end_time = endTime;
    if (dto.notes !== undefined) updateData.notes = dto.notes;
    if (dto.status) updateData.status = dto.status;

    return this.prisma.schedules.update({
      where: { id },
      data: updateData,
    });
  }

  async deleteSchedule(id: number, userId: number, isSuperUser: boolean, managedDepartmentIds: number[]) {
    if (!isSuperUser && managedDepartmentIds.length === 0) {
      throw new ForbiddenException('You do not have permission to delete schedules. No managed departments assigned.');
    }

    const schedule = await this.prisma.schedules.findUnique({
      where: { id },
      include: {
        users_schedules_user_idTousers: {
          select: { department_id: true },
        },
      },
    });

    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }

    if (!isSuperUser) {
      if (!schedule.users_schedules_user_idTousers.department_id || !managedDepartmentIds.includes(schedule.users_schedules_user_idTousers.department_id)) {
        throw new ForbiddenException('You do not have permission to delete this schedule');
      }
    }

    return this.prisma.schedules.delete({
      where: { id },
    });
  }
}
