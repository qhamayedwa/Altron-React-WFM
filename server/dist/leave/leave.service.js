"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeaveService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const department_entity_1 = require("../entities/department.entity");
const leave_application_entity_1 = require("../entities/leave-application.entity");
const leave_balance_entity_1 = require("../entities/leave-balance.entity");
const leave_type_entity_1 = require("../entities/leave-type.entity");
const user_entity_1 = require("../entities/user.entity");
let LeaveService = class LeaveService {
    departmentRepo;
    leaveApplicationRepo;
    leaveBalanceRepo;
    leaveTypeRepo;
    userRepo;
    constructor(departmentRepo, leaveApplicationRepo, leaveBalanceRepo, leaveTypeRepo, userRepo) {
        this.departmentRepo = departmentRepo;
        this.leaveApplicationRepo = leaveApplicationRepo;
        this.leaveBalanceRepo = leaveBalanceRepo;
        this.leaveTypeRepo = leaveTypeRepo;
        this.userRepo = userRepo;
    }
    async getManagedDepartmentIds(userId) {
        const departments = await this.departmentRepo.find({
            where: [
                { managerId: userId },
                { deputyManagerId: userId },
            ],
            select: ['id'],
        });
        return departments.map((dept) => dept.id);
    }
    async getMyLeaveBalances(userId) {
        const currentYear = new Date().getFullYear();
        const balances = await this.leaveBalanceRepo.find({
            where: {
                userId: userId,
                year: currentYear,
            },
            relations: ['leaveType'],
            order: {
                leaveType: {
                    name: 'ASC',
                },
            },
        });
        const activeLeaveTypes = await this.leaveTypeRepo.find({
            where: { isActive: true },
            order: { name: 'ASC' },
        });
        return {
            balances,
            leave_types: activeLeaveTypes,
            current_year: currentYear,
        };
    }
    async createLeaveApplication(userId, dto, applierId, isPrivileged, managedDepartmentIds) {
        const targetUserId = dto.user_id || userId;
        if (dto.auto_approve && targetUserId === applierId) {
            throw new common_1.ForbiddenException('You cannot auto-approve your own leave application');
        }
        if (targetUserId !== userId && !isPrivileged) {
            const userDept = await this.userRepo.findOne({
                where: { id: targetUserId },
                select: ['departmentId'],
            });
            if (!userDept || !managedDepartmentIds.includes(userDept.departmentId)) {
                throw new common_1.ForbiddenException('You do not have permission to apply leave for this user');
            }
        }
        if (dto.auto_approve && !isPrivileged) {
            if (managedDepartmentIds.length === 0) {
                throw new common_1.ForbiddenException('Only managers and admins can auto-approve leave applications');
            }
            const userDept = await this.userRepo.findOne({
                where: { id: targetUserId },
                select: ['departmentId'],
            });
            if (!userDept || !managedDepartmentIds.includes(userDept.departmentId)) {
                throw new common_1.ForbiddenException('You can only auto-approve leave for employees in your managed departments');
            }
        }
        const startDate = new Date(dto.start_date);
        const endDate = new Date(dto.end_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (endDate < startDate) {
            throw new common_1.BadRequestException('End date must be after start date');
        }
        if (startDate <= today && !dto.auto_approve) {
            throw new common_1.BadRequestException('Leave applications must be for future dates');
        }
        const overlapping = await this.leaveApplicationRepo
            .createQueryBuilder('la')
            .where('la.userId = :userId', { userId: targetUserId })
            .andWhere('la.status IN (:...statuses)', { statuses: ['Pending', 'Approved'] })
            .andWhere('((la.startDate <= :start AND la.endDate >= :start) OR ' +
            '(la.startDate <= :end AND la.endDate >= :end) OR ' +
            '(la.startDate >= :start AND la.endDate <= :end))', { start: startDate, end: endDate })
            .getOne();
        if (overlapping) {
            throw new common_1.BadRequestException('Overlapping leave application already exists');
        }
        const leaveType = await this.leaveTypeRepo.findOne({
            where: { id: dto.leave_type_id },
        });
        if (!leaveType || !leaveType.isActive) {
            throw new common_1.BadRequestException('Invalid or inactive leave type');
        }
        let hoursNeeded;
        let daysRequested;
        if (dto.is_hourly && dto.hours_requested) {
            hoursNeeded = dto.hours_requested;
            daysRequested = Math.ceil(hoursNeeded / 8);
        }
        else {
            daysRequested = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
            hoursNeeded = daysRequested * 8;
        }
        if (leaveType.maxConsecutiveDays && daysRequested > leaveType.maxConsecutiveDays) {
            throw new common_1.BadRequestException(`This leave type allows a maximum of ${leaveType.maxConsecutiveDays} consecutive days. You requested ${daysRequested} days.`);
        }
        if (leaveType.requiresApproval && dto.auto_approve && !isPrivileged) {
            throw new common_1.BadRequestException('This leave type requires approval and cannot be auto-approved');
        }
        const currentYear = new Date().getFullYear();
        const leaveBalance = await this.leaveBalanceRepo.findOne({
            where: {
                userId: targetUserId,
                leaveTypeId: dto.leave_type_id,
                year: currentYear,
            },
        });
        if (leaveBalance && leaveBalance.balance < hoursNeeded) {
            throw new common_1.BadRequestException(`Insufficient leave balance. Available: ${leaveBalance.balance} hours, Requested: ${hoursNeeded} hours`);
        }
        const now = new Date();
        const applicationData = {
            userId: targetUserId,
            leaveTypeId: dto.leave_type_id,
            startDate: startDate,
            endDate: endDate,
            isHourly: dto.is_hourly || false,
            status: dto.auto_approve ? 'Approved' : 'Pending',
        };
        if (dto.reason) {
            applicationData.reason = dto.reason;
        }
        if (dto.hours_requested) {
            applicationData.hoursRequested = dto.hours_requested;
        }
        if (dto.auto_approve) {
            applicationData.managerApprovedId = applierId;
            applicationData.approvedAt = now;
        }
        const application = this.leaveApplicationRepo.create(applicationData);
        await this.leaveApplicationRepo.save(application);
        if (dto.auto_approve && leaveBalance) {
            await this.leaveBalanceRepo.update(leaveBalance.id, {
                balance: leaveBalance.balance - hoursNeeded,
                usedThisYear: (leaveBalance.usedThisYear || 0) + hoursNeeded,
            });
        }
        return this.leaveApplicationRepo.findOne({
            where: {
                userId: targetUserId,
                leaveTypeId: dto.leave_type_id,
                startDate: startDate,
                endDate: endDate,
            },
            relations: ['leaveType', 'user'],
        });
    }
    async getMyApplications(userId, dto) {
        const { page = 1, per_page = 20, status } = dto;
        const skip = (page - 1) * per_page;
        const where = { userId: userId };
        if (status) {
            where.status = status;
        }
        const [applications, total] = await this.leaveApplicationRepo.findAndCount({
            where,
            relations: ['leaveType', 'managerApproved'],
            order: { createdAt: 'DESC' },
            skip,
            take: per_page,
        });
        return {
            applications,
            pagination: {
                page,
                per_page,
                total,
                total_pages: Math.ceil(total / per_page),
            },
        };
    }
    async getTeamApplications(userId, dto, isPrivileged, managedDepartmentIds) {
        if (!isPrivileged && managedDepartmentIds.length === 0) {
            throw new common_1.ForbiddenException('You do not have permission to view team applications');
        }
        const { page = 1, per_page = 20, status, user_id } = dto;
        const skip = (page - 1) * per_page;
        const where = {};
        if (!isPrivileged && managedDepartmentIds.length > 0) {
            const usersInManagedDepts = await this.userRepo.find({
                where: { departmentId: (0, typeorm_2.In)(managedDepartmentIds) },
                select: ['id'],
            });
            const userIds = usersInManagedDepts.map((u) => u.id);
            where.userId = (0, typeorm_2.In)(userIds);
        }
        if (status) {
            where.status = status;
        }
        if (user_id) {
            if (!isPrivileged && managedDepartmentIds.length > 0) {
                const userDept = await this.userRepo.findOne({
                    where: { id: user_id },
                    select: ['departmentId'],
                });
                if (!userDept || !managedDepartmentIds.includes(userDept.departmentId)) {
                    throw new common_1.ForbiddenException('You do not have permission to view this user');
                }
            }
            where.userId = user_id;
        }
        const [applications, total] = await this.leaveApplicationRepo.findAndCount({
            where,
            relations: ['leaveType', 'user', 'managerApproved'],
            order: { createdAt: 'DESC' },
            skip,
            take: per_page,
        });
        return {
            applications,
            pagination: {
                page,
                per_page,
                total,
                total_pages: Math.ceil(total / per_page),
            },
        };
    }
    async approveApplication(applicationId, approverId, dto, isPrivileged, managedDepartmentIds) {
        const application = await this.leaveApplicationRepo.findOne({
            where: { id: applicationId },
            relations: ['user'],
        });
        if (!application) {
            throw new common_1.NotFoundException('Leave application not found');
        }
        if (application.status !== 'Pending') {
            throw new common_1.BadRequestException('Application is not pending approval');
        }
        if (!isPrivileged) {
            const userDeptId = application.user.departmentId;
            if (!userDeptId || !managedDepartmentIds.includes(userDeptId)) {
                throw new common_1.ForbiddenException('You do not have permission to approve this application');
            }
        }
        const currentYear = new Date().getFullYear();
        const leaveBalance = await this.leaveBalanceRepo.findOne({
            where: {
                userId: application.userId,
                leaveTypeId: application.leaveTypeId,
                year: currentYear,
            },
        });
        let hoursToDeduct;
        if (application.isHourly && application.hoursRequested) {
            hoursToDeduct = application.hoursRequested;
        }
        else {
            const daysRequested = Math.floor((application.endDate.getTime() - application.startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
            hoursToDeduct = daysRequested * 8;
        }
        if (leaveBalance) {
            if (leaveBalance.balance < hoursToDeduct) {
                throw new common_1.BadRequestException('Insufficient leave balance');
            }
            await this.leaveBalanceRepo.update(leaveBalance.id, {
                balance: leaveBalance.balance - hoursToDeduct,
                usedThisYear: (leaveBalance.usedThisYear || 0) + hoursToDeduct,
            });
        }
        const now = new Date();
        const updateData = {
            status: 'Approved',
            managerApprovedId: approverId,
            approvedAt: now,
        };
        if (dto.manager_comments) {
            updateData.managerComments = dto.manager_comments;
        }
        await this.leaveApplicationRepo.update(applicationId, updateData);
        return this.leaveApplicationRepo.findOne({
            where: { id: applicationId },
            relations: ['leaveType', 'user'],
        });
    }
    async rejectApplication(applicationId, approverId, dto, isPrivileged, managedDepartmentIds) {
        const application = await this.leaveApplicationRepo.findOne({
            where: { id: applicationId },
            relations: ['user'],
        });
        if (!application) {
            throw new common_1.NotFoundException('Leave application not found');
        }
        if (application.status !== 'Pending') {
            throw new common_1.BadRequestException('Application is not pending approval');
        }
        if (!isPrivileged) {
            const userDeptId = application.user.departmentId;
            if (!userDeptId || !managedDepartmentIds.includes(userDeptId)) {
                throw new common_1.ForbiddenException('You do not have permission to reject this application');
            }
        }
        const updateData = {
            status: 'Rejected',
            managerApprovedId: approverId,
        };
        if (dto.manager_comments) {
            updateData.managerComments = dto.manager_comments;
        }
        await this.leaveApplicationRepo.update(applicationId, updateData);
        return this.leaveApplicationRepo.findOne({
            where: { id: applicationId },
            relations: ['leaveType', 'user'],
        });
    }
    async cancelApplication(applicationId, userId) {
        const application = await this.leaveApplicationRepo.findOne({
            where: {
                id: applicationId,
                userId: userId,
            },
        });
        if (!application) {
            throw new common_1.NotFoundException('Leave application not found');
        }
        if (application.status !== 'Pending' && application.status !== 'Approved') {
            throw new common_1.BadRequestException('Only pending or approved applications can be cancelled');
        }
        if (application.status === 'Approved' && application.startDate <= new Date()) {
            throw new common_1.BadRequestException('Cannot cancel approved leave that has already started');
        }
        if (application.status === 'Approved') {
            const currentYear = new Date().getFullYear();
            const leaveBalance = await this.leaveBalanceRepo.findOne({
                where: {
                    userId: application.userId,
                    leaveTypeId: application.leaveTypeId,
                    year: currentYear,
                },
            });
            if (leaveBalance) {
                let hoursToRestore;
                if (application.isHourly && application.hoursRequested) {
                    hoursToRestore = application.hoursRequested;
                }
                else {
                    const daysRequested = Math.floor((application.endDate.getTime() - application.startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                    hoursToRestore = daysRequested * 8;
                }
                await this.leaveBalanceRepo.update(leaveBalance.id, {
                    balance: leaveBalance.balance + hoursToRestore,
                    usedThisYear: Math.max(0, (leaveBalance.usedThisYear || 0) - hoursToRestore),
                });
            }
        }
        await this.leaveApplicationRepo.update(applicationId, {
            status: 'Cancelled',
        });
        return this.leaveApplicationRepo.findOne({
            where: { id: applicationId },
            relations: ['leaveType'],
        });
    }
    async getLeaveTypes() {
        return this.leaveTypeRepo.find({
            order: { name: 'ASC' },
        });
    }
    async getLeaveType(id) {
        const leaveType = await this.leaveTypeRepo.findOne({
            where: { id },
        });
        if (!leaveType) {
            throw new common_1.NotFoundException('Leave type not found');
        }
        const [totalApplications, pendingApplications, approvedApplications] = await Promise.all([
            this.leaveApplicationRepo.count({ where: { leaveTypeId: id } }),
            this.leaveApplicationRepo.count({ where: { leaveTypeId: id, status: 'Pending' } }),
            this.leaveApplicationRepo.count({ where: { leaveTypeId: id, status: 'Approved' } }),
        ]);
        return {
            leave_type: leaveType,
            statistics: {
                total_applications: totalApplications,
                pending_applications: pendingApplications,
                approved_applications: approvedApplications,
            },
        };
    }
    async createLeaveType(dto) {
        const existing = await this.leaveTypeRepo.findOne({
            where: { name: dto.name },
        });
        if (existing) {
            throw new common_1.BadRequestException('A leave type with this name already exists');
        }
        const leaveTypeData = {
            name: dto.name,
            requiresApproval: dto.requires_approval ?? true,
        };
        if (dto.description) {
            leaveTypeData.description = dto.description;
        }
        if (dto.default_accrual_rate) {
            leaveTypeData.defaultAccrualRate = dto.default_accrual_rate;
        }
        if (dto.max_consecutive_days) {
            leaveTypeData.maxConsecutiveDays = dto.max_consecutive_days;
        }
        const leaveType = this.leaveTypeRepo.create(leaveTypeData);
        return this.leaveTypeRepo.save(leaveType);
    }
    async updateLeaveType(id, dto) {
        const leaveType = await this.leaveTypeRepo.findOne({
            where: { id },
        });
        if (!leaveType) {
            throw new common_1.NotFoundException('Leave type not found');
        }
        if (dto.name) {
            const existing = await this.leaveTypeRepo.findOne({
                where: {
                    name: dto.name,
                    id: (0, typeorm_2.Not)(id),
                },
            });
            if (existing) {
                throw new common_1.BadRequestException('A leave type with this name already exists');
            }
        }
        if (dto.is_active === false) {
            const pendingCount = await this.leaveApplicationRepo.count({
                where: {
                    leaveTypeId: id,
                    status: 'Pending',
                },
            });
            if (pendingCount > 0) {
                throw new common_1.BadRequestException(`Cannot deactivate leave type with ${pendingCount} pending applications`);
            }
        }
        const updateData = {};
        if (dto.name !== undefined)
            updateData.name = dto.name;
        if (dto.description !== undefined)
            updateData.description = dto.description;
        if (dto.default_accrual_rate !== undefined)
            updateData.defaultAccrualRate = dto.default_accrual_rate;
        if (dto.requires_approval !== undefined)
            updateData.requiresApproval = dto.requires_approval;
        if (dto.max_consecutive_days !== undefined)
            updateData.maxConsecutiveDays = dto.max_consecutive_days;
        if (dto.is_active !== undefined)
            updateData.isActive = dto.is_active;
        await this.leaveTypeRepo.update(id, updateData);
        return this.leaveTypeRepo.findOne({ where: { id } });
    }
    async getLeaveBalances(year, userId, leaveTypeId) {
        const currentYear = year || new Date().getFullYear();
        const where = { year: currentYear };
        if (userId) {
            where.userId = userId;
        }
        if (leaveTypeId) {
            where.leaveTypeId = leaveTypeId;
        }
        return this.leaveBalanceRepo.find({
            where,
            relations: ['user', 'leaveType'],
            order: {
                user: {
                    username: 'ASC',
                },
            },
        });
    }
    async adjustLeaveBalance(balanceId, dto) {
        const balance = await this.leaveBalanceRepo.findOne({
            where: { id: balanceId },
        });
        if (!balance) {
            throw new common_1.NotFoundException('Leave balance not found');
        }
        const adjustment = dto.new_balance - balance.balance;
        await this.leaveBalanceRepo.update(balanceId, {
            balance: dto.new_balance,
            accruedThisYear: (balance.accruedThisYear || 0) + Math.max(0, adjustment),
        });
        return this.leaveBalanceRepo.findOne({ where: { id: balanceId } });
    }
    async runAccrual() {
        const accrualDate = new Date();
        const currentYear = accrualDate.getFullYear();
        const currentMonth = accrualDate.getMonth();
        let usersProcessed = 0;
        const users = await this.userRepo.find({
            where: { isActive: true },
        });
        const leaveTypes = await this.leaveTypeRepo.find({
            where: {
                isActive: true,
                defaultAccrualRate: (0, typeorm_2.Not)((0, typeorm_2.IsNull)()),
            },
        });
        for (const user of users) {
            for (const leaveType of leaveTypes) {
                let balance = await this.leaveBalanceRepo.findOne({
                    where: {
                        userId: user.id,
                        leaveTypeId: leaveType.id,
                        year: currentYear,
                    },
                });
                if (!balance) {
                    balance = this.leaveBalanceRepo.create({
                        userId: user.id,
                        leaveTypeId: leaveType.id,
                        year: currentYear,
                        balance: 0,
                        accruedThisYear: 0,
                        usedThisYear: 0,
                    });
                    balance = await this.leaveBalanceRepo.save(balance);
                }
                const lastAccrualDate = balance.lastAccrualDate ? new Date(balance.lastAccrualDate) : null;
                const needsAccrual = !lastAccrualDate ||
                    lastAccrualDate.getFullYear() !== currentYear ||
                    lastAccrualDate.getMonth() !== currentMonth;
                if (needsAccrual && leaveType.defaultAccrualRate) {
                    const monthlyAccrual = leaveType.defaultAccrualRate / 12;
                    await this.leaveBalanceRepo.update(balance.id, {
                        balance: balance.balance + monthlyAccrual,
                        accruedThisYear: (balance.accruedThisYear || 0) + monthlyAccrual,
                        lastAccrualDate: accrualDate,
                    });
                    usersProcessed++;
                }
            }
        }
        return {
            users_processed: usersProcessed,
            accrual_date: accrualDate,
        };
    }
};
exports.LeaveService = LeaveService;
exports.LeaveService = LeaveService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(department_entity_1.Department)),
    __param(1, (0, typeorm_1.InjectRepository)(leave_application_entity_1.LeaveApplication)),
    __param(2, (0, typeorm_1.InjectRepository)(leave_balance_entity_1.LeaveBalance)),
    __param(3, (0, typeorm_1.InjectRepository)(leave_type_entity_1.LeaveType)),
    __param(4, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], LeaveService);
//# sourceMappingURL=leave.service.js.map