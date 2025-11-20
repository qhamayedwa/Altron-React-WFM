import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { AiFallbackService } from './ai-fallback.service';
export interface SchedulingAnalysis {
    success: boolean;
    analysis?: {
        patterns_identified: string[];
        optimization_suggestions: string[];
        coverage_analysis: {
            understaffed_periods: string[];
            overstaffed_periods: string[];
        };
        efficiency_score: number;
        recommendations: string[];
    };
    suggestions?: any;
    data_period?: string;
    total_schedules_analyzed?: number;
    error?: string;
    fallback_available?: boolean;
}
export interface PayrollInsights {
    success: boolean;
    insights?: {
        anomalies_detected: Array<{
            type: string;
            employee_id?: string;
            date?: string;
            description: string;
            severity: 'low' | 'medium' | 'high';
        }>;
        cost_analysis: {
            total_payroll_cost?: string;
            total_hours_worked?: string;
            overtime_percentage: string;
            average_hourly_rate?: string;
            employees_tracked?: string;
        };
        recommendations: string[];
        compliance_notes: string[];
        efficiency_insights: string[];
    };
    period?: string;
    calculations_analyzed?: number;
    time_entries_analyzed?: number;
    error?: string;
    fallback_available?: boolean;
}
export interface AttendanceAnalysis {
    success: boolean;
    analysis?: {
        attendance_trends: {
            punctuality_score: number;
            consistency_score: number;
            average_daily_hours: string;
        };
        patterns_identified: string[];
        risk_indicators: Array<{
            type: string;
            employee_id: string;
            description: string;
            probability: 'low' | 'medium' | 'high';
        }>;
        recommendations: string[];
        productivity_insights: string[];
    };
    insights?: any;
    period?: string;
    period_summary?: string;
    entries_analyzed?: number;
    error?: string;
    fallback_available?: boolean;
}
export interface ScheduleSuggestion {
    success: boolean;
    suggestions?: {
        recommended_schedule: Array<{
            employee_id: string;
            shift_start: string;
            shift_end: string;
            shift_type: string;
            reasoning: string;
        }>;
        coverage_analysis: {
            peak_hours_covered: boolean;
            minimum_staffing_met: boolean;
            optimal_distribution: boolean;
        };
        efficiency_score: number;
        cost_estimate: string;
        notes: string[];
    };
    target_date?: string;
    employees_available?: number;
    error?: string;
}
export interface NaturalQueryResult {
    success: boolean;
    query?: string;
    result?: {
        response: string;
        insights: string[];
        suggested_actions: string[];
        related_data: Record<string, any>;
    };
    error?: string;
}
export declare class AiService {
    private prisma;
    private configService;
    private fallbackService;
    private readonly logger;
    private openai;
    private readonly model;
    private readonly isAvailable;
    constructor(prisma: PrismaService, configService: ConfigService, fallbackService: AiFallbackService);
    analyzeSchedulingPatterns(departmentId?: number, days?: number): Promise<SchedulingAnalysis>;
    generatePayrollInsights(payPeriodStart: Date, payPeriodEnd: Date): Promise<PayrollInsights>;
    analyzeAttendancePatterns(employeeId?: number, days?: number): Promise<AttendanceAnalysis>;
    suggestOptimalSchedule(targetDate: Date, departmentId?: number): Promise<ScheduleSuggestion>;
    naturalLanguageQuery(query: string): Promise<NaturalQueryResult>;
}
