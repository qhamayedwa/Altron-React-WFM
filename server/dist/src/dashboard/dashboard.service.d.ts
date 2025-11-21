import { PrismaService } from '../prisma/prisma.service';
export declare class DashboardService {
    private prisma;
    constructor(prisma: PrismaService);
    getDashboardStats(userId: number, role: string): Promise<{
        success: boolean;
        stats: {
            time_entries_today: number;
            pending_approvals: number;
            leave_balances: number;
            recent_leave_applications: number;
        };
        recent_activities: {
            time_entries: {
                id: number;
                created_at: Date | null;
                notes: string | null;
                status: string;
                user_id: number;
                updated_at: Date | null;
                clock_in_time: Date;
                clock_out_time: Date | null;
                approved_by_manager_id: number | null;
                is_overtime_approved: boolean | null;
                clock_in_latitude: number | null;
                clock_in_longitude: number | null;
                clock_out_latitude: number | null;
                clock_out_longitude: number | null;
                break_start_time: Date | null;
                break_end_time: Date | null;
                total_break_minutes: number | null;
                absence_pay_code_id: number | null;
                absence_reason: string | null;
                absence_approved_by_id: number | null;
                absence_approved_at: Date | null;
                pay_code_id: number | null;
            }[];
            leave_applications: {
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
            }[];
        };
        leave_balances: ({
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
            user_id: number;
            updated_at: Date | null;
            leave_type_id: number;
            balance: number;
            accrued_this_year: number | null;
            used_this_year: number | null;
            last_accrual_date: Date | null;
            year: number;
        })[];
    }>;
    getPendingApprovals(role: string): Promise<{
        success: boolean;
        pending_time_entries: ({
            users_time_entries_user_idTousers: {
                id: number;
                username: string;
                first_name: string | null;
                last_name: string | null;
            };
        } & {
            id: number;
            created_at: Date | null;
            notes: string | null;
            status: string;
            user_id: number;
            updated_at: Date | null;
            clock_in_time: Date;
            clock_out_time: Date | null;
            approved_by_manager_id: number | null;
            is_overtime_approved: boolean | null;
            clock_in_latitude: number | null;
            clock_in_longitude: number | null;
            clock_out_latitude: number | null;
            clock_out_longitude: number | null;
            break_start_time: Date | null;
            break_end_time: Date | null;
            total_break_minutes: number | null;
            absence_pay_code_id: number | null;
            absence_reason: string | null;
            absence_approved_by_id: number | null;
            absence_approved_at: Date | null;
            pay_code_id: number | null;
        })[];
        pending_leave_applications: ({
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
        })[];
    }>;
    getRecentActivities(userId: number, role: string): Promise<{
        success: boolean;
        activities: ({
            type: string;
            timestamp: Date;
            description: string;
            data: {
                id: number;
                created_at: Date | null;
                notes: string | null;
                status: string;
                user_id: number;
                updated_at: Date | null;
                clock_in_time: Date;
                clock_out_time: Date | null;
                approved_by_manager_id: number | null;
                is_overtime_approved: boolean | null;
                clock_in_latitude: number | null;
                clock_in_longitude: number | null;
                clock_out_latitude: number | null;
                clock_out_longitude: number | null;
                break_start_time: Date | null;
                break_end_time: Date | null;
                total_break_minutes: number | null;
                absence_pay_code_id: number | null;
                absence_reason: string | null;
                absence_approved_by_id: number | null;
                absence_approved_at: Date | null;
                pay_code_id: number | null;
            };
        } | {
            type: string;
            timestamp: Date;
            description: string;
            data: {
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
        })[];
    }>;
}
