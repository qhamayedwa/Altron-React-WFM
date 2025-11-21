import { User } from './user.entity';
import { TimeEntry } from './time-entry.entity';
export declare class PayCalculation {
    id: number;
    userId: number;
    timeEntryId: number;
    payPeriodStart: Date;
    payPeriodEnd: Date;
    payComponents: string;
    totalHours?: number;
    regularHours?: number;
    overtimeHours?: number;
    doubleTimeHours?: number;
    totalAllowances?: number;
    calculatedAt?: Date;
    calculatedById: number;
    user: User;
    timeEntry: TimeEntry;
    calculatedBy: User;
}
