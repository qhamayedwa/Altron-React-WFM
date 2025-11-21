import { DashboardService } from './dashboard.service';
export declare class DashboardController {
    private readonly dashboardService;
    constructor(dashboardService: DashboardService);
    getDashboardStats(req: any): Promise<{
        success: boolean;
        stats: {
            timeEntriesToday: number;
            pendingApprovals: number;
            leaveBalances: number;
            recentLeaveApplications: number;
        };
        recentActivities: {
            timeEntries: import("../entities/time-entry.entity").TimeEntry[];
            leaveApplications: import("../entities/leave-application.entity").LeaveApplication[];
        };
        leaveBalances: import("../entities/leave-balance.entity").LeaveBalance[];
    }>;
    getPendingApprovals(req: any): Promise<{
        success: boolean;
        pendingTimeEntries: import("../entities/time-entry.entity").TimeEntry[];
        pendingLeaveApplications: import("../entities/leave-application.entity").LeaveApplication[];
    }>;
    getRecentActivities(req: any): Promise<{
        success: boolean;
        activities: ({
            type: string;
            timestamp: Date;
            description: string;
            data: import("../entities/time-entry.entity").TimeEntry;
        } | {
            type: string;
            timestamp: Date;
            description: string;
            data: import("../entities/leave-application.entity").LeaveApplication;
        })[];
    }>;
}
