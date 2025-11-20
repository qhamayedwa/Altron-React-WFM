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
            balances: ({
                leave_types: {
                    id: number;
                    name: string;
                    description: string | null;
                };
            } & {
                id: number;
                created_at: Date | null;
                user_id: number;
                updated_at: Date | null;
                leave_type_id: number;
                balance: number;
                accrued_this_year: number | null;
                used_this_year: number | null;
                last_accrual_date: Date | null;
                year: number;
            })[];
            leave_types: {
                id: number;
                created_at: Date | null;
                is_active: boolean | null;
                name: string;
                description: string | null;
                default_accrual_rate: number | null;
                requires_approval: boolean | null;
                max_consecutive_days: number | null;
            }[];
            current_year: number;
        };
        timestamp: string;
    }>;
    createLeaveApplication(req: any, dto: CreateLeaveApplicationDto): Promise<{
        success: boolean;
        data: {
            leave_types: {
                id: number;
                created_at: Date | null;
                is_active: boolean | null;
                name: string;
                description: string | null;
                default_accrual_rate: number | null;
                requires_approval: boolean | null;
                max_consecutive_days: number | null;
            };
            users_leave_applications_user_idTousers: {
                id: number;
                username: string;
                first_name: string | null;
                last_name: string | null;
            };
        } & {
            id: number;
            created_at: Date | null;
            start_date: Date;
            end_date: Date;
            status: string;
            user_id: number;
            updated_at: Date | null;
            leave_type_id: number;
            reason: string | null;
            is_hourly: boolean | null;
            hours_requested: number | null;
            manager_comments: string | null;
            manager_approved_id: number | null;
            approved_at: Date | null;
        };
        message: string;
        timestamp: string;
    }>;
    getMyApplications(req: any, dto: GetLeaveApplicationsDto): Promise<{
        success: boolean;
        data: {
            applications: ({
                leave_types: {
                    id: number;
                    name: string;
                };
                users_leave_applications_manager_approved_idTousers: {
                    id: number;
                    username: string;
                    first_name: string | null;
                    last_name: string | null;
                } | null;
            } & {
                id: number;
                created_at: Date | null;
                start_date: Date;
                end_date: Date;
                status: string;
                user_id: number;
                updated_at: Date | null;
                leave_type_id: number;
                reason: string | null;
                is_hourly: boolean | null;
                hours_requested: number | null;
                manager_comments: string | null;
                manager_approved_id: number | null;
                approved_at: Date | null;
            })[];
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
            applications: ({
                leave_types: {
                    id: number;
                    name: string;
                };
                users_leave_applications_manager_approved_idTousers: {
                    id: number;
                    username: string;
                    first_name: string | null;
                    last_name: string | null;
                } | null;
                users_leave_applications_user_idTousers: {
                    id: number;
                    username: string;
                    first_name: string | null;
                    last_name: string | null;
                    department_id: number | null;
                };
            } & {
                id: number;
                created_at: Date | null;
                start_date: Date;
                end_date: Date;
                status: string;
                user_id: number;
                updated_at: Date | null;
                leave_type_id: number;
                reason: string | null;
                is_hourly: boolean | null;
                hours_requested: number | null;
                manager_comments: string | null;
                manager_approved_id: number | null;
                approved_at: Date | null;
            })[];
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
        data: {
            leave_types: {
                id: number;
                created_at: Date | null;
                is_active: boolean | null;
                name: string;
                description: string | null;
                default_accrual_rate: number | null;
                requires_approval: boolean | null;
                max_consecutive_days: number | null;
            };
            users_leave_applications_user_idTousers: {
                id: number;
                username: string;
                first_name: string | null;
                last_name: string | null;
            };
        } & {
            id: number;
            created_at: Date | null;
            start_date: Date;
            end_date: Date;
            status: string;
            user_id: number;
            updated_at: Date | null;
            leave_type_id: number;
            reason: string | null;
            is_hourly: boolean | null;
            hours_requested: number | null;
            manager_comments: string | null;
            manager_approved_id: number | null;
            approved_at: Date | null;
        };
        message: string;
        timestamp: string;
    }>;
    rejectApplication(req: any, id: number, dto: UpdateLeaveApplicationDto): Promise<{
        success: boolean;
        data: {
            leave_types: {
                id: number;
                created_at: Date | null;
                is_active: boolean | null;
                name: string;
                description: string | null;
                default_accrual_rate: number | null;
                requires_approval: boolean | null;
                max_consecutive_days: number | null;
            };
            users_leave_applications_user_idTousers: {
                id: number;
                username: string;
                first_name: string | null;
                last_name: string | null;
            };
        } & {
            id: number;
            created_at: Date | null;
            start_date: Date;
            end_date: Date;
            status: string;
            user_id: number;
            updated_at: Date | null;
            leave_type_id: number;
            reason: string | null;
            is_hourly: boolean | null;
            hours_requested: number | null;
            manager_comments: string | null;
            manager_approved_id: number | null;
            approved_at: Date | null;
        };
        message: string;
        timestamp: string;
    }>;
    cancelApplication(req: any, id: number): Promise<{
        success: boolean;
        data: {
            leave_types: {
                id: number;
                created_at: Date | null;
                is_active: boolean | null;
                name: string;
                description: string | null;
                default_accrual_rate: number | null;
                requires_approval: boolean | null;
                max_consecutive_days: number | null;
            };
        } & {
            id: number;
            created_at: Date | null;
            start_date: Date;
            end_date: Date;
            status: string;
            user_id: number;
            updated_at: Date | null;
            leave_type_id: number;
            reason: string | null;
            is_hourly: boolean | null;
            hours_requested: number | null;
            manager_comments: string | null;
            manager_approved_id: number | null;
            approved_at: Date | null;
        };
        message: string;
        timestamp: string;
    }>;
    getLeaveTypes(): Promise<{
        success: boolean;
        data: {
            id: number;
            created_at: Date | null;
            is_active: boolean | null;
            name: string;
            description: string | null;
            default_accrual_rate: number | null;
            requires_approval: boolean | null;
            max_consecutive_days: number | null;
        }[];
        timestamp: string;
    }>;
    getLeaveType(id: number): Promise<{
        success: boolean;
        data: {
            leave_type: {
                id: number;
                created_at: Date | null;
                is_active: boolean | null;
                name: string;
                description: string | null;
                default_accrual_rate: number | null;
                requires_approval: boolean | null;
                max_consecutive_days: number | null;
            };
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
        data: {
            id: number;
            created_at: Date | null;
            is_active: boolean | null;
            name: string;
            description: string | null;
            default_accrual_rate: number | null;
            requires_approval: boolean | null;
            max_consecutive_days: number | null;
        };
        message: string;
        timestamp: string;
    }>;
    updateLeaveType(id: number, dto: UpdateLeaveTypeDto): Promise<{
        success: boolean;
        data: {
            id: number;
            created_at: Date | null;
            is_active: boolean | null;
            name: string;
            description: string | null;
            default_accrual_rate: number | null;
            requires_approval: boolean | null;
            max_consecutive_days: number | null;
        };
        message: string;
        timestamp: string;
    }>;
    getLeaveBalances(year?: string, userId?: string, leaveTypeId?: string): Promise<{
        success: boolean;
        data: ({
            leave_types: {
                id: number;
                name: string;
            };
            users: {
                id: number;
                username: string;
                first_name: string | null;
                last_name: string | null;
            };
        } & {
            id: number;
            created_at: Date | null;
            user_id: number;
            updated_at: Date | null;
            leave_type_id: number;
            balance: number;
            accrued_this_year: number | null;
            used_this_year: number | null;
            last_accrual_date: Date | null;
            year: number;
        })[];
        timestamp: string;
    }>;
    adjustLeaveBalance(id: number, dto: AdjustLeaveBalanceDto): Promise<{
        success: boolean;
        data: {
            id: number;
            created_at: Date | null;
            user_id: number;
            updated_at: Date | null;
            leave_type_id: number;
            balance: number;
            accrued_this_year: number | null;
            used_this_year: number | null;
            last_accrual_date: Date | null;
            year: number;
        };
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
