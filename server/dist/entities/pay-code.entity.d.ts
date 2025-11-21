import { User } from './user.entity';
import { TimeEntry } from './time-entry.entity';
export declare class PayCode {
    id: number;
    code: string;
    description: string;
    isAbsenceCode: boolean;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    createdById: number;
    configuration?: string;
    createdBy: User;
    timeEntries: TimeEntry[];
    absenceTimeEntries: TimeEntry[];
}
