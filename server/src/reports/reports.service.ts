import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { TimeEntry } from '../entities/time-entry.entity';
import { LeaveApplication } from '../entities/leave-application.entity';
import { PayCalculation } from '../entities/pay-calculation.entity';
import { User } from '../entities/user.entity';
import { Department } from '../entities/department.entity';

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
    @InjectRepository(Department)
    private departmentRepo: Repository<Department>,
  ) {}

  async getTimeEntryReport(startDate: Date, endDate: Date, userId?: number, departmentId?: number) {
    const queryBuilder = this.timeEntryRepo
      .createQueryBuilder('timeEntry')
      .leftJoinAndSelect('timeEntry.user', 'user')
      .leftJoinAndSelect('user.department', 'department')
      .where('timeEntry.clockInTime BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });

    if (userId) {
      queryBuilder.andWhere('timeEntry.userId = :userId', { userId });
    }

    if (departmentId) {
      queryBuilder.andWhere('user.departmentId = :departmentId', { departmentId });
    }

    const entries = await queryBuilder
      .orderBy('timeEntry.clockInTime', 'DESC')
      .getMany();

    const totalHours = entries.reduce((sum: number, entry: TimeEntry) => {
      if (entry.clockInTime && entry.clockOutTime) {
        const hours = (entry.clockOutTime.getTime() - entry.clockInTime.getTime()) / (1000 * 60 * 60);
        return sum + hours;
      }
      return sum;
    }, 0);

    return {
      success: true,
      entries: entries.map(entry => ({
        id: entry.id,
        userId: entry.userId,
        clockInTime: entry.clockInTime,
        clockOutTime: entry.clockOutTime,
        status: entry.status,
        notes: entry.notes,
        user: entry.user ? {
          id: entry.user.id,
          username: entry.user.username,
          firstName: entry.user.firstName,
          lastName: entry.user.lastName,
          departmentId: entry.user.departmentId,
        } : null,
      })),
      summary: {
        totalEntries: entries.length,
        totalHours: totalHours.toFixed(2),
        period: { start: startDate, end: endDate },
      },
    };
  }

  async getLeaveReport(startDate: Date, endDate: Date, userId?: number, departmentId?: number) {
    const queryBuilder = this.leaveApplicationRepo
      .createQueryBuilder('leave')
      .leftJoinAndSelect('leave.user', 'user')
      .leftJoinAndSelect('leave.leaveType', 'leaveType')
      .leftJoinAndSelect('user.department', 'department')
      .where('leave.startDate >= :startDate', { startDate })
      .andWhere('leave.endDate <= :endDate', { endDate });

    if (userId) {
      queryBuilder.andWhere('leave.userId = :userId', { userId });
    }

    if (departmentId) {
      queryBuilder.andWhere('user.departmentId = :departmentId', { departmentId });
    }

    const applications = await queryBuilder
      .orderBy('leave.startDate', 'DESC')
      .getMany();

    const totalDays = applications.reduce((sum, app) => {
      const days = Math.ceil((app.endDate.getTime() - app.startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      return sum + days;
    }, 0);

    const byStatus = applications.reduce((acc: any, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    }, {});

    return {
      success: true,
      applications: applications.map(app => ({
        id: app.id,
        userId: app.userId,
        leaveTypeId: app.leaveTypeId,
        startDate: app.startDate,
        endDate: app.endDate,
        reason: app.reason,
        status: app.status,
        isHourly: app.isHourly,
        hoursRequested: app.hoursRequested,
        user: app.user ? {
          id: app.user.id,
          username: app.user.username,
          firstName: app.user.firstName,
          lastName: app.user.lastName,
          departmentId: app.user.departmentId,
        } : null,
        leaveType: app.leaveType ? {
          id: app.leaveType.id,
          name: app.leaveType.name,
        } : null,
      })),
      summary: {
        totalApplications: applications.length,
        totalDays,
        byStatus,
        period: { start: startDate, end: endDate },
      },
    };
  }

  async getAttendanceReport(startDate: Date, endDate: Date, departmentId?: number) {
    const queryBuilder = this.timeEntryRepo
      .createQueryBuilder('timeEntry')
      .leftJoinAndSelect('timeEntry.user', 'user')
      .where('timeEntry.clockInTime BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });

    if (departmentId) {
      queryBuilder.andWhere('user.departmentId = :departmentId', { departmentId });
    }

    const entries = await queryBuilder.getMany();

    const byUser = entries.reduce((acc: any, entry: TimeEntry) => {
      const userId = entry.userId;
      if (!acc[userId]) {
        acc[userId] = {
          user: entry.user ? {
            id: entry.user.id,
            username: entry.user.username,
            firstName: entry.user.firstName,
            lastName: entry.user.lastName,
          } : null,
          totalDays: 0,
          totalHours: 0,
        };
      }
      acc[userId].totalDays += 1;
      if (entry.clockInTime && entry.clockOutTime) {
        const hours = (entry.clockOutTime.getTime() - entry.clockInTime.getTime()) / (1000 * 60 * 60);
        acc[userId].totalHours += hours;
      }
      return acc;
    }, {});

    const attendance = Object.values(byUser);

    return {
      success: true,
      attendance,
      summary: {
        totalUniqueEmployees: attendance.length,
        totalAttendanceRecords: entries.length,
        period: { start: startDate, end: endDate },
      },
    };
  }

  async getPayrollSummary(startDate: Date, endDate: Date, departmentId?: number) {
    const queryBuilder = this.payCalculationRepo
      .createQueryBuilder('calc')
      .leftJoinAndSelect('calc.user', 'user')
      .leftJoinAndSelect('user.department', 'department')
      .where('calc.payPeriodStart >= :startDate', { startDate })
      .andWhere('calc.payPeriodEnd <= :endDate', { endDate });

    if (departmentId) {
      queryBuilder.andWhere('user.departmentId = :departmentId', { departmentId });
    }

    const calculations = await queryBuilder
      .orderBy('calc.id', 'DESC')
      .getMany();

    const totalHours = calculations.reduce((sum: number, calc: PayCalculation) => sum + Number(calc.totalHours || 0), 0);
    const totalAllowances = calculations.reduce((sum: number, calc: PayCalculation) => sum + Number(calc.totalAllowances || 0), 0);

    return {
      success: true,
      calculations: calculations.map(calc => ({
        id: calc.id,
        userId: calc.userId,
        timeEntryId: calc.timeEntryId,
        payPeriodStart: calc.payPeriodStart,
        payPeriodEnd: calc.payPeriodEnd,
        payComponents: calc.payComponents,
        totalHours: calc.totalHours,
        regularHours: calc.regularHours,
        overtimeHours: calc.overtimeHours,
        doubleTimeHours: calc.doubleTimeHours,
        totalAllowances: calc.totalAllowances,
        user: calc.user ? {
          id: calc.user.id,
          username: calc.user.username,
          firstName: calc.user.firstName,
          lastName: calc.user.lastName,
          departmentId: calc.user.departmentId,
        } : null,
      })),
      summary: {
        totalCalculations: calculations.length,
        totalHours: totalHours.toFixed(2),
        totalAllowances: totalAllowances.toFixed(2),
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
