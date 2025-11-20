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
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeaveService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let LeaveService = class LeaveService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getManagedDepartmentIds(userId) {
        const departments = await this.prisma.departments.findMany({
            where: {
                OR: [
                    { manager_id: userId },
                    { deputy_manager_id: userId },
                ],
            },
            select: { id: true },
        });
        return departments.map((dept) => dept.id);
    }
    async getMyLeaveBalances(userId) {
        const currentYear = new Date().getFullYear();
        const balances = await this.prisma.leave_balances.findMany({
            where: {
                user_id: userId,
                year: currentYear,
            },
            include: {
                leave_types: {
                    select: {
                        id: true,
                        name: true,
                        description: true,
                    },
                },
            },
            orderBy: {
                leave_types: {
                    name: 'asc',
                },
            },
        });
        const activeLeaveTypes = await this.prisma.leave_types.findMany({
            where: { is_active: true },
            orderBy: { name: 'asc' },
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
            const userDept = await this.prisma.users.findUnique({
                where: { id: targetUserId },
                select: { department_id: true },
            });
            if (!userDept || !managedDepartmentIds.includes(userDept.department_id)) {
                throw new common_1.ForbiddenException('You do not have permission to apply leave for this user');
            }
        }
        if (dto.auto_approve && !isPrivileged) {
            if (managedDepartmentIds.length === 0) {
                throw new common_1.ForbiddenException('Only managers and admins can auto-approve leave applications');
            }
            const userDept = await this.prisma.users.findUnique({
                where: { id: targetUserId },
                select: { department_id: true },
            });
            if (!userDept || !managedDepartmentIds.includes(userDept.department_id)) {
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
        const overlapping = await this.prisma.leave_applications.findFirst({
            where: {
                user_id: targetUserId,
                status: { in: ['Pending', 'Approved'] },
                OR: [
                    {
                        AND: [
                            { start_date: { lte: startDate } },
                            { end_date: { gte: startDate } },
                        ],
                    },
                    {
                        AND: [
                            { start_date: { lte: endDate } },
                            { end_date: { gte: endDate } },
                        ],
                    },
                    {
                        AND: [
                            { start_date: { gte: startDate } },
                            { end_date: { lte: endDate } },
                        ],
                    },
                ],
            },
        });
        if (overlapping) {
            throw new common_1.BadRequestException('Overlapping leave application already exists');
        }
        const leaveType = await this.prisma.leave_types.findUnique({
            where: { id: dto.leave_type_id },
        });
        if (!leaveType || !leaveType.is_active) {
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
        if (leaveType.max_consecutive_days && daysRequested > leaveType.max_consecutive_days) {
            throw new common_1.BadRequestException(`This leave type allows a maximum of ${leaveType.max_consecutive_days} consecutive days. You requested ${daysRequested} days.`);
        }
        if (leaveType.requires_approval && dto.auto_approve && !isPrivileged) {
            throw new common_1.BadRequestException('This leave type requires approval and cannot be auto-approved');
        }
        const currentYear = new Date().getFullYear();
        const leaveBalance = await this.prisma.leave_balances.findFirst({
            where: {
                user_id: targetUserId,
                leave_type_id: dto.leave_type_id,
                year: currentYear,
            },
        });
        if (leaveBalance && leaveBalance.balance < hoursNeeded) {
            throw new common_1.BadRequestException(`Insufficient leave balance. Available: ${leaveBalance.balance} hours, Requested: ${hoursNeeded} hours`);
        }
        const now = new Date();
        const application = await this.prisma.leave_applications.create({
            data: {
                user_id: targetUserId,
                leave_type_id: dto.leave_type_id,
                start_date: startDate,
                end_date: endDate,
                reason: dto.reason || null,
                is_hourly: dto.is_hourly || false,
                hours_requested: dto.hours_requested || null,
                status: dto.auto_approve ? 'Approved' : 'Pending',
                manager_approved_id: dto.auto_approve ? applierId : null,
                approved_at: dto.auto_approve ? now : null,
            },
            include: {
                leave_types: true,
                users_leave_applications_user_idTousers: {
                    select: {
                        id: true,
                        username: true,
                        first_name: true,
                        last_name: true,
                    },
                },
            },
        });
        if (dto.auto_approve && leaveBalance) {
            await this.prisma.leave_balances.update({
                where: { id: leaveBalance.id },
                data: {
                    balance: leaveBalance.balance - hoursNeeded,
                    used_this_year: (leaveBalance.used_this_year || 0) + hoursNeeded,
                },
            });
        }
        return application;
    }
    async getMyApplications(userId, dto) {
        const { page = 1, per_page = 20, status } = dto;
        const skip = (page - 1) * per_page;
        const where = { user_id: userId };
        if (status) {
            where.status = status;
        }
        const [applications, total] = await Promise.all([
            this.prisma.leave_applications.findMany({
                where,
                include: {
                    leave_types: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                    users_leave_applications_manager_approved_idTousers: {
                        select: {
                            id: true,
                            username: true,
                            first_name: true,
                            last_name: true,
                        },
                    },
                },
                orderBy: { created_at: 'desc' },
                skip,
                take: per_page,
            }),
            this.prisma.leave_applications.count({ where }),
        ]);
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
            const usersInManagedDepts = await this.prisma.users.findMany({
                where: { department_id: { in: managedDepartmentIds } },
                select: { id: true },
            });
            const userIds = usersInManagedDepts.map((u) => u.id);
            where.user_id = { in: userIds };
        }
        if (status) {
            where.status = status;
        }
        if (user_id) {
            if (!isPrivileged && managedDepartmentIds.length > 0) {
                const userDept = await this.prisma.users.findUnique({
                    where: { id: user_id },
                    select: { department_id: true },
                });
                if (!userDept || !managedDepartmentIds.includes(userDept.department_id)) {
                    throw new common_1.ForbiddenException('You do not have permission to view this user');
                }
            }
            where.user_id = user_id;
        }
        const [applications, total] = await Promise.all([
            this.prisma.leave_applications.findMany({
                where,
                include: {
                    leave_types: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                    users_leave_applications_user_idTousers: {
                        select: {
                            id: true,
                            username: true,
                            first_name: true,
                            last_name: true,
                            department_id: true,
                        },
                    },
                    users_leave_applications_manager_approved_idTousers: {
                        select: {
                            id: true,
                            username: true,
                            first_name: true,
                            last_name: true,
                        },
                    },
                },
                orderBy: { created_at: 'desc' },
                skip,
                take: per_page,
            }),
            this.prisma.leave_applications.count({ where }),
        ]);
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
        const application = await this.prisma.leave_applications.findUnique({
            where: { id: applicationId },
            include: {
                users_leave_applications_user_idTousers: {
                    select: { department_id: true },
                },
            },
        });
        if (!application) {
            throw new common_1.NotFoundException('Leave application not found');
        }
        if (application.status !== 'Pending') {
            throw new common_1.BadRequestException('Application is not pending approval');
        }
        if (!isPrivileged) {
            const userDeptId = application.users_leave_applications_user_idTousers.department_id;
            if (!userDeptId || !managedDepartmentIds.includes(userDeptId)) {
                throw new common_1.ForbiddenException('You do not have permission to approve this application');
            }
        }
        const currentYear = new Date().getFullYear();
        const leaveBalance = await this.prisma.leave_balances.findFirst({
            where: {
                user_id: application.user_id,
                leave_type_id: application.leave_type_id,
                year: currentYear,
            },
        });
        let hoursToDeduct;
        if (application.is_hourly && application.hours_requested) {
            hoursToDeduct = application.hours_requested;
        }
        else {
            const daysRequested = Math.floor((application.end_date.getTime() - application.start_date.getTime()) / (1000 * 60 * 60 * 24)) + 1;
            hoursToDeduct = daysRequested * 8;
        }
        if (leaveBalance) {
            if (leaveBalance.balance < hoursToDeduct) {
                throw new common_1.BadRequestException('Insufficient leave balance');
            }
            await this.prisma.leave_balances.update({
                where: { id: leaveBalance.id },
                data: {
                    balance: leaveBalance.balance - hoursToDeduct,
                    used_this_year: (leaveBalance.used_this_year || 0) + hoursToDeduct,
                },
            });
        }
        const now = new Date();
        return this.prisma.leave_applications.update({
            where: { id: applicationId },
            data: {
                status: 'Approved',
                manager_approved_id: approverId,
                manager_comments: dto.manager_comments || null,
                approved_at: now,
            },
            include: {
                leave_types: true,
                users_leave_applications_user_idTousers: {
                    select: {
                        id: true,
                        username: true,
                        first_name: true,
                        last_name: true,
                    },
                },
            },
        });
    }
    async rejectApplication(applicationId, approverId, dto, isPrivileged, managedDepartmentIds) {
        const application = await this.prisma.leave_applications.findUnique({
            where: { id: applicationId },
            include: {
                users_leave_applications_user_idTousers: {
                    select: { department_id: true },
                },
            },
        });
        if (!application) {
            throw new common_1.NotFoundException('Leave application not found');
        }
        if (application.status !== 'Pending') {
            throw new common_1.BadRequestException('Application is not pending approval');
        }
        if (!isPrivileged) {
            const userDeptId = application.users_leave_applications_user_idTousers.department_id;
            if (!userDeptId || !managedDepartmentIds.includes(userDeptId)) {
                throw new common_1.ForbiddenException('You do not have permission to reject this application');
            }
        }
        return this.prisma.leave_applications.update({
            where: { id: applicationId },
            data: {
                status: 'Rejected',
                manager_approved_id: approverId,
                manager_comments: dto.manager_comments || null,
            },
            include: {
                leave_types: true,
                users_leave_applications_user_idTousers: {
                    select: {
                        id: true,
                        username: true,
                        first_name: true,
                        last_name: true,
                    },
                },
            },
        });
    }
    async cancelApplication(applicationId, userId) {
        const application = await this.prisma.leave_applications.findFirst({
            where: {
                id: applicationId,
                user_id: userId,
            },
        });
        if (!application) {
            throw new common_1.NotFoundException('Leave application not found');
        }
        if (application.status !== 'Pending' && application.status !== 'Approved') {
            throw new common_1.BadRequestException('Only pending or approved applications can be cancelled');
        }
        if (application.status === 'Approved' && application.start_date <= new Date()) {
            throw new common_1.BadRequestException('Cannot cancel approved leave that has already started');
        }
        if (application.status === 'Approved') {
            const currentYear = new Date().getFullYear();
            const leaveBalance = await this.prisma.leave_balances.findFirst({
                where: {
                    user_id: application.user_id,
                    leave_type_id: application.leave_type_id,
                    year: currentYear,
                },
            });
            if (leaveBalance) {
                let hoursToRestore;
                if (application.is_hourly && application.hours_requested) {
                    hoursToRestore = application.hours_requested;
                }
                else {
                    const daysRequested = Math.floor((application.end_date.getTime() - application.start_date.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                    hoursToRestore = daysRequested * 8;
                }
                await this.prisma.leave_balances.update({
                    where: { id: leaveBalance.id },
                    data: {
                        balance: leaveBalance.balance + hoursToRestore,
                        used_this_year: Math.max(0, (leaveBalance.used_this_year || 0) - hoursToRestore),
                    },
                });
            }
        }
        return this.prisma.leave_applications.update({
            where: { id: applicationId },
            data: { status: 'Cancelled' },
            include: { leave_types: true },
        });
    }
    async getLeaveTypes() {
        return this.prisma.leave_types.findMany({
            orderBy: { name: 'asc' },
        });
    }
    async getLeaveType(id) {
        const leaveType = await this.prisma.leave_types.findUnique({
            where: { id },
        });
        if (!leaveType) {
            throw new common_1.NotFoundException('Leave type not found');
        }
        const [totalApplications, pendingApplications, approvedApplications] = await Promise.all([
            this.prisma.leave_applications.count({ where: { leave_type_id: id } }),
            this.prisma.leave_applications.count({ where: { leave_type_id: id, status: 'Pending' } }),
            this.prisma.leave_applications.count({ where: { leave_type_id: id, status: 'Approved' } }),
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
        const existing = await this.prisma.leave_types.findFirst({
            where: { name: dto.name },
        });
        if (existing) {
            throw new common_1.BadRequestException('A leave type with this name already exists');
        }
        return this.prisma.leave_types.create({
            data: {
                name: dto.name,
                description: dto.description || null,
                default_accrual_rate: dto.default_accrual_rate || null,
                requires_approval: dto.requires_approval ?? true,
                max_consecutive_days: dto.max_consecutive_days || null,
            },
        });
    }
    async updateLeaveType(id, dto) {
        const leaveType = await this.prisma.leave_types.findUnique({
            where: { id },
        });
        if (!leaveType) {
            throw new common_1.NotFoundException('Leave type not found');
        }
        if (dto.name) {
            const existing = await this.prisma.leave_types.findFirst({
                where: {
                    name: dto.name,
                    NOT: { id },
                },
            });
            if (existing) {
                throw new common_1.BadRequestException('A leave type with this name already exists');
            }
        }
        if (dto.is_active === false) {
            const pendingCount = await this.prisma.leave_applications.count({
                where: {
                    leave_type_id: id,
                    status: 'Pending',
                },
            });
            if (pendingCount > 0) {
                throw new common_1.BadRequestException(`Cannot deactivate leave type with ${pendingCount} pending applications`);
            }
        }
        return this.prisma.leave_types.update({
            where: { id },
            data: {
                name: dto.name,
                description: dto.description,
                default_accrual_rate: dto.default_accrual_rate,
                requires_approval: dto.requires_approval,
                max_consecutive_days: dto.max_consecutive_days,
                is_active: dto.is_active,
            },
        });
    }
    async getLeaveBalances(year, userId, leaveTypeId) {
        const currentYear = year || new Date().getFullYear();
        const where = { year: currentYear };
        if (userId) {
            where.user_id = userId;
        }
        if (leaveTypeId) {
            where.leave_type_id = leaveTypeId;
        }
        return this.prisma.leave_balances.findMany({
            where,
            include: {
                users: {
                    select: {
                        id: true,
                        username: true,
                        first_name: true,
                        last_name: true,
                    },
                },
                leave_types: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
            orderBy: {
                users: {
                    username: 'asc',
                },
            },
        });
    }
    async adjustLeaveBalance(balanceId, dto) {
        const balance = await this.prisma.leave_balances.findUnique({
            where: { id: balanceId },
        });
        if (!balance) {
            throw new common_1.NotFoundException('Leave balance not found');
        }
        const adjustment = dto.new_balance - balance.balance;
        return this.prisma.leave_balances.update({
            where: { id: balanceId },
            data: {
                balance: dto.new_balance,
                accrued_this_year: (balance.accrued_this_year || 0) + Math.max(0, adjustment),
            },
        });
    }
    async runAccrual() {
        const accrualDate = new Date();
        const currentYear = accrualDate.getFullYear();
        const currentMonth = accrualDate.getMonth();
        let usersProcessed = 0;
        const users = await this.prisma.users.findMany({
            where: { is_active: true },
        });
        const leaveTypes = await this.prisma.leave_types.findMany({
            where: {
                is_active: true,
                default_accrual_rate: { not: null },
            },
        });
        for (const user of users) {
            for (const leaveType of leaveTypes) {
                let balance = await this.prisma.leave_balances.findFirst({
                    where: {
                        user_id: user.id,
                        leave_type_id: leaveType.id,
                        year: currentYear,
                    },
                });
                if (!balance) {
                    balance = await this.prisma.leave_balances.create({
                        data: {
                            user_id: user.id,
                            leave_type_id: leaveType.id,
                            year: currentYear,
                            balance: 0,
                            accrued_this_year: 0,
                            used_this_year: 0,
                        },
                    });
                }
                const lastAccrualDate = balance.last_accrual_date ? new Date(balance.last_accrual_date) : null;
                const needsAccrual = !lastAccrualDate ||
                    lastAccrualDate.getFullYear() !== currentYear ||
                    lastAccrualDate.getMonth() !== currentMonth;
                if (needsAccrual && leaveType.default_accrual_rate) {
                    const monthlyAccrual = leaveType.default_accrual_rate / 12;
                    await this.prisma.leave_balances.update({
                        where: { id: balance.id },
                        data: {
                            balance: balance.balance + monthlyAccrual,
                            accrued_this_year: (balance.accrued_this_year || 0) + monthlyAccrual,
                            last_accrual_date: accrualDate,
                        },
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
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LeaveService);
//# sourceMappingURL=leave.service.js.map