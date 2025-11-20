import { PrismaService } from '../prisma/prisma.service';
import { CreateShiftTypeDto } from './dto/create-shift-type.dto';
import { UpdateShiftTypeDto } from './dto/update-shift-type.dto';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { CheckConflictsDto } from './dto/check-conflicts.dto';
export declare class SchedulingService {
    private prisma;
    constructor(prisma: PrismaService);
    getManagedDepartmentIds(userId: number): Promise<number[]>;
    createShiftType(dto: CreateShiftTypeDto): Promise<{
        id: number;
        created_at: Date | null;
        is_active: boolean | null;
        name: string;
        description: string | null;
        default_start_time: Date;
        default_end_time: Date;
    }>;
    getShiftTypes(activeOnly?: boolean): Promise<{
        id: number;
        created_at: Date | null;
        is_active: boolean | null;
        name: string;
        description: string | null;
        default_start_time: Date;
        default_end_time: Date;
    }[]>;
    getShiftType(id: number): Promise<{
        id: number;
        created_at: Date | null;
        is_active: boolean | null;
        name: string;
        description: string | null;
        default_start_time: Date;
        default_end_time: Date;
    }>;
    updateShiftType(id: number, dto: UpdateShiftTypeDto): Promise<{
        id: number;
        created_at: Date | null;
        is_active: boolean | null;
        name: string;
        description: string | null;
        default_start_time: Date;
        default_end_time: Date;
    }>;
    deleteShiftType(id: number): Promise<{
        id: number;
        created_at: Date | null;
        is_active: boolean | null;
        name: string;
        description: string | null;
        default_start_time: Date;
        default_end_time: Date;
    }>;
    getSchedules(userId: number, isSuperUser: boolean, managedDepartmentIds: number[], filters?: {
        user_id?: number;
        shift_type_id?: number;
        start_date?: string;
        end_date?: string;
        status?: string;
    }): Promise<({
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
    })[]>;
    getMySchedule(userId: number, startDate?: string, endDate?: string): Promise<({
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
    })[]>;
    checkConflicts(dto: CheckConflictsDto): Promise<{
        has_conflicts: boolean;
        conflicts: {
            id: number;
            start_time: Date;
            end_time: Date;
            shift_type: string;
        }[];
    }>;
    createSchedule(dto: CreateScheduleDto, assignedByManagerId: number, isSuperUser: boolean, managedDepartmentIds: number[]): Promise<{
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
    }>;
    updateSchedule(id: number, dto: UpdateScheduleDto, userId: number, isSuperUser: boolean, managedDepartmentIds: number[]): Promise<{
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
    }>;
    deleteSchedule(id: number, userId: number, isSuperUser: boolean, managedDepartmentIds: number[]): Promise<{
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
    }>;
}
