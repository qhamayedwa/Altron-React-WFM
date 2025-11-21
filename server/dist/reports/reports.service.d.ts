import { Repository } from 'typeorm';
import { TimeEntry } from '../entities/time-entry.entity';
import { LeaveApplication } from '../entities/leave-application.entity';
import { PayCalculation } from '../entities/pay-calculation.entity';
import { User } from '../entities/user.entity';
import { Department } from '../entities/department.entity';
export declare class ReportsService {
    private timeEntryRepo;
    private leaveApplicationRepo;
    private payCalculationRepo;
    private userRepo;
    private departmentRepo;
    constructor(timeEntryRepo: Repository<TimeEntry>, leaveApplicationRepo: Repository<LeaveApplication>, payCalculationRepo: Repository<PayCalculation>, userRepo: Repository<User>, departmentRepo: Repository<Department>);
    getTimeEntryReport(startDate: Date, endDate: Date, userId?: number, departmentId?: number): Promise<{
        success: boolean;
        entries: {
            id: number;
            userId: number;
            clockInTime: Date;
            clockOutTime: Date | undefined;
            status: string;
            notes: string | undefined;
            user: {
                id: number;
                username: string;
                firstName: string | undefined;
                lastName: string | undefined;
                departmentId: number | undefined;
            } | null;
        }[];
        summary: {
            totalEntries: number;
            totalHours: string;
            period: {
                start: Date;
                end: Date;
            };
        };
    }>;
    getLeaveReport(startDate: Date, endDate: Date, userId?: number, departmentId?: number): Promise<{
        success: boolean;
        applications: {
            id: number;
            userId: number;
            leaveTypeId: number;
            startDate: Date;
            endDate: Date;
            reason: string | undefined;
            status: string;
            isHourly: boolean;
            hoursRequested: number | undefined;
            user: {
                id: number;
                username: string;
                firstName: string | undefined;
                lastName: string | undefined;
                departmentId: number | undefined;
            } | null;
            leaveType: {
                id: number;
                name: string;
            } | null;
        }[];
        summary: {
            totalApplications: number;
            totalDays: number;
            byStatus: any;
            period: {
                start: Date;
                end: Date;
            };
        };
    }>;
    getAttendanceReport(startDate: Date, endDate: Date, departmentId?: number): Promise<{
        success: boolean;
        attendance: unknown[];
        summary: {
            totalUniqueEmployees: number;
            totalAttendanceRecords: number;
            period: {
                start: Date;
                end: Date;
            };
        };
    }>;
    getPayrollSummary(startDate: Date, endDate: Date, departmentId?: number): Promise<{
        success: boolean;
        calculations: {
            id: number;
            userId: number;
            timeEntryId: number;
            payPeriodStart: Date;
            payPeriodEnd: Date;
            payComponents: string;
            totalHours: number | undefined;
            regularHours: number | undefined;
            overtimeHours: number | undefined;
            doubleTimeHours: number | undefined;
            totalAllowances: number | undefined;
            user: {
                id: number;
                username: string;
                firstName: string | undefined;
                lastName: string | undefined;
                departmentId: number | undefined;
            } | null;
        }[];
        summary: {
            totalCalculations: number;
            totalHours: string;
            totalAllowances: string;
            period: {
                start: Date;
                end: Date;
            };
        };
    }>;
    convertToCSV(data: any[], headers: string[]): string;
}
