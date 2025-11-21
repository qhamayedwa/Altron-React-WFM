import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TimeEntry } from '../entities/time-entry.entity';
import { LeaveApplication } from '../entities/leave-application.entity';
import { LeaveBalance } from '../entities/leave-balance.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(TimeEntry)
    private timeEntryRepo: Repository<TimeEntry>,
    @InjectRepository(LeaveApplication)
    private leaveApplicationRepo: Repository<LeaveApplication>,
    @InjectRepository(LeaveBalance)
    private leaveBalanceRepo: Repository<LeaveBalance>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async getDashboardStats(userId: number, role: string) {
    const today = new Date();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    const timeEntriesToday = await this.timeEntryRepo.find({
      where: {
        user_id: userId,
        clock_in_time: {
          gte: new Date(today.setHours(0, 0, 0, 0)),
        },
      },
    });

    const leaveApplications = await this.leaveApplicationRepo.find({
      where: {
        user_id: userId,
      },
      order: { created_at: 'desc' },
      take: 5,
    });

    const leaveBalances = await this.leaveBalanceRepo.find({
      where: {
        user_id: userId,
      },
      relations: {
        leave_types: true,
      },
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
        time_entries_today: timeEntriesToday.length,
        pending_approvals: pendingApprovals,
        leave_balances: leaveBalances.length,
        recent_leave_applications: leaveApplications.length,
      },
      recent_activities: {
        time_entries: timeEntriesToday.slice(0, 5),
        leave_applications: leaveApplications,
      },
      leave_balances: leaveBalances,
    };
  }

  async getPendingApprovals(role: string) {
    if (!['Manager', 'Admin', 'Super User', 'system_super_admin'].includes(role)) {
      return { success: true, pending_time_entries: [], pending_leave_applications: [] };
    }

    const pendingTimeEntries = await this.timeEntryRepo.find({
      where: {
        status: 'pending',
      },
      relations: {
        users_time_entries_user_idTousers: {
          select: {
            id: true,
            username: true,
            first_name: true,
            last_name: true,
          },
        },
      },
      order: { clock_in_time: 'desc' },
      take: 10,
    });

    const pendingLeaveApplications = await this.leaveApplicationRepo.find({
      where: {
        status: 'pending',
      },
      relations: {
        users_leave_applications_user_idTousers: {
          select: {
            id: true,
            username: true,
            first_name: true,
            last_name: true,
          },
        },
        leave_types: true,
      },
      order: { created_at: 'desc' },
      take: 10,
    });

    return {
      success: true,
      pending_time_entries: pendingTimeEntries,
      pending_leave_applications: pendingLeaveApplications,
    };
  }

  async getRecentActivities(userId: number, role: string) {
    const activities = [];

    const recentTimeEntries = await this.timeEntryRepo.find({
      where: {
        user_id: userId,
      },
      order: { clock_in_time: 'desc' },
      take: 5,
    });

    for (const entry of recentTimeEntries) {
      activities.push({
        type: 'time_entry',
        timestamp: entry.clock_in_time,
        description: `Clocked ${entry.status}`,
        data: entry,
      });
    }

    const recentLeaveApps = await this.leaveApplicationRepo.find({
      where: {
        user_id: userId,
      },
      order: { created_at: 'desc' },
      take: 5,
    });

    for (const app of recentLeaveApps) {
      activities.push({
        type: 'leave_application',
        timestamp: app.created_at || new Date(),
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
}
