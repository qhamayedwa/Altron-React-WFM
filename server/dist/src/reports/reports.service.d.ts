import { PrismaService } from '../prisma/prisma.service';
export declare class ReportsService {
    private prisma;
    constructor(prisma: PrismaService);
    getTimeEntryReport(startDate: Date, endDate: Date, userId?: number, departmentId?: number): Promise<{
        success: boolean;
        entries: ({
            users_time_entries_user_idTousers: {
                id: number;
                username: string;
                first_name: string | null;
                last_name: string | null;
                department_id: number | null;
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
        summary: {
            total_entries: number;
            total_hours: string;
            period: {
                start: Date;
                end: Date;
            };
        };
    }>;
    getLeaveReport(startDate: Date, endDate: Date, userId?: number, departmentId?: number): Promise<{
        success: boolean;
        applications: ({
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
        summary: {
            total_applications: number;
            total_days: number;
            by_status: any;
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
            total_unique_employees: number;
            total_attendance_records: number;
            period: {
                start: Date;
                end: Date;
            };
        };
    }>;
    getPayrollSummary(startDate: Date, endDate: Date, departmentId?: number): Promise<{
        success: boolean;
        calculations: ({
            users_pay_calculations_user_idTousers: {
                id: number;
                username: string;
                first_name: string | null;
                last_name: string | null;
                department_id: number | null;
            };
        } & {
            id: number;
            user_id: number;
            pay_period_start: Date;
            pay_period_end: Date;
            regular_hours: number | null;
            pay_components: string;
            total_hours: number | null;
            overtime_hours: number | null;
            double_time_hours: number | null;
            total_allowances: number | null;
            calculated_at: Date | null;
            time_entry_id: number;
            calculated_by_id: number;
        })[];
        summary: {
            total_calculations: number;
            total_hours: string;
            total_allowances: string;
            period: {
                start: Date;
                end: Date;
            };
        };
    }>;
    convertToCSV(data: any[], headers: string[]): string;
}
