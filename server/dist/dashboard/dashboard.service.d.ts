import { Repository } from 'typeorm';
import { TimeEntry } from '../entities/time-entry.entity';
import { LeaveApplication } from '../entities/leave-application.entity';
import { LeaveBalance } from '../entities/leave-balance.entity';
import { User } from '../entities/user.entity';
import { DashboardConfig } from '../entities/dashboard-config.entity';
import { Department } from '../entities/department.entity';
export declare class DashboardService {
    private dashboardConfigRepo;
    private userRepo;
    private timeEntryRepo;
    private leaveApplicationRepo;
    private leaveBalanceRepo;
    private departmentRepo;
    constructor(dashboardConfigRepo: Repository<DashboardConfig>, userRepo: Repository<User>, timeEntryRepo: Repository<TimeEntry>, leaveApplicationRepo: Repository<LeaveApplication>, leaveBalanceRepo: Repository<LeaveBalance>, departmentRepo: Repository<Department>);
    getDashboardStats(userId: number, role: string): Promise<{
        success: boolean;
        stats: {
            timeEntriesToday: number;
            pendingApprovals: number;
            leaveBalances: number;
            recentLeaveApplications: number;
        };
        recentActivities: {
            timeEntries: TimeEntry[];
            leaveApplications: LeaveApplication[];
        };
        leaveBalances: LeaveBalance[];
    }>;
    getPendingApprovals(role: string): Promise<{
        success: boolean;
        pendingTimeEntries: TimeEntry[];
        pendingLeaveApplications: LeaveApplication[];
    }>;
    getRecentActivities(userId: number, role: string): Promise<{
        success: boolean;
        activities: ({
            type: string;
            timestamp: Date;
            description: string;
            data: TimeEntry;
        } | {
            type: string;
            timestamp: Date;
            description: string;
            data: LeaveApplication;
        })[];
    }>;
    getDashboardConfig(userId: number): Promise<{
        success: boolean;
        config: DashboardConfig | null;
    }>;
    saveDashboardConfig(userId: number, configName: string, configData: any): Promise<{
        success: boolean;
        config: DashboardConfig;
    }>;
    getTeamStats(userId: number): Promise<{
        success: boolean;
        message: string;
        stats?: undefined;
    } | {
        success: boolean;
        stats: {
            teamMembers: number;
            activeToday: number;
            pendingLeaveRequests: number;
        };
        message?: undefined;
    }>;
    getAttendanceSummary(userId: number, startDate: Date, endDate: Date): Promise<{
        success: boolean;
        summary: {
            totalDays: number;
            totalHours: number;
            averageHoursPerDay: number;
            entries: TimeEntry[];
        };
    }>;
    getLeaveSummary(userId: number, year?: number): Promise<{
        success: boolean;
        summary: {
            year: number;
            balances: LeaveBalance[];
            applications: LeaveApplication[];
        };
    }>;
}
