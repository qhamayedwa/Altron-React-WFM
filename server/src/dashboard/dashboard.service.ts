import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { TimeEntry } from '../entities/time-entry.entity';
import { LeaveApplication } from '../entities/leave-application.entity';
import { LeaveBalance } from '../entities/leave-balance.entity';
import { User } from '../entities/user.entity';
import { DashboardConfig } from '../entities/dashboard-config.entity';
import { Department } from '../entities/department.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(DashboardConfig)
    private dashboardConfigRepo: Repository<DashboardConfig>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(TimeEntry)
    private timeEntryRepo: Repository<TimeEntry>,
    @InjectRepository(LeaveApplication)
    private leaveApplicationRepo: Repository<LeaveApplication>,
    @InjectRepository(LeaveBalance)
    private leaveBalanceRepo: Repository<LeaveBalance>,
    @InjectRepository(Department)
    private departmentRepo: Repository<Department>,
  ) {}

  async getDashboardStats(userId: number, role: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    const timeEntriesToday = await this.timeEntryRepo.find({
      where: {
        userId: userId,
        clockInTime: MoreThanOrEqual(today),
      },
      order: { clockInTime: 'DESC' },
    });

    const leaveApplications = await this.leaveApplicationRepo.find({
      where: {
        userId: userId,
      },
      relations: ['leaveType'],
      order: { createdAt: 'DESC' },
      take: 5,
    });

    const leaveBalances = await this.leaveBalanceRepo.find({
      where: {
        userId: userId,
      },
      relations: ['leaveType'],
    });

    let pendingApprovals = 0;
    if (['Manager', 'Admin', 'Super User', 'system_super_admin'].includes(role)) {
      const pendingTimeEntries = await this.timeEntryRepo.count({
        where: {
          status: 'pending',
        },
      });

      const pendingLeaveApps = await this.leaveApplicationRepo.count({
        where: {
          status: 'pending',
        },
      });

      pendingApprovals = pendingTimeEntries + pendingLeaveApps;
    }

    return {
      success: true,
      stats: {
        timeEntriesToday: timeEntriesToday.length,
        pendingApprovals: pendingApprovals,
        leaveBalances: leaveBalances.length,
        recentLeaveApplications: leaveApplications.length,
      },
      recentActivities: {
        timeEntries: timeEntriesToday.slice(0, 5),
        leaveApplications: leaveApplications,
      },
      leaveBalances: leaveBalances,
    };
  }

  async getPendingApprovals(role: string) {
    if (!['Manager', 'Admin', 'Super User', 'system_super_admin'].includes(role)) {
      return { 
        success: true, 
        pendingTimeEntries: [], 
        pendingLeaveApplications: [] 
      };
    }

    const pendingTimeEntries = await this.timeEntryRepo.find({
      where: {
        status: 'pending',
      },
      relations: ['user'],
      order: { clockInTime: 'DESC' },
      take: 10,
    });

    const pendingLeaveApplications = await this.leaveApplicationRepo.find({
      where: {
        status: 'pending',
      },
      relations: ['user', 'leaveType'],
      order: { createdAt: 'DESC' },
      take: 10,
    });

    return {
      success: true,
      pendingTimeEntries: pendingTimeEntries,
      pendingLeaveApplications: pendingLeaveApplications,
    };
  }

  async getRecentActivities(userId: number, role: string) {
    const activities = [];

    const recentTimeEntries = await this.timeEntryRepo.find({
      where: {
        userId: userId,
      },
      order: { clockInTime: 'DESC' },
      take: 5,
    });

    for (const entry of recentTimeEntries) {
      activities.push({
        type: 'time_entry',
        timestamp: entry.clockInTime,
        description: `Clocked ${entry.status}`,
        data: entry,
      });
    }

    const recentLeaveApps = await this.leaveApplicationRepo.find({
      where: {
        userId: userId,
      },
      relations: ['leaveType'],
      order: { createdAt: 'DESC' },
      take: 5,
    });

    for (const app of recentLeaveApps) {
      activities.push({
        type: 'leave_application',
        timestamp: app.createdAt || new Date(),
        description: `Leave application ${app.status}`,
        data: app,
      });
    }

    activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    return {
      success: true,
      activities: activities.slice(0, 10),
    };
  }

  async getDashboardConfig(userId: number) {
    const config = await this.dashboardConfigRepo.findOne({
      where: {
        createdBy: userId,
        isActive: true,
      },
      order: { updatedAt: 'DESC' },
    });

    return {
      success: true,
      config: config,
    };
  }

  async saveDashboardConfig(userId: number, configName: string, configData: any) {
    await this.dashboardConfigRepo.update(
      { createdBy: userId, isActive: true },
      { isActive: false }
    );

    const newConfig = this.dashboardConfigRepo.create({
      configName,
      configData: JSON.stringify(configData),
      createdBy: userId,
      isActive: true,
    });

    const savedConfig = await this.dashboardConfigRepo.save(newConfig);

    return {
      success: true,
      config: savedConfig,
    };
  }

  async getTeamStats(userId: number) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['department'],
    });

    if (!user || !user.departmentId) {
      return {
        success: false,
        message: 'User has no department assigned',
      };
    }

    const teamMembers = await this.userRepo
      .createQueryBuilder('user')
      .where('user.departmentId = :departmentId', { departmentId: user.departmentId })
      .andWhere('user.isActive = :isActive', { isActive: true })
      .getCount();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const teamTimeEntriesToday = await this.timeEntryRepo
      .createQueryBuilder('timeEntry')
      .innerJoin('timeEntry.user', 'user')
      .where('user.departmentId = :departmentId', { departmentId: user.departmentId })
      .andWhere('timeEntry.clockInTime >= :today', { today })
      .getCount();

    const teamPendingLeave = await this.leaveApplicationRepo
      .createQueryBuilder('leaveApp')
      .innerJoin('leaveApp.user', 'user')
      .where('user.departmentId = :departmentId', { departmentId: user.departmentId })
      .andWhere('leaveApp.status = :status', { status: 'pending' })
      .getCount();

    return {
      success: true,
      stats: {
        teamMembers,
        activeToday: teamTimeEntriesToday,
        pendingLeaveRequests: teamPendingLeave,
      },
    };
  }

  async getAttendanceSummary(userId: number, startDate: Date, endDate: Date) {
    const timeEntries = await this.timeEntryRepo
      .createQueryBuilder('timeEntry')
      .where('timeEntry.userId = :userId', { userId })
      .andWhere('timeEntry.clockInTime >= :startDate', { startDate })
      .andWhere('timeEntry.clockInTime <= :endDate', { endDate })
      .orderBy('timeEntry.clockInTime', 'DESC')
      .getMany();

    let totalHours = 0;
    let totalDays = 0;

    for (const entry of timeEntries) {
      if (entry.clockOutTime) {
        const hours = (entry.clockOutTime.getTime() - entry.clockInTime.getTime()) / (1000 * 60 * 60);
        totalHours += hours;
        totalDays++;
      }
    }

    return {
      success: true,
      summary: {
        totalDays,
        totalHours: Math.round(totalHours * 100) / 100,
        averageHoursPerDay: totalDays > 0 ? Math.round((totalHours / totalDays) * 100) / 100 : 0,
        entries: timeEntries,
      },
    };
  }

  async getLeaveSummary(userId: number, year?: number) {
    const currentYear = year || new Date().getFullYear();

    const leaveBalances = await this.leaveBalanceRepo.find({
      where: {
        userId: userId,
        year: currentYear,
      },
      relations: ['leaveType'],
    });

    const leaveApplications = await this.leaveApplicationRepo
      .createQueryBuilder('leaveApp')
      .where('leaveApp.userId = :userId', { userId })
      .andWhere('EXTRACT(YEAR FROM leaveApp.startDate) = :year', { year: currentYear })
      .leftJoinAndSelect('leaveApp.leaveType', 'leaveType')
      .orderBy('leaveApp.startDate', 'DESC')
      .getMany();

    return {
      success: true,
      summary: {
        year: currentYear,
        balances: leaveBalances,
        applications: leaveApplications,
      },
    };
  }
}
