import { TimeService } from './time.service';
import { ClockInDto } from './dto/clock-in.dto';
import { ClockOutDto } from './dto/clock-out.dto';
import { GetTimeEntriesDto } from './dto/get-time-entries.dto';
import { ApproveTimeEntryDto } from './dto/approve-time-entry.dto';
export declare class TimeController {
    private readonly timeService;
    constructor(timeService: TimeService);
    clockIn(req: any, dto: ClockInDto): Promise<{
        success: boolean;
        data: {
            entry_id: number;
            clock_in_time: Date;
            status: string;
        };
        message: string;
        timestamp: string;
    }>;
    clockOut(req: any, dto: ClockOutDto): Promise<{
        success: boolean;
        data: {
            entry_id: number;
            clock_out_time: Date | undefined;
            total_hours: number;
            status: string;
        };
        message: string;
        timestamp: string;
    }>;
    getCurrentStatus(req: any): Promise<{
        success: boolean;
        data: any;
        timestamp: string;
    }>;
    getTimeEntries(req: any, dto: GetTimeEntriesDto): Promise<{
        success: boolean;
        data: {
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
        };
        timestamp: string;
    }>;
    getPendingApprovals(req: any): Promise<{
        success: boolean;
        data: {
            id: number;
            user: {
                id: number;
                username: string;
                first_name: string | undefined;
                last_name: string | undefined;
                employee_id: string | undefined;
                department: import("../entities/department.entity").Department | undefined;
            };
            clock_in_time: Date;
            clock_out_time: Date | undefined;
            total_hours: number;
            status: string;
            notes: string | undefined;
        }[];
        timestamp: string;
    }>;
    approveTimeEntry(req: any, dto: ApproveTimeEntryDto): Promise<{
        success: boolean;
        data: {
            entry_id: number;
            status: string;
            approved_at: Date;
        };
        message: string;
        timestamp: string;
    }>;
    rejectTimeEntry(req: any, dto: ApproveTimeEntryDto): Promise<{
        success: boolean;
        data: {
            entry_id: number;
            status: string;
            rejected_at: Date;
        };
        message: string;
        timestamp: string;
    }>;
}
