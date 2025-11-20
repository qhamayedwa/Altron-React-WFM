import { PrismaService } from '../prisma/prisma.service';
import { CreateLeaveApplicationDto } from './dto/create-leave-application.dto';
import { UpdateLeaveApplicationDto } from './dto/update-leave-application.dto';
import { GetLeaveApplicationsDto } from './dto/get-leave-applications.dto';
import { CreateLeaveTypeDto } from './dto/create-leave-type.dto';
import { UpdateLeaveTypeDto } from './dto/update-leave-type.dto';
import { AdjustLeaveBalanceDto } from './dto/adjust-leave-balance.dto';
export declare class LeaveService {
    private prisma;
    constructor(prisma: PrismaService);
    getManagedDepartmentIds(userId: number): Promise<number[]>;
    getMyLeaveBalances(userId: number): Promise<{
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
    }>;
    createLeaveApplication(userId: number, dto: CreateLeaveApplicationDto, applierId: number, isPrivileged: boolean, managedDepartmentIds: number[]): Promise<{
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
    }>;
    getMyApplications(userId: number, dto: GetLeaveApplicationsDto): Promise<{
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
    }>;
    getTeamApplications(userId: number, dto: GetLeaveApplicationsDto, isPrivileged: boolean, managedDepartmentIds: number[]): Promise<{
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
    }>;
    approveApplication(applicationId: number, approverId: number, dto: UpdateLeaveApplicationDto, isPrivileged: boolean, managedDepartmentIds: number[]): Promise<{
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
    }>;
    rejectApplication(applicationId: number, approverId: number, dto: UpdateLeaveApplicationDto, isPrivileged: boolean, managedDepartmentIds: number[]): Promise<{
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
    }>;
    cancelApplication(applicationId: number, userId: number): Promise<{
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
    }>;
    getLeaveTypes(): Promise<{
        id: number;
        created_at: Date | null;
        is_active: boolean | null;
        name: string;
        description: string | null;
        default_accrual_rate: number | null;
        requires_approval: boolean | null;
        max_consecutive_days: number | null;
    }[]>;
    getLeaveType(id: number): Promise<{
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
    }>;
    createLeaveType(dto: CreateLeaveTypeDto): Promise<{
        id: number;
        created_at: Date | null;
        is_active: boolean | null;
        name: string;
        description: string | null;
        default_accrual_rate: number | null;
        requires_approval: boolean | null;
        max_consecutive_days: number | null;
    }>;
    updateLeaveType(id: number, dto: UpdateLeaveTypeDto): Promise<{
        id: number;
        created_at: Date | null;
        is_active: boolean | null;
        name: string;
        description: string | null;
        default_accrual_rate: number | null;
        requires_approval: boolean | null;
        max_consecutive_days: number | null;
    }>;
    getLeaveBalances(year?: number, userId?: number, leaveTypeId?: number): Promise<({
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
    })[]>;
    adjustLeaveBalance(balanceId: number, dto: AdjustLeaveBalanceDto): Promise<{
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
    }>;
    runAccrual(): Promise<{
        users_processed: number;
        accrual_date: Date;
    }>;
}
