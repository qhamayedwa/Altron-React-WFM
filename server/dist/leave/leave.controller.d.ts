import { LeaveService } from './leave.service';
import { CreateLeaveApplicationDto } from './dto/create-leave-application.dto';
import { UpdateLeaveApplicationDto } from './dto/update-leave-application.dto';
import { GetLeaveApplicationsDto } from './dto/get-leave-applications.dto';
import { CreateLeaveTypeDto } from './dto/create-leave-type.dto';
import { UpdateLeaveTypeDto } from './dto/update-leave-type.dto';
import { AdjustLeaveBalanceDto } from './dto/adjust-leave-balance.dto';
export declare class LeaveController {
    private readonly leaveService;
    constructor(leaveService: LeaveService);
    getMyLeaveBalances(req: any): Promise<{
        success: boolean;
        data: {
            balances: import("../entities/leave-balance.entity").LeaveBalance[];
            leave_types: import("../entities/leave-type.entity").LeaveType[];
            current_year: number;
        };
        timestamp: string;
    }>;
    createLeaveApplication(req: any, dto: CreateLeaveApplicationDto): Promise<{
        success: boolean;
        data: import("../entities/leave-application.entity").LeaveApplication | null;
        message: string;
        timestamp: string;
    }>;
    getMyApplications(req: any, dto: GetLeaveApplicationsDto): Promise<{
        success: boolean;
        data: {
            applications: import("../entities/leave-application.entity").LeaveApplication[];
            pagination: {
                page: number;
                per_page: number;
                total: number;
                total_pages: number;
            };
        };
        timestamp: string;
    }>;
    getTeamApplications(req: any, dto: GetLeaveApplicationsDto): Promise<{
        success: boolean;
        data: {
            applications: import("../entities/leave-application.entity").LeaveApplication[];
            pagination: {
                page: number;
                per_page: number;
                total: number;
                total_pages: number;
            };
        };
        timestamp: string;
    }>;
    approveApplication(req: any, id: number, dto: UpdateLeaveApplicationDto): Promise<{
        success: boolean;
        data: import("../entities/leave-application.entity").LeaveApplication | null;
        message: string;
        timestamp: string;
    }>;
    rejectApplication(req: any, id: number, dto: UpdateLeaveApplicationDto): Promise<{
        success: boolean;
        data: import("../entities/leave-application.entity").LeaveApplication | null;
        message: string;
        timestamp: string;
    }>;
    cancelApplication(req: any, id: number): Promise<{
        success: boolean;
        data: import("../entities/leave-application.entity").LeaveApplication | null;
        message: string;
        timestamp: string;
    }>;
    getLeaveTypes(): Promise<{
        success: boolean;
        data: import("../entities/leave-type.entity").LeaveType[];
        timestamp: string;
    }>;
    getLeaveType(id: number): Promise<{
        success: boolean;
        data: {
            leave_type: import("../entities/leave-type.entity").LeaveType;
            statistics: {
                total_applications: number;
                pending_applications: number;
                approved_applications: number;
            };
        };
        timestamp: string;
    }>;
    createLeaveType(dto: CreateLeaveTypeDto): Promise<{
        success: boolean;
        data: import("../entities/leave-type.entity").LeaveType[];
        message: string;
        timestamp: string;
    }>;
    updateLeaveType(id: number, dto: UpdateLeaveTypeDto): Promise<{
        success: boolean;
        data: import("../entities/leave-type.entity").LeaveType | null;
        message: string;
        timestamp: string;
    }>;
    getLeaveBalances(year?: string, userId?: string, leaveTypeId?: string): Promise<{
        success: boolean;
        data: import("../entities/leave-balance.entity").LeaveBalance[];
        timestamp: string;
    }>;
    adjustLeaveBalance(id: number, dto: AdjustLeaveBalanceDto): Promise<{
        success: boolean;
        data: import("../entities/leave-balance.entity").LeaveBalance | null;
        message: string;
        timestamp: string;
    }>;
    runAccrual(): Promise<{
        success: boolean;
        data: {
            users_processed: number;
            accrual_date: Date;
        };
        message: string;
        timestamp: string;
    }>;
}
