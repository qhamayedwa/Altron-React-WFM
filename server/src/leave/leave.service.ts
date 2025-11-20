import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLeaveApplicationDto } from './dto/create-leave-application.dto';
import { UpdateLeaveApplicationDto } from './dto/update-leave-application.dto';
import { GetLeaveApplicationsDto } from './dto/get-leave-applications.dto';
import { CreateLeaveTypeDto } from './dto/create-leave-type.dto';
import { UpdateLeaveTypeDto } from './dto/update-leave-type.dto';
import { AdjustLeaveBalanceDto } from './dto/adjust-leave-balance.dto';

@Injectable()
export class LeaveService {
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

  async getMyLeaveBalances(userId: number) {
    const currentYear = new Date().getFullYear();
    
    const balances = await this.prisma.leave_balances.findMany({
      where: {
        user_id: userId,
        year: currentYear,
      },
      include: {
        leave_types: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
      orderBy: {
        leave_types: {
          name: 'asc',
        },
      },
    });

    const activeLeaveTypes = await this.prisma.leave_types.findMany({
      where: { is_active: true },
      orderBy: { name: 'asc' },
    });

    return {
      balances,
      leave_types: activeLeaveTypes,
      current_year: currentYear,
    };
  }

  async createLeaveApplication(userId: number, dto: CreateLeaveApplicationDto, applierId: number, isPrivileged: boolean, managedDepartmentIds: number[]) {
    const targetUserId = dto.user_id || userId;

    if (targetUserId !== userId && !isPrivileged) {
      const userDept = await this.prisma.users.findUnique({
        where: { id: targetUserId },
        select: { department_id: true },
      });
      
      if (!userDept || !managedDepartmentIds.includes(userDept.department_id!)) {
        throw new ForbiddenException('You do not have permission to apply leave for this user');
      }
    }

    const startDate = new Date(dto.start_date);
    const endDate = new Date(dto.end_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (endDate < startDate) {
      throw new BadRequestException('End date must be after start date');
    }

    if (startDate <= today && !dto.auto_approve) {
      throw new BadRequestException('Leave applications must be for future dates');
    }

    const overlapping = await this.prisma.leave_applications.findFirst({
      where: {
        user_id: targetUserId,
        status: { in: ['Pending', 'Approved'] },
        OR: [
          {
            AND: [
              { start_date: { lte: startDate } },
              { end_date: { gte: startDate } },
            ],
          },
          {
            AND: [
              { start_date: { lte: endDate } },
              { end_date: { gte: endDate } },
            ],
          },
          {
            AND: [
              { start_date: { gte: startDate } },
              { end_date: { lte: endDate } },
            ],
          },
        ],
      },
    });

    if (overlapping) {
      throw new BadRequestException('Overlapping leave application already exists');
    }

    const leaveType = await this.prisma.leave_types.findUnique({
      where: { id: dto.leave_type_id },
    });

    if (!leaveType || !leaveType.is_active) {
      throw new BadRequestException('Invalid or inactive leave type');
    }

    let hoursNeeded: number;
    if (dto.is_hourly && dto.hours_requested) {
      hoursNeeded = dto.hours_requested;
    } else {
      const daysRequested = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      hoursNeeded = daysRequested * 8;
    }

    const currentYear = new Date().getFullYear();
    const leaveBalance = await this.prisma.leave_balances.findFirst({
      where: {
        user_id: targetUserId,
        leave_type_id: dto.leave_type_id,
        year: currentYear,
      },
    });

    if (leaveBalance && leaveBalance.balance < hoursNeeded) {
      throw new BadRequestException(
        `Insufficient leave balance. Available: ${leaveBalance.balance} hours, Requested: ${hoursNeeded} hours`
      );
    }

    const now = new Date();
    const application = await this.prisma.leave_applications.create({
      data: {
        user_id: targetUserId,
        leave_type_id: dto.leave_type_id,
        start_date: startDate,
        end_date: endDate,
        reason: dto.reason || null,
        is_hourly: dto.is_hourly || false,
        hours_requested: dto.hours_requested || null,
        status: dto.auto_approve ? 'Approved' : 'Pending',
        manager_approved_id: dto.auto_approve ? applierId : null,
        approved_at: dto.auto_approve ? now : null,
      },
      include: {
        leave_types: true,
        users_leave_applications_user_idTousers: {
          select: {
            id: true,
            username: true,
            first_name: true,
            last_name: true,
          },
        },
      },
    });

    if (dto.auto_approve && leaveBalance) {
      await this.prisma.leave_balances.update({
        where: { id: leaveBalance.id },
        data: {
          balance: leaveBalance.balance - hoursNeeded,
          used_this_year: leaveBalance.used_this_year + hoursNeeded,
        },
      });
    }

    return application;
  }

  async getMyApplications(userId: number, dto: GetLeaveApplicationsDto) {
    const { page = 1, per_page = 20, status } = dto;
    const skip = (page - 1) * per_page;

    const where: any = { user_id: userId };
    if (status) {
      where.status = status;
    }

    const [applications, total] = await Promise.all([
      this.prisma.leave_applications.findMany({
        where,
        include: {
          leave_types: {
            select: {
              id: true,
              name: true,
            },
          },
          users_leave_applications_manager_approved_idTousers: {
            select: {
              id: true,
              username: true,
              first_name: true,
              last_name: true,
            },
          },
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: per_page,
      }),
      this.prisma.leave_applications.count({ where }),
    ]);

    return {
      applications,
      pagination: {
        page,
        per_page,
        total,
        total_pages: Math.ceil(total / per_page),
      },
    };
  }

  async getTeamApplications(userId: number, dto: GetLeaveApplicationsDto, isPrivileged: boolean, managedDepartmentIds: number[]) {
    if (!isPrivileged && managedDepartmentIds.length === 0) {
      throw new ForbiddenException('You do not have permission to view team applications');
    }

    const { page = 1, per_page = 20, status, user_id } = dto;
    const skip = (page - 1) * per_page;

    const where: any = {};

    if (!isPrivileged && managedDepartmentIds.length > 0) {
      const usersInManagedDepts = await this.prisma.users.findMany({
        where: { department_id: { in: managedDepartmentIds } },
        select: { id: true },
      });
      const userIds = usersInManagedDepts.map((u) => u.id);
      where.user_id = { in: userIds };
    }

    if (status) {
      where.status = status;
    }

    if (user_id) {
      if (!isPrivileged && managedDepartmentIds.length > 0) {
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

    const [applications, total] = await Promise.all([
      this.prisma.leave_applications.findMany({
        where,
        include: {
          leave_types: {
            select: {
              id: true,
              name: true,
            },
          },
          users_leave_applications_user_idTousers: {
            select: {
              id: true,
              username: true,
              first_name: true,
              last_name: true,
              departments: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          users_leave_applications_manager_approved_idTousers: {
            select: {
              id: true,
              username: true,
              first_name: true,
              last_name: true,
            },
          },
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: per_page,
      }),
      this.prisma.leave_applications.count({ where }),
    ]);

    return {
      applications,
      pagination: {
        page,
        per_page,
        total,
        total_pages: Math.ceil(total / per_page),
      },
    };
  }
}