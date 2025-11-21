import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, MoreThanOrEqual, LessThanOrEqual, Not, IsNull, Or, And } from 'typeorm';
import { Department } from '../entities/department.entity';
import { LeaveApplication } from '../entities/leave-application.entity';
import { LeaveBalance } from '../entities/leave-balance.entity';
import { LeaveType } from '../entities/leave-type.entity';
import { User } from '../entities/user.entity';
import { CreateLeaveApplicationDto } from './dto/create-leave-application.dto';
import { UpdateLeaveApplicationDto } from './dto/update-leave-application.dto';
import { GetLeaveApplicationsDto } from './dto/get-leave-applications.dto';
import { CreateLeaveTypeDto } from './dto/create-leave-type.dto';
import { UpdateLeaveTypeDto } from './dto/update-leave-type.dto';
import { AdjustLeaveBalanceDto } from './dto/adjust-leave-balance.dto';

@Injectable()
export class LeaveService {
  constructor(
    @InjectRepository(Department)
    private departmentRepo: Repository<Department>,
    @InjectRepository(LeaveApplication)
    private leaveApplicationRepo: Repository<LeaveApplication>,
    @InjectRepository(LeaveBalance)
    private leaveBalanceRepo: Repository<LeaveBalance>,
    @InjectRepository(LeaveType)
    private leaveTypeRepo: Repository<LeaveType>,
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

  async getMyLeaveBalances(userId: number) {
    const currentYear = new Date().getFullYear();
    
    const balances = await this.leaveBalanceRepo.find({
      where: {
        userId: userId,
        year: currentYear,
      },
      relations: ['leaveType'],
      order: {
        leaveType: {
          name: 'ASC',
        },
      },
    });

    const activeLeaveTypes = await this.leaveTypeRepo.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });

    return {
      balances,
      leave_types: activeLeaveTypes,
      current_year: currentYear,
    };
  }

  async createLeaveApplication(userId: number, dto: CreateLeaveApplicationDto, applierId: number, isPrivileged: boolean, managedDepartmentIds: number[]) {
    const targetUserId = dto.user_id || userId;

    if (dto.auto_approve && targetUserId === applierId) {
      throw new ForbiddenException('You cannot auto-approve your own leave application');
    }

    if (targetUserId !== userId && !isPrivileged) {
      const userDept = await this.userRepo.findOne({
        where: { id: targetUserId },
        select: ['departmentId'],
      });
      
      if (!userDept || !managedDepartmentIds.includes(userDept.departmentId!)) {
        throw new ForbiddenException('You do not have permission to apply leave for this user');
      }
    }

    if (dto.auto_approve && !isPrivileged) {
      if (managedDepartmentIds.length === 0) {
        throw new ForbiddenException('Only managers and admins can auto-approve leave applications');
      }
      
      const userDept = await this.userRepo.findOne({
        where: { id: targetUserId },
        select: ['departmentId'],
      });
      
      if (!userDept || !managedDepartmentIds.includes(userDept.departmentId!)) {
        throw new ForbiddenException('You can only auto-approve leave for employees in your managed departments');
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

    const overlapping = await this.leaveApplicationRepo
      .createQueryBuilder('la')
      .where('la.userId = :userId', { userId: targetUserId })
      .andWhere('la.status IN (:...statuses)', { statuses: ['Pending', 'Approved'] })
      .andWhere(
        '((la.startDate <= :start AND la.endDate >= :start) OR ' +
        '(la.startDate <= :end AND la.endDate >= :end) OR ' +
        '(la.startDate >= :start AND la.endDate <= :end))',
        { start: startDate, end: endDate }
      )
      .getOne();

    if (overlapping) {
      throw new BadRequestException('Overlapping leave application already exists');
    }

    const leaveType = await this.leaveTypeRepo.findOne({
      where: { id: dto.leave_type_id },
    });

    if (!leaveType || !leaveType.isActive) {
      throw new BadRequestException('Invalid or inactive leave type');
    }

    let hoursNeeded: number;
    let daysRequested: number;
    
    if (dto.is_hourly && dto.hours_requested) {
      hoursNeeded = dto.hours_requested;
      daysRequested = Math.ceil(hoursNeeded / 8);
    } else {
      daysRequested = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      hoursNeeded = daysRequested * 8;
    }

    if (leaveType.maxConsecutiveDays && daysRequested > leaveType.maxConsecutiveDays) {
      throw new BadRequestException(
        `This leave type allows a maximum of ${leaveType.maxConsecutiveDays} consecutive days. You requested ${daysRequested} days.`
      );
    }

    if (leaveType.requiresApproval && dto.auto_approve && !isPrivileged) {
      throw new BadRequestException('This leave type requires approval and cannot be auto-approved');
    }

    const currentYear = new Date().getFullYear();
    const leaveBalance = await this.leaveBalanceRepo.findOne({
      where: {
        userId: targetUserId,
        leaveTypeId: dto.leave_type_id,
        year: currentYear,
      },
    });

    if (leaveBalance && leaveBalance.balance < hoursNeeded) {
      throw new BadRequestException(
        `Insufficient leave balance. Available: ${leaveBalance.balance} hours, Requested: ${hoursNeeded} hours`
      );
    }

    const now = new Date();
    const applicationData: any = {
      userId: targetUserId,
      leaveTypeId: dto.leave_type_id,
      startDate: startDate,
      endDate: endDate,
      isHourly: dto.is_hourly || false,
      status: dto.auto_approve ? 'Approved' : 'Pending',
    };

    if (dto.reason) {
      applicationData.reason = dto.reason;
    }
    if (dto.hours_requested) {
      applicationData.hoursRequested = dto.hours_requested;
    }
    if (dto.auto_approve) {
      applicationData.managerApprovedId = applierId;
      applicationData.approvedAt = now;
    }

    const application = this.leaveApplicationRepo.create(applicationData);
    await this.leaveApplicationRepo.save(application);

    if (dto.auto_approve && leaveBalance) {
      await this.leaveBalanceRepo.update(leaveBalance.id, {
        balance: leaveBalance.balance - hoursNeeded,
        usedThisYear: (leaveBalance.usedThisYear || 0) + hoursNeeded,
      });
    }

    return this.leaveApplicationRepo.findOne({
      where: {
        userId: targetUserId,
        leaveTypeId: dto.leave_type_id,
        startDate: startDate,
        endDate: endDate,
      },
      relations: ['leaveType', 'user'],
    });
  }

  async getMyApplications(userId: number, dto: GetLeaveApplicationsDto) {
    const { page = 1, per_page = 20, status } = dto;
    const skip = (page - 1) * per_page;

    const where: any = { userId: userId };
    if (status) {
      where.status = status;
    }

    const [applications, total] = await this.leaveApplicationRepo.findAndCount({
      where,
      relations: ['leaveType', 'managerApproved'],
      order: { createdAt: 'DESC' },
      skip,
      take: per_page,
    });

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
      const usersInManagedDepts = await this.userRepo.find({
        where: { departmentId: In(managedDepartmentIds) },
        select: ['id'],
      });
      const userIds = usersInManagedDepts.map((u) => u.id);
      where.userId = In(userIds);
    }

    if (status) {
      where.status = status;
    }

    if (user_id) {
      if (!isPrivileged && managedDepartmentIds.length > 0) {
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

    const [applications, total] = await this.leaveApplicationRepo.findAndCount({
      where,
      relations: ['leaveType', 'user', 'managerApproved'],
      order: { createdAt: 'DESC' },
      skip,
      take: per_page,
    });

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

  async approveApplication(applicationId: number, approverId: number, dto: UpdateLeaveApplicationDto, isPrivileged: boolean, managedDepartmentIds: number[]) {
    const application = await this.leaveApplicationRepo.findOne({
      where: { id: applicationId },
      relations: ['user'],
    });

    if (!application) {
      throw new NotFoundException('Leave application not found');
    }

    if (application.status !== 'Pending') {
      throw new BadRequestException('Application is not pending approval');
    }

    if (!isPrivileged) {
      const userDeptId = application.user.departmentId;
      if (!userDeptId || !managedDepartmentIds.includes(userDeptId)) {
        throw new ForbiddenException('You do not have permission to approve this application');
      }
    }

    const currentYear = new Date().getFullYear();
    const leaveBalance = await this.leaveBalanceRepo.findOne({
      where: {
        userId: application.userId,
        leaveTypeId: application.leaveTypeId,
        year: currentYear,
      },
    });

    let hoursToDeduct: number;
    if (application.isHourly && application.hoursRequested) {
      hoursToDeduct = application.hoursRequested;
    } else {
      const daysRequested = Math.floor((application.endDate.getTime() - application.startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      hoursToDeduct = daysRequested * 8;
    }

    if (leaveBalance) {
      if (leaveBalance.balance < hoursToDeduct) {
        throw new BadRequestException('Insufficient leave balance');
      }

      await this.leaveBalanceRepo.update(leaveBalance.id, {
        balance: leaveBalance.balance - hoursToDeduct,
        usedThisYear: (leaveBalance.usedThisYear || 0) + hoursToDeduct,
      });
    }

    const now = new Date();
    const updateData: any = {
      status: 'Approved',
      managerApprovedId: approverId,
      approvedAt: now,
    };
    if (dto.manager_comments) {
      updateData.managerComments = dto.manager_comments;
    }
    await this.leaveApplicationRepo.update(applicationId, updateData);

    return this.leaveApplicationRepo.findOne({
      where: { id: applicationId },
      relations: ['leaveType', 'user'],
    });
  }

  async rejectApplication(applicationId: number, approverId: number, dto: UpdateLeaveApplicationDto, isPrivileged: boolean, managedDepartmentIds: number[]) {
    const application = await this.leaveApplicationRepo.findOne({
      where: { id: applicationId },
      relations: ['user'],
    });

    if (!application) {
      throw new NotFoundException('Leave application not found');
    }

    if (application.status !== 'Pending') {
      throw new BadRequestException('Application is not pending approval');
    }

    if (!isPrivileged) {
      const userDeptId = application.user.departmentId;
      if (!userDeptId || !managedDepartmentIds.includes(userDeptId)) {
        throw new ForbiddenException('You do not have permission to reject this application');
      }
    }

    const updateData: any = {
      status: 'Rejected',
      managerApprovedId: approverId,
    };
    if (dto.manager_comments) {
      updateData.managerComments = dto.manager_comments;
    }
    await this.leaveApplicationRepo.update(applicationId, updateData);

    return this.leaveApplicationRepo.findOne({
      where: { id: applicationId },
      relations: ['leaveType', 'user'],
    });
  }

  async cancelApplication(applicationId: number, userId: number) {
    const application = await this.leaveApplicationRepo.findOne({
      where: {
        id: applicationId,
        userId: userId,
      },
    });

    if (!application) {
      throw new NotFoundException('Leave application not found');
    }

    if (application.status !== 'Pending' && application.status !== 'Approved') {
      throw new BadRequestException('Only pending or approved applications can be cancelled');
    }

    if (application.status === 'Approved' && application.startDate <= new Date()) {
      throw new BadRequestException('Cannot cancel approved leave that has already started');
    }

    if (application.status === 'Approved') {
      const currentYear = new Date().getFullYear();
      const leaveBalance = await this.leaveBalanceRepo.findOne({
        where: {
          userId: application.userId,
          leaveTypeId: application.leaveTypeId,
          year: currentYear,
        },
      });

      if (leaveBalance) {
        let hoursToRestore: number;
        if (application.isHourly && application.hoursRequested) {
          hoursToRestore = application.hoursRequested;
        } else {
          const daysRequested = Math.floor((application.endDate.getTime() - application.startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
          hoursToRestore = daysRequested * 8;
        }

        await this.leaveBalanceRepo.update(leaveBalance.id, {
          balance: leaveBalance.balance + hoursToRestore,
          usedThisYear: Math.max(0, (leaveBalance.usedThisYear || 0) - hoursToRestore),
        });
      }
    }

    await this.leaveApplicationRepo.update(applicationId, {
      status: 'Cancelled',
    });

    return this.leaveApplicationRepo.findOne({
      where: { id: applicationId },
      relations: ['leaveType'],
    });
  }

  async getLeaveTypes() {
    return this.leaveTypeRepo.find({
      order: { name: 'ASC' },
    });
  }

  async getLeaveType(id: number) {
    const leaveType = await this.leaveTypeRepo.findOne({
      where: { id },
    });

    if (!leaveType) {
      throw new NotFoundException('Leave type not found');
    }

    const [totalApplications, pendingApplications, approvedApplications] = await Promise.all([
      this.leaveApplicationRepo.count({ where: { leaveTypeId: id } }),
      this.leaveApplicationRepo.count({ where: { leaveTypeId: id, status: 'Pending' } }),
      this.leaveApplicationRepo.count({ where: { leaveTypeId: id, status: 'Approved' } }),
    ]);

    return {
      leave_type: leaveType,
      statistics: {
        total_applications: totalApplications,
        pending_applications: pendingApplications,
        approved_applications: approvedApplications,
      },
    };
  }

  async createLeaveType(dto: CreateLeaveTypeDto) {
    const existing = await this.leaveTypeRepo.findOne({
      where: { name: dto.name },
    });

    if (existing) {
      throw new BadRequestException('A leave type with this name already exists');
    }

    const leaveTypeData: any = {
      name: dto.name,
      requiresApproval: dto.requires_approval ?? true,
    };

    if (dto.description) {
      leaveTypeData.description = dto.description;
    }
    if (dto.default_accrual_rate) {
      leaveTypeData.defaultAccrualRate = dto.default_accrual_rate;
    }
    if (dto.max_consecutive_days) {
      leaveTypeData.maxConsecutiveDays = dto.max_consecutive_days;
    }

    const leaveType = this.leaveTypeRepo.create(leaveTypeData);
    return this.leaveTypeRepo.save(leaveType);
  }

  async updateLeaveType(id: number, dto: UpdateLeaveTypeDto) {
    const leaveType = await this.leaveTypeRepo.findOne({
      where: { id },
    });

    if (!leaveType) {
      throw new NotFoundException('Leave type not found');
    }

    if (dto.name) {
      const existing = await this.leaveTypeRepo.findOne({
        where: {
          name: dto.name,
          id: Not(id),
        },
      });

      if (existing) {
        throw new BadRequestException('A leave type with this name already exists');
      }
    }

    if (dto.is_active === false) {
      const pendingCount = await this.leaveApplicationRepo.count({
        where: {
          leaveTypeId: id,
          status: 'Pending',
        },
      });

      if (pendingCount > 0) {
        throw new BadRequestException(
          `Cannot deactivate leave type with ${pendingCount} pending applications`
        );
      }
    }

    const updateData: any = {};
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.default_accrual_rate !== undefined) updateData.defaultAccrualRate = dto.default_accrual_rate;
    if (dto.requires_approval !== undefined) updateData.requiresApproval = dto.requires_approval;
    if (dto.max_consecutive_days !== undefined) updateData.maxConsecutiveDays = dto.max_consecutive_days;
    if (dto.is_active !== undefined) updateData.isActive = dto.is_active;

    await this.leaveTypeRepo.update(id, updateData);

    return this.leaveTypeRepo.findOne({ where: { id } });
  }

  async getLeaveBalances(year?: number, userId?: number, leaveTypeId?: number) {
    const currentYear = year || new Date().getFullYear();

    const where: any = { year: currentYear };
    if (userId) {
      where.userId = userId;
    }
    if (leaveTypeId) {
      where.leaveTypeId = leaveTypeId;
    }

    return this.leaveBalanceRepo.find({
      where,
      relations: ['user', 'leaveType'],
      order: {
        user: {
          username: 'ASC',
        },
      },
    });
  }

  async adjustLeaveBalance(balanceId: number, dto: AdjustLeaveBalanceDto) {
    const balance = await this.leaveBalanceRepo.findOne({
      where: { id: balanceId },
    });

    if (!balance) {
      throw new NotFoundException('Leave balance not found');
    }

    const adjustment = dto.new_balance - balance.balance;

    await this.leaveBalanceRepo.update(balanceId, {
      balance: dto.new_balance,
      accruedThisYear: (balance.accruedThisYear || 0) + Math.max(0, adjustment),
    });

    return this.leaveBalanceRepo.findOne({ where: { id: balanceId } });
  }

  async runAccrual() {
    const accrualDate = new Date();
    const currentYear = accrualDate.getFullYear();
    const currentMonth = accrualDate.getMonth();
    let usersProcessed = 0;

    const users = await this.userRepo.find({
      where: { isActive: true },
    });

    const leaveTypes = await this.leaveTypeRepo.find({
      where: {
        isActive: true,
        defaultAccrualRate: Not(IsNull()),
      },
    });

    for (const user of users) {
      for (const leaveType of leaveTypes) {
        let balance = await this.leaveBalanceRepo.findOne({
          where: {
            userId: user.id,
            leaveTypeId: leaveType.id,
            year: currentYear,
          },
        });

        if (!balance) {
          balance = this.leaveBalanceRepo.create({
            userId: user.id,
            leaveTypeId: leaveType.id,
            year: currentYear,
            balance: 0,
            accruedThisYear: 0,
            usedThisYear: 0,
          });
          balance = await this.leaveBalanceRepo.save(balance);
        }

        const lastAccrualDate = balance.lastAccrualDate ? new Date(balance.lastAccrualDate) : null;
        const needsAccrual = !lastAccrualDate || 
          lastAccrualDate.getFullYear() !== currentYear ||
          lastAccrualDate.getMonth() !== currentMonth;

        if (needsAccrual && leaveType.defaultAccrualRate) {
          const monthlyAccrual = leaveType.defaultAccrualRate / 12;

          await this.leaveBalanceRepo.update(balance.id, {
            balance: balance.balance + monthlyAccrual,
            accruedThisYear: (balance.accruedThisYear || 0) + monthlyAccrual,
            lastAccrualDate: accrualDate,
          });

          usersProcessed++;
        }
      }
    }

    return {
      users_processed: usersProcessed,
      accrual_date: accrualDate,
    };
  }
}
