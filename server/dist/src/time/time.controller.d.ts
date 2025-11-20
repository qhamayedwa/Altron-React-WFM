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
            clock_out_time: Date | null;
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
                    employee_id: string | null;
                    first_name: string | null;
                    last_name: string | null;
                };
                clock_in_time: Date;
                clock_out_time: Date | null;
                total_hours: number;
                status: string;
                notes: string | null;
                approved_by_id: number | null;
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
                employee_id: string | null;
                first_name: string | null;
                last_name: string | null;
                department: string | null;
            };
            clock_in_time: Date;
            clock_out_time: Date | null;
            total_hours: number;
            status: string;
            notes: string | null;
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
