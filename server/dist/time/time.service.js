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
exports.TimeService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const time_entry_entity_1 = require("../entities/time-entry.entity");
const department_entity_1 = require("../entities/department.entity");
const user_entity_1 = require("../entities/user.entity");
let TimeService = class TimeService {
    timeEntryRepo;
    departmentRepo;
    userRepo;
    constructor(timeEntryRepo, departmentRepo, userRepo) {
        this.timeEntryRepo = timeEntryRepo;
        this.departmentRepo = departmentRepo;
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
    async clockIn(userId, dto) {
        const activeEntry = await this.timeEntryRepo.findOne({
            where: {
                userId: userId,
                clockOutTime: (0, typeorm_2.IsNull)(),
            },
        });
        if (activeEntry) {
            throw new common_1.BadRequestException('You are already clocked in');
        }
        const timeEntry = this.timeEntryRepo.create({
            userId: userId,
            clockInTime: new Date(),
            status: 'Open',
            notes: dto.notes,
            clockInLatitude: dto.latitude,
            clockInLongitude: dto.longitude,
        });
        const savedEntry = await this.timeEntryRepo.save(timeEntry);
        return {
            entry_id: savedEntry.id,
            clock_in_time: savedEntry.clockInTime,
            status: 'clocked_in',
        };
    }
    async clockOut(userId, dto) {
        const activeEntry = await this.timeEntryRepo.findOne({
            where: {
                userId: userId,
                clockOutTime: (0, typeorm_2.IsNull)(),
            },
        });
        if (!activeEntry) {
            throw new common_1.BadRequestException('You are not currently clocked in');
        }
        const clockOutTime = new Date();
        const totalHours = (clockOutTime.getTime() - activeEntry.clockInTime.getTime()) / (1000 * 60 * 60);
        activeEntry.clockOutTime = clockOutTime;
        activeEntry.status = 'Closed';
        activeEntry.clockOutLatitude = dto.latitude;
        activeEntry.clockOutLongitude = dto.longitude;
        activeEntry.notes = dto.notes
            ? activeEntry.notes
                ? `${activeEntry.notes}\n${dto.notes}`
                : dto.notes
            : activeEntry.notes;
        const updatedEntry = await this.timeEntryRepo.save(activeEntry);
        return {
            entry_id: updatedEntry.id,
            clock_out_time: updatedEntry.clockOutTime,
            total_hours: parseFloat(totalHours.toFixed(2)),
            status: 'clocked_out',
        };
    }
    async getCurrentStatus(userId) {
        const activeEntry = await this.timeEntryRepo.findOne({
            where: {
                userId: userId,
                clockOutTime: (0, typeorm_2.IsNull)(),
            },
        });
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayEntries = await this.timeEntryRepo.find({
            where: {
                userId: userId,
                clockInTime: (0, typeorm_2.MoreThanOrEqual)(today),
            },
        });
        const todayHours = todayEntries.reduce((sum, entry) => {
            if (entry.clockOutTime) {
                const hours = (entry.clockOutTime.getTime() - entry.clockInTime.getTime()) / (1000 * 60 * 60);
                return sum + hours;
            }
            return sum;
        }, 0);
        const statusData = {
            is_clocked_in: activeEntry !== null,
            today_hours: parseFloat(todayHours.toFixed(2)),
        };
        if (activeEntry) {
            const currentDuration = (new Date().getTime() - activeEntry.clockInTime.getTime()) / (1000 * 60 * 60);
            statusData.entry_id = activeEntry.id;
            statusData.clock_in_time = activeEntry.clockInTime;
            statusData.current_duration = parseFloat(currentDuration.toFixed(2));
        }
        return statusData;
    }
    async getTimeEntries(userId, dto, isSuperUser, managedDepartmentIds) {
        const { page = 1, per_page = 20, start_date, end_date, status, user_id } = dto;
        const skip = (page - 1) * per_page;
        const where = {};
        if (!isSuperUser && managedDepartmentIds.length === 0) {
            where.userId = userId;
        }
        else if (!isSuperUser && managedDepartmentIds.length > 0) {
            const usersInManagedDepts = await this.userRepo.find({
                where: { departmentId: (0, typeorm_2.In)(managedDepartmentIds) },
                select: ['id'],
            });
            const userIds = usersInManagedDepts.map((u) => u.id);
            where.userId = (0, typeorm_2.In)(userIds);
        }
        if (user_id && (isSuperUser || managedDepartmentIds.length > 0)) {
            if (!isSuperUser && managedDepartmentIds.length > 0) {
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
        if (start_date && end_date) {
            const endDateTime = new Date(end_date);
            endDateTime.setHours(23, 59, 59, 999);
            where.clockInTime = (0, typeorm_2.MoreThanOrEqual)(new Date(start_date));
            where.clockInTime = (0, typeorm_2.LessThanOrEqual)(endDateTime);
        }
        else if (start_date) {
            where.clockInTime = (0, typeorm_2.MoreThanOrEqual)(new Date(start_date));
        }
        else if (end_date) {
            const endDateTime = new Date(end_date);
            endDateTime.setHours(23, 59, 59, 999);
            where.clockInTime = (0, typeorm_2.LessThanOrEqual)(endDateTime);
        }
        if (status) {
            where.status = status;
        }
        const [entries, total] = await Promise.all([
            this.timeEntryRepo.find({
                where,
                relations: ['user'],
                order: {
                    clockInTime: 'DESC',
                },
                skip,
                take: per_page,
            }),
            this.timeEntryRepo.count({ where }),
        ]);
        return {
            entries: entries.map((entry) => {
                const totalHours = entry.clockOutTime
                    ? (entry.clockOutTime.getTime() - entry.clockInTime.getTime()) / (1000 * 60 * 60)
                    : 0;
                return {
                    id: entry.id,
                    user: {
                        id: entry.user.id,
                        username: entry.user.username,
                        first_name: entry.user.firstName,
                        last_name: entry.user.lastName,
                        employee_id: entry.user.employeeNumber,
                    },
                    clock_in_time: entry.clockInTime,
                    clock_out_time: entry.clockOutTime,
                    total_hours: parseFloat(totalHours.toFixed(2)),
                    status: entry.status,
                    notes: entry.notes,
                    approved_by_id: entry.approvedByManagerId,
                    clock_in_location: entry.clockInLatitude && entry.clockInLongitude
                        ? { latitude: entry.clockInLatitude, longitude: entry.clockInLongitude }
                        : null,
                    clock_out_location: entry.clockOutLatitude && entry.clockOutLongitude
                        ? { latitude: entry.clockOutLatitude, longitude: entry.clockOutLongitude }
                        : null,
                };
            }),
            pagination: {
                page,
                per_page,
                total,
                total_pages: Math.ceil(total / per_page),
            },
        };
    }
    async getPendingApprovals(userId, isSuperUser, managedDepartmentIds) {
        if (!isSuperUser && managedDepartmentIds.length === 0) {
            throw new common_1.ForbiddenException('You do not have permission to view pending approvals');
        }
        const where = {
            status: 'Closed',
        };
        if (!isSuperUser && managedDepartmentIds.length > 0) {
            const usersInManagedDepts = await this.userRepo.find({
                where: { departmentId: (0, typeorm_2.In)(managedDepartmentIds) },
                select: ['id'],
            });
            const userIds = usersInManagedDepts.map((u) => u.id);
            where.userId = (0, typeorm_2.In)(userIds);
        }
        const pendingEntries = await this.timeEntryRepo.find({
            where,
            relations: ['user', 'user.department'],
            order: {
                clockInTime: 'DESC',
            },
        });
        return pendingEntries.map((entry) => {
            const totalHours = entry.clockOutTime
                ? (entry.clockOutTime.getTime() - entry.clockInTime.getTime()) / (1000 * 60 * 60)
                : 0;
            return {
                id: entry.id,
                user: {
                    id: entry.user.id,
                    username: entry.user.username,
                    first_name: entry.user.firstName,
                    last_name: entry.user.lastName,
                    employee_id: entry.user.employeeNumber,
                    department: entry.user.department,
                },
                clock_in_time: entry.clockInTime,
                clock_out_time: entry.clockOutTime,
                total_hours: parseFloat(totalHours.toFixed(2)),
                status: entry.status,
                notes: entry.notes,
            };
        });
    }
    async approveTimeEntry(entryId, approverId, isSuperUser, managedDepartmentIds, notes) {
        const entry = await this.timeEntryRepo.findOne({
            where: { id: entryId },
            relations: ['user'],
        });
        if (!entry) {
            throw new common_1.NotFoundException('Time entry not found');
        }
        if (entry.status !== 'Closed') {
            throw new common_1.BadRequestException('Only closed time entries can be approved');
        }
        if (!isSuperUser) {
            const user = await this.userRepo.findOne({
                where: { id: entry.userId },
                select: ['departmentId'],
            });
            const userDeptId = user?.departmentId;
            if (!userDeptId || !managedDepartmentIds.includes(userDeptId)) {
                throw new common_1.ForbiddenException('You do not have permission to approve this time entry');
            }
        }
        const now = new Date();
        entry.status = 'Approved';
        entry.approvedByManagerId = approverId;
        entry.updatedAt = now;
        entry.notes = notes ? (entry.notes ? `${entry.notes}\nApproval note: ${notes}` : `Approval note: ${notes}`) : entry.notes;
        const updatedEntry = await this.timeEntryRepo.save(entry);
        return {
            entry_id: updatedEntry.id,
            status: updatedEntry.status,
            approved_at: now,
        };
    }
    async rejectTimeEntry(entryId, approverId, isSuperUser, managedDepartmentIds, notes) {
        const entry = await this.timeEntryRepo.findOne({
            where: { id: entryId },
            relations: ['user'],
        });
        if (!entry) {
            throw new common_1.NotFoundException('Time entry not found');
        }
        if (entry.status !== 'Closed') {
            throw new common_1.BadRequestException('Only closed time entries can be rejected');
        }
        if (!isSuperUser) {
            const user = await this.userRepo.findOne({
                where: { id: entry.userId },
                select: ['departmentId'],
            });
            const userDeptId = user?.departmentId;
            if (!userDeptId || !managedDepartmentIds.includes(userDeptId)) {
                throw new common_1.ForbiddenException('You do not have permission to reject this time entry');
            }
        }
        const now = new Date();
        entry.status = 'Rejected';
        entry.approvedByManagerId = approverId;
        entry.updatedAt = now;
        entry.notes = notes ? (entry.notes ? `${entry.notes}\nRejection reason: ${notes}` : `Rejection reason: ${notes}`) : entry.notes;
        const updatedEntry = await this.timeEntryRepo.save(entry);
        return {
            entry_id: updatedEntry.id,
            status: updatedEntry.status,
            rejected_at: now,
        };
    }
};
exports.TimeService = TimeService;
exports.TimeService = TimeService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(time_entry_entity_1.TimeEntry)),
    __param(1, (0, typeorm_1.InjectRepository)(department_entity_1.Department)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], TimeService);
//# sourceMappingURL=time.service.js.map