import { Repository } from 'typeorm';
import { Department } from '../entities/department.entity';
import { Schedule } from '../entities/schedule.entity';
import { ShiftType } from '../entities/shift-type.entity';
import { User } from '../entities/user.entity';
import { CreateShiftTypeDto } from './dto/create-shift-type.dto';
import { UpdateShiftTypeDto } from './dto/update-shift-type.dto';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { CheckConflictsDto } from './dto/check-conflicts.dto';
export declare class SchedulingService {
    private departmentRepo;
    private scheduleRepo;
    private shiftTypeRepo;
    private userRepo;
    constructor(departmentRepo: Repository<Department>, scheduleRepo: Repository<Schedule>, shiftTypeRepo: Repository<ShiftType>, userRepo: Repository<User>);
    getManagedDepartmentIds(userId: number): Promise<number[]>;
    createShiftType(dto: CreateShiftTypeDto): Promise<ShiftType>;
    getShiftTypes(activeOnly?: boolean): Promise<ShiftType[]>;
    getShiftType(id: number): Promise<ShiftType>;
    updateShiftType(id: number, dto: UpdateShiftTypeDto): Promise<ShiftType>;
    deleteShiftType(id: number): Promise<{
        message: string;
    }>;
    getSchedules(userId: number, isSuperUser: boolean, managedDepartmentIds: number[], filters?: {
        user_id?: number;
        shift_type_id?: number;
        start_date?: string;
        end_date?: string;
        status?: string;
    }): Promise<Schedule[]>;
    getMySchedule(userId: number, startDate?: string, endDate?: string): Promise<Schedule[]>;
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
        schedules: Schedule[];
        batch_id: string | null;
    }>;
    updateSchedule(id: number, dto: UpdateScheduleDto, userId: number, isSuperUser: boolean, managedDepartmentIds: number[]): Promise<Schedule | null>;
    deleteSchedule(id: number, userId: number, isSuperUser: boolean, managedDepartmentIds: number[]): Promise<{
        message: string;
    }>;
}
