import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Or, In, MoreThanOrEqual, LessThanOrEqual, LessThan, MoreThan, Not } from 'typeorm';
import { Department } from '../entities/department.entity';
import { Schedule } from '../entities/schedule.entity';
import { ShiftType } from '../entities/shift-type.entity';
import { User } from '../entities/user.entity';
import { CreateShiftTypeDto } from './dto/create-shift-type.dto';
import { UpdateShiftTypeDto } from './dto/update-shift-type.dto';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { CheckConflictsDto } from './dto/check-conflicts.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class SchedulingService {
  constructor(
    @InjectRepository(Department)
    private departmentRepo: Repository<Department>,
    @InjectRepository(Schedule)
    private scheduleRepo: Repository<Schedule>,
    @InjectRepository(ShiftType)
    private shiftTypeRepo: Repository<ShiftType>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async getManagedDepartmentIds(userId: number): Promise<number[]> {
    const departments = await this.departmentRepo.find({
      where: [
        { managerId: userId },
        { deputyManagerId: userId },
      ],
      select: ['id'],
    });
    return departments.map(d => d.id);
  }

  async createShiftType(dto: CreateShiftTypeDto) {
    const existing = await this.shiftTypeRepo.findOne({
      where: { name: dto.name },
    });

    if (existing) {
      throw new BadRequestException('A shift type with this name already exists');
    }

    const startTime = new Date(`1970-01-01T${dto.default_start_time}:00Z`);
    const endTime = new Date(`1970-01-01T${dto.default_end_time}:00Z`);

    const shiftType = this.shiftTypeRepo.create({
      name: dto.name,
      defaultStartTime: startTime,
      defaultEndTime: endTime,
      isActive: dto.is_active !== undefined ? dto.is_active : true,
    });
    
    if (dto.description) {
      shiftType.description = dto.description;
    }

    return this.shiftTypeRepo.save(shiftType);
  }

  async getShiftTypes(activeOnly = true) {
    const where = activeOnly ? { isActive: true } : {};
    
    return this.shiftTypeRepo.find({
      where,
      order: { name: 'ASC' },
    });
  }

  async getShiftType(id: number) {
    const shiftType = await this.shiftTypeRepo.findOne({
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
      const existing = await this.shiftTypeRepo.findOne({
        where: { name: dto.name },
      });

      if (existing) {
        throw new BadRequestException('A shift type with this name already exists');
      }
    }

    const updateData: Partial<ShiftType> = {};
    
    if (dto.name) updateData.name = dto.name;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.is_active !== undefined) updateData.isActive = dto.is_active;
    
    if (dto.default_start_time) {
      updateData.defaultStartTime = new Date(`1970-01-01T${dto.default_start_time}:00Z`);
    }
    
    if (dto.default_end_time) {
      updateData.defaultEndTime = new Date(`1970-01-01T${dto.default_end_time}:00Z`);
    }

    await this.shiftTypeRepo.update(id, updateData);
    return this.getShiftType(id);
  }

  async deleteShiftType(id: number) {
    const shiftType = await this.getShiftType(id);

    const scheduleCount = await this.scheduleRepo.count({
      where: { shiftTypeId: id },
    });

    if (scheduleCount > 0) {
      throw new BadRequestException(
        `Cannot delete shift type "${shiftType.name}" because it is used in ${scheduleCount} schedule(s)`
      );
    }

    await this.shiftTypeRepo.delete(id);
    return { message: 'Shift type deleted successfully' };
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

    const queryBuilder = this.scheduleRepo
      .createQueryBuilder('schedule')
      .leftJoinAndSelect('schedule.user', 'user')
      .leftJoinAndSelect('schedule.shiftType', 'shiftType')
      .leftJoinAndSelect('schedule.assignedByManager', 'assignedByManager');

    if (!isSuperUser) {
      queryBuilder.andWhere('user.departmentId IN (:...departmentIds)', {
        departmentIds: managedDepartmentIds,
      });
    }

    if (filters?.user_id) {
      queryBuilder.andWhere('schedule.userId = :userId', { userId: filters.user_id });
    }

    if (filters?.shift_type_id) {
      queryBuilder.andWhere('schedule.shiftTypeId = :shiftTypeId', { shiftTypeId: filters.shift_type_id });
    }

    if (filters?.status) {
      queryBuilder.andWhere('schedule.status = :status', { status: filters.status });
    }

    if (filters?.start_date) {
      queryBuilder.andWhere('schedule.startTime >= :startDate', {
        startDate: new Date(filters.start_date),
      });
    }

    if (filters?.end_date) {
      const endDate = new Date(filters.end_date);
      endDate.setDate(endDate.getDate() + 1);
      queryBuilder.andWhere('schedule.startTime <= :endDate', {
        endDate: endDate,
      });
    }

    queryBuilder
      .orderBy('schedule.batchId', 'DESC', 'NULLS LAST')
      .addOrderBy('schedule.startTime', 'DESC');

    return queryBuilder.getMany();
  }

  async getMySchedule(userId: number, startDate?: string, endDate?: string) {
    const queryBuilder = this.scheduleRepo
      .createQueryBuilder('schedule')
      .leftJoinAndSelect('schedule.shiftType', 'shiftType')
      .where('schedule.userId = :userId', { userId });

    if (startDate) {
      queryBuilder.andWhere('schedule.startTime >= :startDate', {
        startDate: new Date(startDate),
      });
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setDate(end.getDate() + 1);
      queryBuilder.andWhere('schedule.startTime <= :endDate', {
        endDate: end,
      });
    }

    queryBuilder.orderBy('schedule.startTime', 'ASC');

    return queryBuilder.getMany();
  }

  async checkConflicts(dto: CheckConflictsDto) {
    const startTime = new Date(dto.start_time);
    const endTime = new Date(dto.end_time);

    const queryBuilder = this.scheduleRepo
      .createQueryBuilder('schedule')
      .leftJoinAndSelect('schedule.shiftType', 'shiftType')
      .where('schedule.userId = :userId', { userId: dto.user_id })
      .andWhere('schedule.status IN (:...statuses)', { statuses: ['Scheduled', 'Confirmed'] })
      .andWhere(
        '(' +
        '(schedule.startTime <= :startTime AND schedule.endTime > :startTime) OR ' +
        '(schedule.startTime < :endTime AND schedule.endTime >= :endTime) OR ' +
        '(schedule.startTime >= :startTime AND schedule.endTime <= :endTime)' +
        ')',
        { startTime, endTime }
      );

    if (dto.exclude_schedule_id) {
      queryBuilder.andWhere('schedule.id != :excludeId', { excludeId: dto.exclude_schedule_id });
    }

    const conflicts = await queryBuilder.getMany();

    return {
      has_conflicts: conflicts.length > 0,
      conflicts: conflicts.map(s => ({
        id: s.id,
        start_time: s.startTime,
        end_time: s.endTime,
        shift_type: s.shiftType?.name || 'Custom',
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
        const user = await this.userRepo.findOne({
          where: { id: userId },
          select: ['departmentId'],
        });

        if (!user || !user.departmentId || !managedDepartmentIds.includes(user.departmentId)) {
          throw new ForbiddenException(`You do not have permission to schedule user ${userId}`);
        }
      }

      const conflicts = await this.checkConflicts({
        user_id: userId,
        start_time: dto.start_datetime,
        end_time: dto.end_datetime,
      });

      if (conflicts.has_conflicts) {
        const user = await this.userRepo.findOne({
          where: { id: userId },
          select: ['username', 'firstName', 'lastName'],
        });

        const displayName = user?.firstName && user?.lastName 
          ? `${user.firstName} ${user.lastName}` 
          : user?.username || `User ${userId}`;
        
        conflictEmployees.push(displayName);
        continue;
      }

      const schedule = this.scheduleRepo.create({
        userId: userId,
        startTime: startTime,
        endTime: endTime,
        assignedByManagerId: assignedByManagerId,
        status: 'Scheduled',
      });

      if (dto.shift_type_id) {
        schedule.shiftTypeId = dto.shift_type_id;
      }

      if (dto.notes) {
        schedule.notes = dto.notes;
      }

      if (batchId) {
        schedule.batchId = batchId;
      }

      const savedSchedule = await this.scheduleRepo.save(schedule);

      createdSchedules.push(savedSchedule);
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

    const schedule = await this.scheduleRepo.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }

    if (!isSuperUser) {
      if (!schedule.user.departmentId || !managedDepartmentIds.includes(schedule.user.departmentId)) {
        throw new ForbiddenException('You do not have permission to update this schedule');
      }
    }

    const startTime = dto.start_datetime ? new Date(dto.start_datetime) : schedule.startTime;
    const endTime = dto.end_datetime ? new Date(dto.end_datetime) : schedule.endTime;

    if (endTime <= startTime) {
      throw new BadRequestException('End time must be after start time');
    }

    const conflicts = await this.checkConflicts({
      user_id: schedule.userId,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      exclude_schedule_id: id,
    });

    if (conflicts.has_conflicts) {
      throw new BadRequestException('This schedule conflicts with an existing schedule');
    }

    const updateData: Partial<Schedule> = {};
    if (dto.shift_type_id !== undefined) updateData.shiftTypeId = dto.shift_type_id;
    if (dto.start_datetime) updateData.startTime = startTime;
    if (dto.end_datetime) updateData.endTime = endTime;
    if (dto.notes !== undefined) updateData.notes = dto.notes;
    if (dto.status) updateData.status = dto.status;

    await this.scheduleRepo.update(id, updateData);
    return this.scheduleRepo.findOne({ where: { id } });
  }

  async deleteSchedule(id: number, userId: number, isSuperUser: boolean, managedDepartmentIds: number[]) {
    if (!isSuperUser && managedDepartmentIds.length === 0) {
      throw new ForbiddenException('You do not have permission to delete schedules. No managed departments assigned.');
    }

    const schedule = await this.scheduleRepo.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }

    if (!isSuperUser) {
      if (!schedule.user.departmentId || !managedDepartmentIds.includes(schedule.user.departmentId)) {
        throw new ForbiddenException('You do not have permission to delete this schedule');
      }
    }

    await this.scheduleRepo.delete(id);
    return { message: 'Schedule deleted successfully' };
  }
}
