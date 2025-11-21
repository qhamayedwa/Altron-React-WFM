import { User } from './user.entity';
import { LeaveType } from './leave-type.entity';
export declare class LeaveApplication {
    id: number;
    userId: number;
    leaveTypeId: number;
    startDate: Date;
    endDate: Date;
    reason?: string;
    status: string;
    isHourly: boolean;
    hoursRequested?: number;
    managerApprovedId?: number;
    managerComments?: string;
    createdAt: Date;
    updatedAt: Date;
    approvedAt?: Date;
    user: User;
    leaveType: LeaveType;
    managerApproved?: User;
}
