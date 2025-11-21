import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { TimeEntry } from '../entities/time-entry.entity';
import { LeaveApplication } from '../entities/leave-application.entity';
import { User } from '../entities/user.entity';
export declare class SageVipService {
    private timeEntryRepo;
    private leaveApplicationRepo;
    private userRepo;
    private configService;
    private readonly logger;
    private readonly baseUrl;
    private readonly apiKey;
    private readonly username;
    private readonly password;
    private readonly companyDb;
    constructor(timeEntryRepo: Repository<TimeEntry>, leaveApplicationRepo: Repository<LeaveApplication>, userRepo: Repository<User>, configService: ConfigService);
    isConfigured(): boolean;
    testConnection(): Promise<{
        success: boolean;
        message: string;
        config?: undefined;
    } | {
        success: boolean;
        message: string;
        config: {
            baseUrl: string;
            companyDb: string;
        };
    }>;
    syncEmployees(): Promise<{
        success: boolean;
        message: string;
        synced: number;
        errors: never[];
    }>;
    pushTimesheets(startDate: Date, endDate: Date): Promise<{
        success: boolean;
        message: string;
        entries_processed: number;
        errors: never[];
    }>;
    transferLeave(startDate: Date, endDate: Date): Promise<{
        success: boolean;
        message: string;
        leave_transferred: number;
        errors: never[];
    }>;
    getSyncHistory(limit?: number): Promise<{
        success: boolean;
        history: never[];
        message: string;
    }>;
    getStatus(): Promise<{
        configured: boolean;
        last_sync: null;
        status: string;
        message: string;
    }>;
}
