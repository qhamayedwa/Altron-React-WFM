import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ClockInDto } from './dto/clock-in.dto';
import { ClockOutDto } from './dto/clock-out.dto';
import { GetTimeEntriesDto } from './dto/get-time-entries.dto';

@Injectable()
export class TimeService {
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
    
    return departments.map((dept) => dept.id);
  }

  async clockIn(userId: number, dto: ClockInDto) {
    const activeEntry = await this.prisma.time_entries.findFirst({
      where: {
        user_id: userId,
        clock_out_time: null,
      },
    });

    if (activeEntry) {
      throw new BadRequestException('You are already clocked in');
    }

    const timeEntry = await this.prisma.time_entries.create({
      data: {
        user_id: userId,
        clock_in_time: new Date(),
        status: 'Open',
        notes: dto.notes,
        clock_in_latitude: dto.latitude,
        clock_in_longitude: dto.longitude,
      },
    });

    return {
      entry_id: timeEntry.id,
      clock_in_time: timeEntry.clock_in_time,
      status: 'clocked_in',
    };
  }

  async clockOut(userId: number, dto: ClockOutDto) {
    const activeEntry = await this.prisma.time_entries.findFirst({
      where: {
        user_id: userId,
        clock_out_time: null,
      },
    });

    if (!activeEntry) {
      throw new BadRequestException('You are not currently clocked in');
    }

    const clockOutTime = new Date();
    const totalHours =
      (clockOutTime.getTime() - activeEntry.clock_in_time.getTime()) / (1000 * 60 * 60);

    const updatedEntry = await this.prisma.time_entries.update({
      where: { id: activeEntry.id },
      data: {
        clock_out_time: clockOutTime,
        status: 'Closed',
        clock_out_latitude: dto.latitude,
        clock_out_longitude: dto.longitude,
        notes: dto.notes
          ? activeEntry.notes
            ? `${activeEntry.notes}\n${dto.notes}`
            : dto.notes
          : activeEntry.notes,
      },
    });

    return {
      entry_id: updatedEntry.id,
      clock_out_time: updatedEntry.clock_out_time,
      total_hours: parseFloat(totalHours.toFixed(2)),
      status: 'clocked_out',
    };
  }

  async getCurrentStatus(userId: number) {
    const activeEntry = await this.prisma.time_entries.findFirst({
      where: {
        user_id: userId,
        clock_out_time: null,
      },
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayEntries = await this.prisma.time_entries.findMany({
      where: {
        user_id: userId,
        clock_in_time: {
          gte: today,
        },
      },
    });

    const todayHours = todayEntries.reduce((sum, entry) => {
      if (entry.clock_out_time) {
        const hours = (entry.clock_out_time.getTime() - entry.clock_in_time.getTime()) / (1000 * 60 * 60);
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
        (new Date().getTime() - activeEntry.clock_in_time.getTime()) / (1000 * 60 * 60);
      statusData.entry_id = activeEntry.id;
      statusData.clock_in_time = activeEntry.clock_in_time;
      statusData.current_duration = parseFloat(currentDuration.toFixed(2));
    }

    return statusData;
  }

  async getTimeEntries(userId: number, dto: GetTimeEntriesDto, isSuperUser: boolean, managedDepartmentIds: number[]) {
    const { page = 1, per_page = 20, start_date, end_date, status, user_id } = dto;
    const skip = (page - 1) * per_page;

    const where: any = {};

    if (!isSuperUser && managedDepartmentIds.length === 0) {
      where.user_id = userId;
    } else if (!isSuperUser && managedDepartmentIds.length > 0) {
      const usersInManagedDepts = await this.prisma.users.findMany({
        where: { department_id: { in: managedDepartmentIds } },
        select: { id: true },
      });
      const userIds = usersInManagedDepts.map((u) => u.id);
      where.user_id = { in: userIds };
    }

    if (user_id && (isSuperUser || managedDepartmentIds.length > 0)) {
      if (!isSuperUser && managedDepartmentIds.length > 0) {
        const userDept = await this.prisma.users.findUnique({
          where: { id: user_id },
          select: { department_id: true },
        });
        if (!userDept || !managedDepartmentIds.includes(userDept.department_id!)) {
          throw new ForbiddenException('You do not have permission to view this user');
        }
      }
      where.user_id = user_id;
    }

    if (start_date) {
      where.clock_in_time = {
        ...where.clock_in_time,
        gte: new Date(start_date),
      };
    }

    if (end_date) {
      const endDateTime = new Date(end_date);
      endDateTime.setHours(23, 59, 59, 999);
      where.clock_in_time = {
        ...where.clock_in_time,
        lte: endDateTime,
      };
    }

    if (status) {
      where.status = status;
    }

    const [entries, total] = await Promise.all([
      this.prisma.time_entries.findMany({
        where,
        include: {
          users_time_entries_user_idTousers: {
            select: {
              id: true,
              username: true,
              first_name: true,
              last_name: true,
              employee_id: true,
            },
          },
        },
        orderBy: {
          clock_in_time: 'desc',
        },
        skip,
        take: per_page,
      }),
      this.prisma.time_entries.count({ where }),
    ]);

    return {
      entries: entries.map((entry) => {
        const totalHours = entry.clock_out_time
          ? (entry.clock_out_time.getTime() - entry.clock_in_time.getTime()) / (1000 * 60 * 60)
          : 0;
        
        return {
          id: entry.id,
          user: entry.users_time_entries_user_idTousers,
          clock_in_time: entry.clock_in_time,
          clock_out_time: entry.clock_out_time,
          total_hours: parseFloat(totalHours.toFixed(2)),
          status: entry.status,
          notes: entry.notes,
          approved_by_id: entry.approved_by_manager_id,
          clock_in_location: entry.clock_in_latitude && entry.clock_in_longitude
            ? { latitude: entry.clock_in_latitude, longitude: entry.clock_in_longitude }
            : null,
          clock_out_location: entry.clock_out_latitude && entry.clock_out_longitude
            ? { latitude: entry.clock_out_latitude, longitude: entry.clock_out_longitude }
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
      const usersInManagedDepts = await this.prisma.users.findMany({
        where: { department_id: { in: managedDepartmentIds } },
        select: { id: true },
      });
      const userIds = usersInManagedDepts.map((u) => u.id);
      where.user_id = { in: userIds };
    }

    const pendingEntries = await this.prisma.time_entries.findMany({
      where,
      include: {
        users_time_entries_user_idTousers: {
          select: {
            id: true,
            username: true,
            first_name: true,
            last_name: true,
            employee_id: true,
            department: true,
          },
        },
      },
      orderBy: {
        clock_in_time: 'desc',
      },
    });

    return pendingEntries.map((entry) => {
      const totalHours = entry.clock_out_time
        ? (entry.clock_out_time.getTime() - entry.clock_in_time.getTime()) / (1000 * 60 * 60)
        : 0;
      
      return {
        id: entry.id,
        user: entry.users_time_entries_user_idTousers,
        clock_in_time: entry.clock_in_time,
        clock_out_time: entry.clock_out_time,
        total_hours: parseFloat(totalHours.toFixed(2)),
        status: entry.status,
        notes: entry.notes,
      };
    });
  }

  async approveTimeEntry(entryId: number, approverId: number, isSuperUser: boolean, managedDepartmentIds: number[], notes?: string) {
    const entry = await this.prisma.time_entries.findUnique({
      where: { id: entryId },
      include: {
        users_time_entries_user_idTousers: {
          select: {
            department_id: true,
          },
        },
      },
    });

    if (!entry) {
      throw new NotFoundException('Time entry not found');
    }

    if (entry.status !== 'Closed') {
      throw new BadRequestException('Only closed time entries can be approved');
    }

    if (!isSuperUser) {
      const userDeptId = entry.users_time_entries_user_idTousers.department_id;
      if (!userDeptId || !managedDepartmentIds.includes(userDeptId)) {
        throw new ForbiddenException('You do not have permission to approve this time entry');
      }
    }

    const now = new Date();
    const updatedEntry = await this.prisma.time_entries.update({
      where: { id: entryId },
      data: {
        status: 'Approved',
        approved_by_manager_id: approverId,
        updated_at: now,
        notes: notes ? (entry.notes ? `${entry.notes}\nApproval note: ${notes}` : `Approval note: ${notes}`) : entry.notes,
      },
    });

    return {
      entry_id: updatedEntry.id,
      status: updatedEntry.status,
      approved_at: now,
    };
  }

  async rejectTimeEntry(entryId: number, approverId: number, isSuperUser: boolean, managedDepartmentIds: number[], notes?: string) {
    const entry = await this.prisma.time_entries.findUnique({
      where: { id: entryId },
      include: {
        users_time_entries_user_idTousers: {
          select: {
            department_id: true,
          },
        },
      },
    });

    if (!entry) {
      throw new NotFoundException('Time entry not found');
    }

    if (entry.status !== 'Closed') {
      throw new BadRequestException('Only closed time entries can be rejected');
    }

    if (!isSuperUser) {
      const userDeptId = entry.users_time_entries_user_idTousers.department_id;
      if (!userDeptId || !managedDepartmentIds.includes(userDeptId)) {
        throw new ForbiddenException('You do not have permission to reject this time entry');
      }
    }

    const now = new Date();
    const updatedEntry = await this.prisma.time_entries.update({
      where: { id: entryId },
      data: {
        status: 'Rejected',
        approved_by_manager_id: approverId,
        updated_at: now,
        notes: notes ? (entry.notes ? `${entry.notes}\nRejection reason: ${notes}` : `Rejection reason: ${notes}`) : entry.notes,
      },
    });

    return {
      entry_id: updatedEntry.id,
      status: updatedEntry.status,
      rejected_at: now,
    };
  }
}
