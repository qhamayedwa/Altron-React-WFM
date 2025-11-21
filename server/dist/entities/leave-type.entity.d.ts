import { LeaveApplication } from './leave-application.entity';
import { LeaveBalance } from './leave-balance.entity';
export declare class LeaveType {
    id: number;
    name: string;
    defaultAccrualRate?: number;
    description?: string;
    isActive: boolean;
    requiresApproval: boolean;
    maxConsecutiveDays?: number;
    createdAt: Date;
    leaveApplications: LeaveApplication[];
    leaveBalances: LeaveBalance[];
}
