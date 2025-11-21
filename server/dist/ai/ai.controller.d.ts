import { AiService } from './ai.service';
export declare class AiController {
    private readonly aiService;
    constructor(aiService: AiService);
    analyzeScheduling(departmentId?: string, days?: string): Promise<{
        success: boolean;
        data: import("./ai.service").SchedulingAnalysis;
    }>;
    generatePayrollInsights(body: {
        start_date: string;
        end_date: string;
    }): Promise<{
        success: boolean;
        data: import("./ai.service").PayrollInsights;
    }>;
    analyzeAttendance(employeeId?: string, days?: string): Promise<{
        success: boolean;
        data: import("./ai.service").AttendanceAnalysis;
    }>;
    suggestSchedule(body: {
        target_date: string;
        department_id?: number;
    }): Promise<{
        success: boolean;
        data: import("./ai.service").ScheduleSuggestion;
    }>;
    naturalQuery(body: {
        query: string;
    }): Promise<{
        success: boolean;
        error: string;
        data?: undefined;
    } | {
        success: boolean;
        data: import("./ai.service").NaturalQueryResult;
        error?: undefined;
    }>;
    quickInsights(req: any): Promise<{
        success: boolean;
        insights: {
            workforce_status: string;
            efficiency_score: string;
            recommendations: string[];
        };
    }>;
    testConnection(): Promise<{
        success: boolean;
        message: string;
        test_result: import("./ai.service").NaturalQueryResult;
        error?: undefined;
    } | {
        success: boolean;
        error: string;
        message?: undefined;
        test_result?: undefined;
    }>;
}
