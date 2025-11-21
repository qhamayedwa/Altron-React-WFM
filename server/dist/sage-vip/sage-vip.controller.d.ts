import { SageVipService } from './sage-vip.service';
export declare class SageVipController {
    private readonly sageVipService;
    constructor(sageVipService: SageVipService);
    getStatus(): Promise<{
        configured: boolean;
        last_sync: null;
        status: string;
        message: string;
    }>;
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
    pushTimesheets(startDate: string, endDate: string): Promise<{
        success: boolean;
        message: string;
        entries_processed: number;
        errors: never[];
    }>;
    transferLeave(startDate: string, endDate: string): Promise<{
        success: boolean;
        message: string;
        leave_transferred: number;
        errors: never[];
    }>;
    getSyncHistory(limit?: string): Promise<{
        success: boolean;
        history: never[];
        message: string;
    }>;
}
