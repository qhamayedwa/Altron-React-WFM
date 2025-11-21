import { User } from './user.entity';
import { ShiftType } from './shift-type.entity';
export declare class Schedule {
    id: number;
    userId: number;
    shiftTypeId?: number;
    startTime: Date;
    endTime: Date;
    assignedByManagerId: number;
    notes?: string;
    payRuleLinkId?: number;
    status: string;
    createdAt: Date;
    updatedAt: Date;
    batchId?: string;
    user: User;
    shiftType?: ShiftType;
    assignedByManager: User;
}
