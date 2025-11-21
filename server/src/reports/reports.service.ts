import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TimeEntry } from '../entities/time-entry.entity';
import { LeaveApplication } from '../entities/leave-application.entity';
import { PayCalculation } from '../entities/pay-calculation.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(TimeEntry)
    private timeEntryRepo: Repository<TimeEntry>,
    @InjectRepository(LeaveApplication)
    private leaveApplicationRepo: Repository<LeaveApplication>,
    @InjectRepository(PayCalculation)
    private payCalculationRepo: Repository<PayCalculation>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async getTimeEntryReport(startDate: Date, endDate: Date, userId?: number, departmentId?: number) {
    const where: any = {
      clock_in_time: {
        gte: startDate,
        lte: endDate,
      },
    };

    if (userId) where.user_id = userId;
    if (departmentId) {
      where.users_time_entries_user_idTousers = {
        department_id: departmentId,
      };
    }

    const entries = await this.timeEntryRepo.find({
      where,
      relations: {
        users_time_entries_user_idTousers: {
          select: {
            id: true,
            username: true,
            first_name: true,
            last_name: true,
            department_id: true,
          },
        },
      },
      order: { clock_in_time: 'desc' },
    });

    const totalHours = entries.reduce((sum: number, entry: any) => {
      if (entry.clock_in_time && entry.clock_out_time) {
        const hours = (entry.clock_out_time.getTime() - entry.clock_in_time.getTime()) / (1000 * 60 * 60);
        return sum + hours;
      }
      return sum;
    }, 0);

    return {
      success: true,
      entries,
      summary: {
        total_entries: entries.length,
        total_hours: totalHours.toFixed(2),
        period: { start: startDate, end: endDate },
      },
    };
  }

  async getLeaveReport(startDate: Date, endDate: Date, userId?: number, departmentId?: number) {
    const where: any = {
      start_date: {
        gte: startDate,
      },
      end_date: {
        lte: endDate,
      },
    };

    if (userId) where.user_id = userId;
    if (departmentId) {
      where.users_leave_applications_user_idTousers = {
        department_id: departmentId,
      };
    }

    const applications = await this.leaveApplicationRepo.find({
      where,
      relations: {
        users_leave_applications_user_idTousers: {
          select: {
            id: true,
            username: true,
            first_name: true,
            last_name: true,
            department_id: true,
          },
        },
        leave_types: true,
      },
      order: { start_date: 'desc' },
    });

    const totalDays = applications.reduce((sum, app) => {
      const days = Math.ceil((app.end_date.getTime() - app.start_date.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      return sum + days;
    }, 0);

    const byStatus = applications.reduce((acc: any, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    }, {});

    return {
      success: true,
      applications,
      summary: {
        total_applications: applications.length,
        total_days: totalDays,
        by_status: byStatus,
        period: { start: startDate, end: endDate },
      },
    };
  }

  async getAttendanceReport(startDate: Date, endDate: Date, departmentId?: number) {
    const where: any = {
      clock_in_time: {
        gte: startDate,
        lte: endDate,
      },
    };

    if (departmentId) {
      where.users_time_entries_user_idTousers = {
        department_id: departmentId,
      };
    }

    const entries = await this.timeEntryRepo.find({
      where,
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
    });

    const byUser = entries.reduce((acc: any, entry: any) => {
      const userId = entry.user_id;
      if (!acc[userId]) {
        acc[userId] = {
          user: entry.users_time_entries_user_idTousers,
          total_days: 0,
          total_hours: 0,
        };
      }
      acc[userId].total_days += 1;
      if (entry.clock_in_time && entry.clock_out_time) {
        const hours = (entry.clock_out_time.getTime() - entry.clock_in_time.getTime()) / (1000 * 60 * 60);
        acc[userId].total_hours += hours;
      }
      return acc;
    }, {});

    const summary = Object.values(byUser);

    return {
      success: true,
      attendance: summary,
      summary: {
        total_unique_employees: summary.length,
        total_attendance_records: entries.length,
        period: { start: startDate, end: endDate },
      },
    };
  }

  async getPayrollSummary(startDate: Date, endDate: Date, departmentId?: number) {
    const calculations = await this.payCalculationRepo.find({
      where: {
        pay_period_start: {
          gte: startDate,
        },
        pay_period_end: {
          lte: endDate,
        },
      },
      relations: {
        users_pay_calculations_user_idTousers: {
          select: {
            id: true,
            username: true,
            first_name: true,
            last_name: true,
            department_id: true,
          },
        },
      },
      order: { id: 'desc' },
    });

    const totalHours = calculations.reduce((sum: number, calc: any) => sum + Number(calc.total_hours || 0), 0);
    const totalAllowances = calculations.reduce((sum: number, calc: any) => sum + Number(calc.total_allowances || 0), 0);

    return {
      success: true,
      calculations,
      summary: {
        total_calculations: calculations.length,
        total_hours: totalHours.toFixed(2),
        total_allowances: totalAllowances.toFixed(2),
        period: { start: startDate, end: endDate },
      },
    };
  }

  convertToCSV(data: any[], headers: string[]): string {
    const headerRow = headers.join(',');
    const dataRows = data.map(row => {
      return headers.map(header => {
        const value = row[header] || '';
        return `"${String(value).replace(/"/g, '""')}"`;
      }).join(',');
    });
    return [headerRow, ...dataRows].join('\n');
  }
}
