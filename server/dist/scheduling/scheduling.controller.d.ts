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
        data: import("../entities/shift-type.entity").ShiftType;
        message: string;
        timestamp: string;
    }>;
    getShiftTypes(includeInactive?: string): Promise<{
        success: boolean;
        data: import("../entities/shift-type.entity").ShiftType[];
        message: string;
        timestamp: string;
    }>;
    getShiftType(id: string): Promise<{
        success: boolean;
        data: import("../entities/shift-type.entity").ShiftType;
        message: string;
        timestamp: string;
    }>;
    updateShiftType(id: string, dto: UpdateShiftTypeDto): Promise<{
        success: boolean;
        data: import("../entities/shift-type.entity").ShiftType;
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
        data: import("../entities/schedule.entity").Schedule[];
        message: string;
        timestamp: string;
    }>;
    getMySchedule(req: any, startDate?: string, endDate?: string): Promise<{
        success: boolean;
        data: import("../entities/schedule.entity").Schedule[];
        message: string;
        timestamp: string;
    }>;
    createSchedule(req: any, dto: CreateScheduleDto): Promise<{
        success: boolean;
        data: {
            created_count: number;
            conflict_count: number;
            conflict_employees: string[];
            schedules: import("../entities/schedule.entity").Schedule[];
            batch_id: string | null;
        };
        message: string;
        timestamp: string;
    }>;
    updateSchedule(req: any, id: string, dto: UpdateScheduleDto): Promise<{
        success: boolean;
        data: import("../entities/schedule.entity").Schedule | null;
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
