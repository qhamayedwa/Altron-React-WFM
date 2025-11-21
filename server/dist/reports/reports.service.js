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
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const time_entry_entity_1 = require("../entities/time-entry.entity");
const leave_application_entity_1 = require("../entities/leave-application.entity");
const pay_calculation_entity_1 = require("../entities/pay-calculation.entity");
const user_entity_1 = require("../entities/user.entity");
const department_entity_1 = require("../entities/department.entity");
let ReportsService = class ReportsService {
    timeEntryRepo;
    leaveApplicationRepo;
    payCalculationRepo;
    userRepo;
    departmentRepo;
    constructor(timeEntryRepo, leaveApplicationRepo, payCalculationRepo, userRepo, departmentRepo) {
        this.timeEntryRepo = timeEntryRepo;
        this.leaveApplicationRepo = leaveApplicationRepo;
        this.payCalculationRepo = payCalculationRepo;
        this.userRepo = userRepo;
        this.departmentRepo = departmentRepo;
    }
    async getTimeEntryReport(startDate, endDate, userId, departmentId) {
        const queryBuilder = this.timeEntryRepo
            .createQueryBuilder('timeEntry')
            .leftJoinAndSelect('timeEntry.user', 'user')
            .leftJoinAndSelect('user.department', 'department')
            .where('timeEntry.clockInTime BETWEEN :startDate AND :endDate', {
            startDate,
            endDate,
        });
        if (userId) {
            queryBuilder.andWhere('timeEntry.userId = :userId', { userId });
        }
        if (departmentId) {
            queryBuilder.andWhere('user.departmentId = :departmentId', { departmentId });
        }
        const entries = await queryBuilder
            .orderBy('timeEntry.clockInTime', 'DESC')
            .getMany();
        const totalHours = entries.reduce((sum, entry) => {
            if (entry.clockInTime && entry.clockOutTime) {
                const hours = (entry.clockOutTime.getTime() - entry.clockInTime.getTime()) / (1000 * 60 * 60);
                return sum + hours;
            }
            return sum;
        }, 0);
        return {
            success: true,
            entries: entries.map(entry => ({
                id: entry.id,
                userId: entry.userId,
                clockInTime: entry.clockInTime,
                clockOutTime: entry.clockOutTime,
                status: entry.status,
                notes: entry.notes,
                user: entry.user ? {
                    id: entry.user.id,
                    username: entry.user.username,
                    firstName: entry.user.firstName,
                    lastName: entry.user.lastName,
                    departmentId: entry.user.departmentId,
                } : null,
            })),
            summary: {
                totalEntries: entries.length,
                totalHours: totalHours.toFixed(2),
                period: { start: startDate, end: endDate },
            },
        };
    }
    async getLeaveReport(startDate, endDate, userId, departmentId) {
        const queryBuilder = this.leaveApplicationRepo
            .createQueryBuilder('leave')
            .leftJoinAndSelect('leave.user', 'user')
            .leftJoinAndSelect('leave.leaveType', 'leaveType')
            .leftJoinAndSelect('user.department', 'department')
            .where('leave.startDate >= :startDate', { startDate })
            .andWhere('leave.endDate <= :endDate', { endDate });
        if (userId) {
            queryBuilder.andWhere('leave.userId = :userId', { userId });
        }
        if (departmentId) {
            queryBuilder.andWhere('user.departmentId = :departmentId', { departmentId });
        }
        const applications = await queryBuilder
            .orderBy('leave.startDate', 'DESC')
            .getMany();
        const totalDays = applications.reduce((sum, app) => {
            const days = Math.ceil((app.endDate.getTime() - app.startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
            return sum + days;
        }, 0);
        const byStatus = applications.reduce((acc, app) => {
            acc[app.status] = (acc[app.status] || 0) + 1;
            return acc;
        }, {});
        return {
            success: true,
            applications: applications.map(app => ({
                id: app.id,
                userId: app.userId,
                leaveTypeId: app.leaveTypeId,
                startDate: app.startDate,
                endDate: app.endDate,
                reason: app.reason,
                status: app.status,
                isHourly: app.isHourly,
                hoursRequested: app.hoursRequested,
                user: app.user ? {
                    id: app.user.id,
                    username: app.user.username,
                    firstName: app.user.firstName,
                    lastName: app.user.lastName,
                    departmentId: app.user.departmentId,
                } : null,
                leaveType: app.leaveType ? {
                    id: app.leaveType.id,
                    name: app.leaveType.name,
                } : null,
            })),
            summary: {
                totalApplications: applications.length,
                totalDays,
                byStatus,
                period: { start: startDate, end: endDate },
            },
        };
    }
    async getAttendanceReport(startDate, endDate, departmentId) {
        const queryBuilder = this.timeEntryRepo
            .createQueryBuilder('timeEntry')
            .leftJoinAndSelect('timeEntry.user', 'user')
            .where('timeEntry.clockInTime BETWEEN :startDate AND :endDate', {
            startDate,
            endDate,
        });
        if (departmentId) {
            queryBuilder.andWhere('user.departmentId = :departmentId', { departmentId });
        }
        const entries = await queryBuilder.getMany();
        const byUser = entries.reduce((acc, entry) => {
            const userId = entry.userId;
            if (!acc[userId]) {
                acc[userId] = {
                    user: entry.user ? {
                        id: entry.user.id,
                        username: entry.user.username,
                        firstName: entry.user.firstName,
                        lastName: entry.user.lastName,
                    } : null,
                    totalDays: 0,
                    totalHours: 0,
                };
            }
            acc[userId].totalDays += 1;
            if (entry.clockInTime && entry.clockOutTime) {
                const hours = (entry.clockOutTime.getTime() - entry.clockInTime.getTime()) / (1000 * 60 * 60);
                acc[userId].totalHours += hours;
            }
            return acc;
        }, {});
        const attendance = Object.values(byUser);
        return {
            success: true,
            attendance,
            summary: {
                totalUniqueEmployees: attendance.length,
                totalAttendanceRecords: entries.length,
                period: { start: startDate, end: endDate },
            },
        };
    }
    async getPayrollSummary(startDate, endDate, departmentId) {
        const queryBuilder = this.payCalculationRepo
            .createQueryBuilder('calc')
            .leftJoinAndSelect('calc.user', 'user')
            .leftJoinAndSelect('user.department', 'department')
            .where('calc.payPeriodStart >= :startDate', { startDate })
            .andWhere('calc.payPeriodEnd <= :endDate', { endDate });
        if (departmentId) {
            queryBuilder.andWhere('user.departmentId = :departmentId', { departmentId });
        }
        const calculations = await queryBuilder
            .orderBy('calc.id', 'DESC')
            .getMany();
        const totalHours = calculations.reduce((sum, calc) => sum + Number(calc.totalHours || 0), 0);
        const totalAllowances = calculations.reduce((sum, calc) => sum + Number(calc.totalAllowances || 0), 0);
        return {
            success: true,
            calculations: calculations.map(calc => ({
                id: calc.id,
                userId: calc.userId,
                timeEntryId: calc.timeEntryId,
                payPeriodStart: calc.payPeriodStart,
                payPeriodEnd: calc.payPeriodEnd,
                payComponents: calc.payComponents,
                totalHours: calc.totalHours,
                regularHours: calc.regularHours,
                overtimeHours: calc.overtimeHours,
                doubleTimeHours: calc.doubleTimeHours,
                totalAllowances: calc.totalAllowances,
                user: calc.user ? {
                    id: calc.user.id,
                    username: calc.user.username,
                    firstName: calc.user.firstName,
                    lastName: calc.user.lastName,
                    departmentId: calc.user.departmentId,
                } : null,
            })),
            summary: {
                totalCalculations: calculations.length,
                totalHours: totalHours.toFixed(2),
                totalAllowances: totalAllowances.toFixed(2),
                period: { start: startDate, end: endDate },
            },
        };
    }
    convertToCSV(data, headers) {
        const headerRow = headers.join(',');
        const dataRows = data.map(row => {
            return headers.map(header => {
                const value = row[header] || '';
                return `"${String(value).replace(/"/g, '""')}"`;
            }).join(',');
        });
        return [headerRow, ...dataRows].join('\n');
    }
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(time_entry_entity_1.TimeEntry)),
    __param(1, (0, typeorm_1.InjectRepository)(leave_application_entity_1.LeaveApplication)),
    __param(2, (0, typeorm_1.InjectRepository)(pay_calculation_entity_1.PayCalculation)),
    __param(3, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(4, (0, typeorm_1.InjectRepository)(department_entity_1.Department)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ReportsService);
//# sourceMappingURL=reports.service.js.map