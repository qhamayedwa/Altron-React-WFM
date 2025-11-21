import { User } from './user.entity';
import { LeaveType } from './leave-type.entity';
export declare class LeaveBalance {
    id: number;
    userId: number;
    leaveTypeId: number;
    balance: number;
    accruedThisYear?: number;
    usedThisYear?: number;
    lastAccrualDate?: Date;
    year: number;
    createdAt: Date;
    updatedAt: Date;
    user: User;
    leaveType: LeaveType;
}
