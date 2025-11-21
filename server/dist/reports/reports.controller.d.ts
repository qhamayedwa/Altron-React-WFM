import { ReportsService } from './reports.service';
export declare class ReportsController {
    private readonly reportsService;
    constructor(reportsService: ReportsService);
    getTimeEntryReport(startDate: string, endDate: string, userId?: string, departmentId?: string): Promise<{
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
    getTimeEntryReportCSV(startDate: string, endDate: string, userId?: string, departmentId?: string): Promise<string>;
    getLeaveReport(startDate: string, endDate: string, userId?: string, departmentId?: string): Promise<{
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
    getLeaveReportCSV(startDate: string, endDate: string, userId?: string, departmentId?: string): Promise<string>;
    getAttendanceReport(startDate: string, endDate: string, departmentId?: string): Promise<{
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
    getPayrollSummary(startDate: string, endDate: string, departmentId?: string): Promise<{
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
}
