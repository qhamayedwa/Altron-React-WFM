import { SchedulingService } from './scheduling.service';
import { CreateShiftTypeDto } from './dto/create-shift-type.dto';
import { UpdateShiftTypeDto } from './dto/update-shift-type.dto';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { CheckConflictsDto } from './dto/check-conflicts.dto';
export declare class SchedulingController {
    private readonly schedulingService;
    constructor(schedulingService: SchedulingService);
    createShiftType(dto: CreateShiftTypeDto): Promise<{
        success: boolean;
        data: {
            id: number;
            created_at: Date | null;
            is_active: boolean | null;
            name: string;
            description: string | null;
            default_start_time: Date;
            default_end_time: Date;
        };
        message: string;
        timestamp: string;
    }>;
    getShiftTypes(includeInactive?: string): Promise<{
        success: boolean;
        data: {
            id: number;
            created_at: Date | null;
            is_active: boolean | null;
            name: string;
            description: string | null;
            default_start_time: Date;
            default_end_time: Date;
        }[];
        message: string;
        timestamp: string;
    }>;
    getShiftType(id: string): Promise<{
        success: boolean;
        data: {
            id: number;
            created_at: Date | null;
            is_active: boolean | null;
            name: string;
            description: string | null;
            default_start_time: Date;
            default_end_time: Date;
        };
        message: string;
        timestamp: string;
    }>;
    updateShiftType(id: string, dto: UpdateShiftTypeDto): Promise<{
        success: boolean;
        data: {
            id: number;
            created_at: Date | null;
            is_active: boolean | null;
            name: string;
            description: string | null;
            default_start_time: Date;
            default_end_time: Date;
        };
        message: string;
        timestamp: string;
    }>;
    deleteShiftType(id: string): Promise<{
        success: boolean;
        message: string;
        timestamp: string;
    }>;
    getSchedules(req: any, userId?: string, shiftTypeId?: string, startDate?: string, endDate?: string, status?: string): Promise<{
        success: boolean;
        data: ({
            shift_types: {
                id: number;
                name: string;
            } | null;
            users_schedules_assigned_by_manager_idTousers: {
                id: number;
                username: string;
                first_name: string | null;
                last_name: string | null;
            };
            users_schedules_user_idTousers: {
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
            shift_type_id: number | null;
            start_time: Date;
            end_time: Date;
            assigned_by_manager_id: number;
            pay_rule_link_id: number | null;
            batch_id: string | null;
        })[];
        message: string;
        timestamp: string;
    }>;
    getMySchedule(req: any, startDate?: string, endDate?: string): Promise<{
        success: boolean;
        data: ({
            shift_types: {
                id: number;
                name: string;
            } | null;
        } & {
            id: number;
            created_at: Date | null;
            notes: string | null;
            status: string;
            user_id: number;
            updated_at: Date | null;
            shift_type_id: number | null;
            start_time: Date;
            end_time: Date;
            assigned_by_manager_id: number;
            pay_rule_link_id: number | null;
            batch_id: string | null;
        })[];
        message: string;
        timestamp: string;
    }>;
    createSchedule(req: any, dto: CreateScheduleDto): Promise<{
        success: boolean;
        data: {
            created_count: number;
            conflict_count: number;
            conflict_employees: string[];
            schedules: {
                id: number;
                created_at: Date | null;
                notes: string | null;
                status: string;
                user_id: number;
                updated_at: Date | null;
                shift_type_id: number | null;
                start_time: Date;
                end_time: Date;
                assigned_by_manager_id: number;
                pay_rule_link_id: number | null;
                batch_id: string | null;
            }[];
            batch_id: string | null;
        };
        message: string;
        timestamp: string;
    }>;
    updateSchedule(req: any, id: string, dto: UpdateScheduleDto): Promise<{
        success: boolean;
        data: {
            id: number;
            created_at: Date | null;
            notes: string | null;
            status: string;
            user_id: number;
            updated_at: Date | null;
            shift_type_id: number | null;
            start_time: Date;
            end_time: Date;
            assigned_by_manager_id: number;
            pay_rule_link_id: number | null;
            batch_id: string | null;
        };
        message: string;
        timestamp: string;
    }>;
    deleteSchedule(req: any, id: string): Promise<{
        success: boolean;
        message: string;
        timestamp: string;
    }>;
    checkConflicts(dto: CheckConflictsDto): Promise<{
        success: boolean;
        data: {
            has_conflicts: boolean;
            conflicts: {
                id: number;
                start_time: Date;
                end_time: Date;
                shift_type: string;
            }[];
        };
        message: string;
        timestamp: string;
    }>;
}
