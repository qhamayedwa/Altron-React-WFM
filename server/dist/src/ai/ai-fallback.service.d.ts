import { PrismaService } from '../prisma/prisma.service';
import type { SchedulingAnalysis, PayrollInsights, AttendanceAnalysis } from './ai.service';
export declare class AiFallbackService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    analyzeSchedulingPatterns(departmentId?: number, days?: number): Promise<SchedulingAnalysis>;
    generatePayrollInsights(payPeriodStart: Date, payPeriodEnd: Date): Promise<PayrollInsights>;
    analyzeAttendancePatterns(employeeId?: number, days?: number): Promise<AttendanceAnalysis>;
}
