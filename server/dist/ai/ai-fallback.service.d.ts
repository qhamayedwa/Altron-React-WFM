import { Repository } from 'typeorm';
import { Schedule } from '../entities/schedule.entity';
import { TimeEntry } from '../entities/time-entry.entity';
import { User } from '../entities/user.entity';
import type { SchedulingAnalysis, PayrollInsights, AttendanceAnalysis } from './ai.service';
export declare class AiFallbackService {
    private scheduleRepo;
    private timeEntryRepo;
    private userRepo;
    private readonly logger;
    constructor(scheduleRepo: Repository<Schedule>, timeEntryRepo: Repository<TimeEntry>, userRepo: Repository<User>);
    analyzeSchedulingPatterns(departmentId?: number, days?: number): Promise<SchedulingAnalysis>;
    generatePayrollInsights(payPeriodStart: Date, payPeriodEnd: Date): Promise<PayrollInsights>;
    analyzeAttendancePatterns(employeeId?: number, days?: number): Promise<AttendanceAnalysis>;
}
