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
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const time_entry_entity_1 = require("../entities/time-entry.entity");
const leave_application_entity_1 = require("../entities/leave-application.entity");
const leave_balance_entity_1 = require("../entities/leave-balance.entity");
const user_entity_1 = require("../entities/user.entity");
const dashboard_config_entity_1 = require("../entities/dashboard-config.entity");
const department_entity_1 = require("../entities/department.entity");
let DashboardService = class DashboardService {
    dashboardConfigRepo;
    userRepo;
    timeEntryRepo;
    leaveApplicationRepo;
    leaveBalanceRepo;
    departmentRepo;
    constructor(dashboardConfigRepo, userRepo, timeEntryRepo, leaveApplicationRepo, leaveBalanceRepo, departmentRepo) {
        this.dashboardConfigRepo = dashboardConfigRepo;
        this.userRepo = userRepo;
        this.timeEntryRepo = timeEntryRepo;
        this.leaveApplicationRepo = leaveApplicationRepo;
        this.leaveBalanceRepo = leaveBalanceRepo;
        this.departmentRepo = departmentRepo;
    }
    async getDashboardStats(userId, role) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const timeEntriesToday = await this.timeEntryRepo.find({
            where: {
                userId: userId,
                clockInTime: (0, typeorm_2.MoreThanOrEqual)(today),
            },
            order: { clockInTime: 'DESC' },
        });
        const leaveApplications = await this.leaveApplicationRepo.find({
            where: {
                userId: userId,
            },
            relations: ['leaveType'],
            order: { createdAt: 'DESC' },
            take: 5,
        });
        const leaveBalances = await this.leaveBalanceRepo.find({
            where: {
                userId: userId,
            },
            relations: ['leaveType'],
        });
        let pendingApprovals = 0;
        if (['Manager', 'Admin', 'Super User', 'system_super_admin'].includes(role)) {
            const pendingTimeEntries = await this.timeEntryRepo.count({
                where: {
                    status: 'pending',
                },
            });
            const pendingLeaveApps = await this.leaveApplicationRepo.count({
                where: {
                    status: 'pending',
                },
            });
            pendingApprovals = pendingTimeEntries + pendingLeaveApps;
        }
        return {
            success: true,
            stats: {
                timeEntriesToday: timeEntriesToday.length,
                pendingApprovals: pendingApprovals,
                leaveBalances: leaveBalances.length,
                recentLeaveApplications: leaveApplications.length,
            },
            recentActivities: {
                timeEntries: timeEntriesToday.slice(0, 5),
                leaveApplications: leaveApplications,
            },
            leaveBalances: leaveBalances,
        };
    }
    async getPendingApprovals(role) {
        if (!['Manager', 'Admin', 'Super User', 'system_super_admin'].includes(role)) {
            return {
                success: true,
                pendingTimeEntries: [],
                pendingLeaveApplications: []
            };
        }
        const pendingTimeEntries = await this.timeEntryRepo.find({
            where: {
                status: 'pending',
            },
            relations: ['user'],
            order: { clockInTime: 'DESC' },
            take: 10,
        });
        const pendingLeaveApplications = await this.leaveApplicationRepo.find({
            where: {
                status: 'pending',
            },
            relations: ['user', 'leaveType'],
            order: { createdAt: 'DESC' },
            take: 10,
        });
        return {
            success: true,
            pendingTimeEntries: pendingTimeEntries,
            pendingLeaveApplications: pendingLeaveApplications,
        };
    }
    async getRecentActivities(userId, role) {
        const activities = [];
        const recentTimeEntries = await this.timeEntryRepo.find({
            where: {
                userId: userId,
            },
            order: { clockInTime: 'DESC' },
            take: 5,
        });
        for (const entry of recentTimeEntries) {
            activities.push({
                type: 'time_entry',
                timestamp: entry.clockInTime,
                description: `Clocked ${entry.status}`,
                data: entry,
            });
        }
        const recentLeaveApps = await this.leaveApplicationRepo.find({
            where: {
                userId: userId,
            },
            relations: ['leaveType'],
            order: { createdAt: 'DESC' },
            take: 5,
        });
        for (const app of recentLeaveApps) {
            activities.push({
                type: 'leave_application',
                timestamp: app.createdAt || new Date(),
                description: `Leave application ${app.status}`,
                data: app,
            });
        }
        activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        return {
            success: true,
            activities: activities.slice(0, 10),
        };
    }
    async getDashboardConfig(userId) {
        const config = await this.dashboardConfigRepo.findOne({
            where: {
                createdBy: userId,
                isActive: true,
            },
            order: { updatedAt: 'DESC' },
        });
        return {
            success: true,
            config: config,
        };
    }
    async saveDashboardConfig(userId, configName, configData) {
        await this.dashboardConfigRepo.update({ createdBy: userId, isActive: true }, { isActive: false });
        const newConfig = this.dashboardConfigRepo.create({
            configName,
            configData: JSON.stringify(configData),
            createdBy: userId,
            isActive: true,
        });
        const savedConfig = await this.dashboardConfigRepo.save(newConfig);
        return {
            success: true,
            config: savedConfig,
        };
    }
    async getTeamStats(userId) {
        const user = await this.userRepo.findOne({
            where: { id: userId },
            relations: ['department'],
        });
        if (!user || !user.departmentId) {
            return {
                success: false,
                message: 'User has no department assigned',
            };
        }
        const teamMembers = await this.userRepo
            .createQueryBuilder('user')
            .where('user.departmentId = :departmentId', { departmentId: user.departmentId })
            .andWhere('user.isActive = :isActive', { isActive: true })
            .getCount();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const teamTimeEntriesToday = await this.timeEntryRepo
            .createQueryBuilder('timeEntry')
            .innerJoin('timeEntry.user', 'user')
            .where('user.departmentId = :departmentId', { departmentId: user.departmentId })
            .andWhere('timeEntry.clockInTime >= :today', { today })
            .getCount();
        const teamPendingLeave = await this.leaveApplicationRepo
            .createQueryBuilder('leaveApp')
            .innerJoin('leaveApp.user', 'user')
            .where('user.departmentId = :departmentId', { departmentId: user.departmentId })
            .andWhere('leaveApp.status = :status', { status: 'pending' })
            .getCount();
        return {
            success: true,
            stats: {
                teamMembers,
                activeToday: teamTimeEntriesToday,
                pendingLeaveRequests: teamPendingLeave,
            },
        };
    }
    async getAttendanceSummary(userId, startDate, endDate) {
        const timeEntries = await this.timeEntryRepo
            .createQueryBuilder('timeEntry')
            .where('timeEntry.userId = :userId', { userId })
            .andWhere('timeEntry.clockInTime >= :startDate', { startDate })
            .andWhere('timeEntry.clockInTime <= :endDate', { endDate })
            .orderBy('timeEntry.clockInTime', 'DESC')
            .getMany();
        let totalHours = 0;
        let totalDays = 0;
        for (const entry of timeEntries) {
            if (entry.clockOutTime) {
                const hours = (entry.clockOutTime.getTime() - entry.clockInTime.getTime()) / (1000 * 60 * 60);
                totalHours += hours;
                totalDays++;
            }
        }
        return {
            success: true,
            summary: {
                totalDays,
                totalHours: Math.round(totalHours * 100) / 100,
                averageHoursPerDay: totalDays > 0 ? Math.round((totalHours / totalDays) * 100) / 100 : 0,
                entries: timeEntries,
            },
        };
    }
    async getLeaveSummary(userId, year) {
        const currentYear = year || new Date().getFullYear();
        const leaveBalances = await this.leaveBalanceRepo.find({
            where: {
                userId: userId,
                year: currentYear,
            },
            relations: ['leaveType'],
        });
        const leaveApplications = await this.leaveApplicationRepo
            .createQueryBuilder('leaveApp')
            .where('leaveApp.userId = :userId', { userId })
            .andWhere('EXTRACT(YEAR FROM leaveApp.startDate) = :year', { year: currentYear })
            .leftJoinAndSelect('leaveApp.leaveType', 'leaveType')
            .orderBy('leaveApp.startDate', 'DESC')
            .getMany();
        return {
            success: true,
            summary: {
                year: currentYear,
                balances: leaveBalances,
                applications: leaveApplications,
            },
        };
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(dashboard_config_entity_1.DashboardConfig)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(2, (0, typeorm_1.InjectRepository)(time_entry_entity_1.TimeEntry)),
    __param(3, (0, typeorm_1.InjectRepository)(leave_application_entity_1.LeaveApplication)),
    __param(4, (0, typeorm_1.InjectRepository)(leave_balance_entity_1.LeaveBalance)),
    __param(5, (0, typeorm_1.InjectRepository)(department_entity_1.Department)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map