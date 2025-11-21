import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, MoreThanOrEqual, LessThanOrEqual, IsNull } from 'typeorm';
import { TimeEntry } from '../entities/time-entry.entity';
import { Department } from '../entities/department.entity';
import { User } from '../entities/user.entity';
import { ClockInDto } from './dto/clock-in.dto';
import { ClockOutDto } from './dto/clock-out.dto';
import { GetTimeEntriesDto } from './dto/get-time-entries.dto';

@Injectable()
export class TimeService {
  constructor(
    @InjectRepository(TimeEntry)
    private timeEntryRepo: Repository<TimeEntry>,
    @InjectRepository(Department)
    private departmentRepo: Repository<Department>,
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
    
    return departments.map((dept) => dept.id);
  }

  async clockIn(userId: number, dto: ClockInDto) {
    const activeEntry = await this.timeEntryRepo.findOne({
      where: {
        userId: userId,
        clockOutTime: IsNull(),
      },
    });

    if (activeEntry) {
      throw new BadRequestException('You are already clocked in');
    }

    const timeEntry = this.timeEntryRepo.create({
      userId: userId,
      clockInTime: new Date(),
      status: 'Open',
      notes: dto.notes,
      clockInLatitude: dto.latitude,
      clockInLongitude: dto.longitude,
    });

    const savedEntry = await this.timeEntryRepo.save(timeEntry);

    return {
      entry_id: savedEntry.id,
      clock_in_time: savedEntry.clockInTime,
      status: 'clocked_in',
    };
  }

  async clockOut(userId: number, dto: ClockOutDto) {
    const activeEntry = await this.timeEntryRepo.findOne({
      where: {
        userId: userId,
        clockOutTime: IsNull(),
      },
    });

    if (!activeEntry) {
      throw new BadRequestException('You are not currently clocked in');
    }

    const clockOutTime = new Date();
    const totalHours =
      (clockOutTime.getTime() - activeEntry.clockInTime.getTime()) / (1000 * 60 * 60);

    activeEntry.clockOutTime = clockOutTime;
    activeEntry.status = 'Closed';
    activeEntry.clockOutLatitude = dto.latitude;
    activeEntry.clockOutLongitude = dto.longitude;
    activeEntry.notes = dto.notes
      ? activeEntry.notes
        ? `${activeEntry.notes}\n${dto.notes}`
        : dto.notes
      : activeEntry.notes;

    const updatedEntry = await this.timeEntryRepo.save(activeEntry);

    return {
      entry_id: updatedEntry.id,
      clock_out_time: updatedEntry.clockOutTime,
      total_hours: parseFloat(totalHours.toFixed(2)),
      status: 'clocked_out',
    };
  }

  async getCurrentStatus(userId: number) {
    const activeEntry = await this.timeEntryRepo.findOne({
      where: {
        userId: userId,
        clockOutTime: IsNull(),
      },
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayEntries = await this.timeEntryRepo.find({
      where: {
        userId: userId,
        clockInTime: MoreThanOrEqual(today),
      },
    });

    const todayHours = todayEntries.reduce((sum, entry) => {
      if (entry.clockOutTime) {
        const hours = (entry.clockOutTime.getTime() - entry.clockInTime.getTime()) / (1000 * 60 * 60);
        return sum + hours;
      }
      return sum;
    }, 0);

    const statusData: any = {
      is_clocked_in: activeEntry !== null,
      today_hours: parseFloat(todayHours.toFixed(2)),
    };

    if (activeEntry) {
      const currentDuration =
        (new Date().getTime() - activeEntry.clockInTime.getTime()) / (1000 * 60 * 60);
      statusData.entry_id = activeEntry.id;
      statusData.clock_in_time = activeEntry.clockInTime;
      statusData.current_duration = parseFloat(currentDuration.toFixed(2));
    }

    return statusData;
  }

  async getTimeEntries(userId: number, dto: GetTimeEntriesDto, isSuperUser: boolean, managedDepartmentIds: number[]) {
    const { page = 1, per_page = 20, start_date, end_date, status, user_id } = dto;
    const skip = (page - 1) * per_page;

    const where: any = {};

    if (!isSuperUser && managedDepartmentIds.length === 0) {
      where.userId = userId;
    } else if (!isSuperUser && managedDepartmentIds.length > 0) {
      const usersInManagedDepts = await this.userRepo.find({
        where: { departmentId: In(managedDepartmentIds) },
        select: ['id'],
      });
      const userIds = usersInManagedDepts.map((u) => u.id);
      where.userId = In(userIds);
    }

    if (user_id && (isSuperUser || managedDepartmentIds.length > 0)) {
      if (!isSuperUser && managedDepartmentIds.length > 0) {
        const userDept = await this.userRepo.findOne({
          where: { id: user_id },
          select: ['departmentId'],
        });
        if (!userDept || !managedDepartmentIds.includes(userDept.departmentId!)) {
          throw new ForbiddenException('You do not have permission to view this user');
        }
      }
      where.userId = user_id;
    }

    if (start_date && end_date) {
      const endDateTime = new Date(end_date);
      endDateTime.setHours(23, 59, 59, 999);
      where.clockInTime = MoreThanOrEqual(new Date(start_date));
      where.clockInTime = LessThanOrEqual(endDateTime);
    } else if (start_date) {
      where.clockInTime = MoreThanOrEqual(new Date(start_date));
    } else if (end_date) {
      const endDateTime = new Date(end_date);
      endDateTime.setHours(23, 59, 59, 999);
      where.clockInTime = LessThanOrEqual(endDateTime);
    }

    if (status) {
      where.status = status;
    }

    const [entries, total] = await Promise.all([
      this.timeEntryRepo.find({
        where,
        relations: ['user'],
        order: {
          clockInTime: 'DESC',
        },
        skip,
        take: per_page,
      }),
      this.timeEntryRepo.count({ where }),
    ]);

    return {
      entries: entries.map((entry) => {
        const totalHours = entry.clockOutTime
          ? (entry.clockOutTime.getTime() - entry.clockInTime.getTime()) / (1000 * 60 * 60)
          : 0;
        
        return {
          id: entry.id,
          user: {
            id: entry.user.id,
            username: entry.user.username,
            first_name: entry.user.firstName,
            last_name: entry.user.lastName,
            employee_id: entry.user.employeeNumber,
          },
          clock_in_time: entry.clockInTime,
          clock_out_time: entry.clockOutTime,
          total_hours: parseFloat(totalHours.toFixed(2)),
          status: entry.status,
          notes: entry.notes,
          approved_by_id: entry.approvedByManagerId,
          clock_in_location: entry.clockInLatitude && entry.clockInLongitude
            ? { latitude: entry.clockInLatitude, longitude: entry.clockInLongitude }
            : null,
          clock_out_location: entry.clockOutLatitude && entry.clockOutLongitude
            ? { latitude: entry.clockOutLatitude, longitude: entry.clockOutLongitude }
            : null,
        };
      }),
      pagination: {
        page,
        per_page,
        total,
        total_pages: Math.ceil(total / per_page),
      },
    };
  }

  async getPendingApprovals(userId: number, isSuperUser: boolean, managedDepartmentIds: number[]) {
    if (!isSuperUser && managedDepartmentIds.length === 0) {
      throw new ForbiddenException('You do not have permission to view pending approvals');
    }

    const where: any = {
      status: 'Closed',
    };

    if (!isSuperUser && managedDepartmentIds.length > 0) {
      const usersInManagedDepts = await this.userRepo.find({
        where: { departmentId: In(managedDepartmentIds) },
        select: ['id'],
      });
      const userIds = usersInManagedDepts.map((u) => u.id);
      where.userId = In(userIds);
    }

    const pendingEntries = await this.timeEntryRepo.find({
      where,
      relations: ['user', 'user.department'],
      order: {
        clockInTime: 'DESC',
      },
    });

    return pendingEntries.map((entry) => {
      const totalHours = entry.clockOutTime
        ? (entry.clockOutTime.getTime() - entry.clockInTime.getTime()) / (1000 * 60 * 60)
        : 0;
      
      return {
        id: entry.id,
        user: {
          id: entry.user.id,
          username: entry.user.username,
          first_name: entry.user.firstName,
          last_name: entry.user.lastName,
          employee_id: entry.user.employeeNumber,
          department: entry.user.department,
        },
        clock_in_time: entry.clockInTime,
        clock_out_time: entry.clockOutTime,
        total_hours: parseFloat(totalHours.toFixed(2)),
        status: entry.status,
        notes: entry.notes,
      };
    });
  }

  async approveTimeEntry(entryId: number, approverId: number, isSuperUser: boolean, managedDepartmentIds: number[], notes?: string) {
    const entry = await this.timeEntryRepo.findOne({
      where: { id: entryId },
      relations: ['user'],
    });

    if (!entry) {
      throw new NotFoundException('Time entry not found');
    }

    if (entry.status !== 'Closed') {
      throw new BadRequestException('Only closed time entries can be approved');
    }

    if (!isSuperUser) {
      const user = await this.userRepo.findOne({
        where: { id: entry.userId },
        select: ['departmentId'],
      });
      const userDeptId = user?.departmentId;
      if (!userDeptId || !managedDepartmentIds.includes(userDeptId)) {
        throw new ForbiddenException('You do not have permission to approve this time entry');
      }
    }

    const now = new Date();
    entry.status = 'Approved';
    entry.approvedByManagerId = approverId;
    entry.updatedAt = now;
    entry.notes = notes ? (entry.notes ? `${entry.notes}\nApproval note: ${notes}` : `Approval note: ${notes}`) : entry.notes;

    const updatedEntry = await this.timeEntryRepo.save(entry);

    return {
      entry_id: updatedEntry.id,
      status: updatedEntry.status,
      approved_at: now,
    };
  }

  async rejectTimeEntry(entryId: number, approverId: number, isSuperUser: boolean, managedDepartmentIds: number[], notes?: string) {
    const entry = await this.timeEntryRepo.findOne({
      where: { id: entryId },
      relations: ['user'],
    });

    if (!entry) {
      throw new NotFoundException('Time entry not found');
    }

    if (entry.status !== 'Closed') {
      throw new BadRequestException('Only closed time entries can be rejected');
    }

    if (!isSuperUser) {
      const user = await this.userRepo.findOne({
        where: { id: entry.userId },
        select: ['departmentId'],
      });
      const userDeptId = user?.departmentId;
      if (!userDeptId || !managedDepartmentIds.includes(userDeptId)) {
        throw new ForbiddenException('You do not have permission to reject this time entry');
      }
    }

    const now = new Date();
    entry.status = 'Rejected';
    entry.approvedByManagerId = approverId;
    entry.updatedAt = now;
    entry.notes = notes ? (entry.notes ? `${entry.notes}\nRejection reason: ${notes}` : `Rejection reason: ${notes}`) : entry.notes;

    const updatedEntry = await this.timeEntryRepo.save(entry);

    return {
      entry_id: updatedEntry.id,
      status: updatedEntry.status,
      rejected_at: now,
    };
  }
}
