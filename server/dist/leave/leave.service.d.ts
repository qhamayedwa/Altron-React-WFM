import { Repository } from 'typeorm';
import { Department } from '../entities/department.entity';
import { LeaveApplication } from '../entities/leave-application.entity';
import { LeaveBalance } from '../entities/leave-balance.entity';
import { LeaveType } from '../entities/leave-type.entity';
import { User } from '../entities/user.entity';
import { CreateLeaveApplicationDto } from './dto/create-leave-application.dto';
import { UpdateLeaveApplicationDto } from './dto/update-leave-application.dto';
import { GetLeaveApplicationsDto } from './dto/get-leave-applications.dto';
import { CreateLeaveTypeDto } from './dto/create-leave-type.dto';
import { UpdateLeaveTypeDto } from './dto/update-leave-type.dto';
import { AdjustLeaveBalanceDto } from './dto/adjust-leave-balance.dto';
export declare class LeaveService {
    private departmentRepo;
    private leaveApplicationRepo;
    private leaveBalanceRepo;
    private leaveTypeRepo;
    private userRepo;
    constructor(departmentRepo: Repository<Department>, leaveApplicationRepo: Repository<LeaveApplication>, leaveBalanceRepo: Repository<LeaveBalance>, leaveTypeRepo: Repository<LeaveType>, userRepo: Repository<User>);
    getManagedDepartmentIds(userId: number): Promise<number[]>;
    getMyLeaveBalances(userId: number): Promise<{
        balances: LeaveBalance[];
        leave_types: LeaveType[];
        current_year: number;
    }>;
    createLeaveApplication(userId: number, dto: CreateLeaveApplicationDto, applierId: number, isPrivileged: boolean, managedDepartmentIds: number[]): Promise<LeaveApplication | null>;
    getMyApplications(userId: number, dto: GetLeaveApplicationsDto): Promise<{
        applications: LeaveApplication[];
        pagination: {
            page: number;
            per_page: number;
            total: number;
            total_pages: number;
        };
    }>;
    getTeamApplications(userId: number, dto: GetLeaveApplicationsDto, isPrivileged: boolean, managedDepartmentIds: number[]): Promise<{
        applications: LeaveApplication[];
        pagination: {
            page: number;
            per_page: number;
            total: number;
            total_pages: number;
        };
    }>;
    approveApplication(applicationId: number, approverId: number, dto: UpdateLeaveApplicationDto, isPrivileged: boolean, managedDepartmentIds: number[]): Promise<LeaveApplication | null>;
    rejectApplication(applicationId: number, approverId: number, dto: UpdateLeaveApplicationDto, isPrivileged: boolean, managedDepartmentIds: number[]): Promise<LeaveApplication | null>;
    cancelApplication(applicationId: number, userId: number): Promise<LeaveApplication | null>;
    getLeaveTypes(): Promise<LeaveType[]>;
    getLeaveType(id: number): Promise<{
        leave_type: LeaveType;
        statistics: {
            total_applications: number;
            pending_applications: number;
            approved_applications: number;
        };
    }>;
    createLeaveType(dto: CreateLeaveTypeDto): Promise<LeaveType[]>;
    updateLeaveType(id: number, dto: UpdateLeaveTypeDto): Promise<LeaveType | null>;
    getLeaveBalances(year?: number, userId?: number, leaveTypeId?: number): Promise<LeaveBalance[]>;
    adjustLeaveBalance(balanceId: number, dto: AdjustLeaveBalanceDto): Promise<LeaveBalance | null>;
    runAccrual(): Promise<{
        users_processed: number;
        accrual_date: Date;
    }>;
}
