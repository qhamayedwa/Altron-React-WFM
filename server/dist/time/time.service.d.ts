import { Repository } from 'typeorm';
import { TimeEntry } from '../entities/time-entry.entity';
import { Department } from '../entities/department.entity';
import { User } from '../entities/user.entity';
import { ClockInDto } from './dto/clock-in.dto';
import { ClockOutDto } from './dto/clock-out.dto';
import { GetTimeEntriesDto } from './dto/get-time-entries.dto';
export declare class TimeService {
    private timeEntryRepo;
    private departmentRepo;
    private userRepo;
    constructor(timeEntryRepo: Repository<TimeEntry>, departmentRepo: Repository<Department>, userRepo: Repository<User>);
    getManagedDepartmentIds(userId: number): Promise<number[]>;
    clockIn(userId: number, dto: ClockInDto): Promise<{
        entry_id: number;
        clock_in_time: Date;
        status: string;
    }>;
    clockOut(userId: number, dto: ClockOutDto): Promise<{
        entry_id: number;
        clock_out_time: Date | undefined;
        total_hours: number;
        status: string;
    }>;
    getCurrentStatus(userId: number): Promise<any>;
    getTimeEntries(userId: number, dto: GetTimeEntriesDto, isSuperUser: boolean, managedDepartmentIds: number[]): Promise<{
        entries: {
            id: number;
            user: {
                id: number;
                username: string;
                first_name: string | undefined;
                last_name: string | undefined;
                employee_id: string | undefined;
            };
            clock_in_time: Date;
            clock_out_time: Date | undefined;
            total_hours: number;
            status: string;
            notes: string | undefined;
            approved_by_id: number | undefined;
            clock_in_location: {
                latitude: number;
                longitude: number;
            } | null;
            clock_out_location: {
                latitude: number;
                longitude: number;
            } | null;
        }[];
        pagination: {
            page: number;
            per_page: number;
            total: number;
            total_pages: number;
        };
    }>;
    getPendingApprovals(userId: number, isSuperUser: boolean, managedDepartmentIds: number[]): Promise<{
        id: number;
        user: {
            id: number;
            username: string;
            first_name: string | undefined;
            last_name: string | undefined;
            employee_id: string | undefined;
            department: Department | undefined;
        };
        clock_in_time: Date;
        clock_out_time: Date | undefined;
        total_hours: number;
        status: string;
        notes: string | undefined;
    }[]>;
    approveTimeEntry(entryId: number, approverId: number, isSuperUser: boolean, managedDepartmentIds: number[], notes?: string): Promise<{
        entry_id: number;
        status: string;
        approved_at: Date;
    }>;
    rejectTimeEntry(entryId: number, approverId: number, isSuperUser: boolean, managedDepartmentIds: number[], notes?: string): Promise<{
        entry_id: number;
        status: string;
        rejected_at: Date;
    }>;
}
