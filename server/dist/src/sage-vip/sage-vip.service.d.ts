import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
export declare class SageVipService {
    private configService;
    private prisma;
    private readonly logger;
    private readonly baseUrl;
    private readonly apiKey;
    private readonly username;
    private readonly password;
    private readonly companyDb;
    constructor(configService: ConfigService, prisma: PrismaService);
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
