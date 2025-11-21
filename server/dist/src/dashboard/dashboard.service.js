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
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let DashboardService = class DashboardService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getDashboardStats(userId, role) {
        const today = new Date();
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const timeEntriesToday = await this.prisma.time_entries.findMany({
            where: {
                user_id: userId,
                clock_in_time: {
                    gte: new Date(today.setHours(0, 0, 0, 0)),
                },
            },
        });
        const leaveApplications = await this.prisma.leave_applications.findMany({
            where: {
                user_id: userId,
            },
            orderBy: { created_at: 'desc' },
            take: 5,
        });
        const leaveBalances = await this.prisma.leave_balances.findMany({
            where: {
                user_id: userId,
            },
            include: {
                leave_types: true,
            },
        });
        let pendingApprovals = 0;
        if (['Manager', 'Admin', 'Super User', 'system_super_admin'].includes(role)) {
            const pendingTimeEntries = await this.prisma.time_entries.count({
                where: {
                    status: 'pending',
                },
            });
            const pendingLeaveApps = await this.prisma.leave_applications.count({
                where: {
                    status: 'pending',
                },
            });
            pendingApprovals = pendingTimeEntries + pendingLeaveApps;
        }
        return {
            success: true,
            stats: {
                time_entries_today: timeEntriesToday.length,
                pending_approvals: pendingApprovals,
                leave_balances: leaveBalances.length,
                recent_leave_applications: leaveApplications.length,
            },
            recent_activities: {
                time_entries: timeEntriesToday.slice(0, 5),
                leave_applications: leaveApplications,
            },
            leave_balances: leaveBalances,
        };
    }
    async getPendingApprovals(role) {
        if (!['Manager', 'Admin', 'Super User', 'system_super_admin'].includes(role)) {
            return { success: true, pending_time_entries: [], pending_leave_applications: [] };
        }
        const pendingTimeEntries = await this.prisma.time_entries.findMany({
            where: {
                status: 'pending',
            },
            include: {
                users_time_entries_user_idTousers: {
                    select: {
                        id: true,
                        username: true,
                        first_name: true,
                        last_name: true,
                    },
                },
            },
            orderBy: { clock_in_time: 'desc' },
            take: 10,
        });
        const pendingLeaveApplications = await this.prisma.leave_applications.findMany({
            where: {
                status: 'pending',
            },
            include: {
                users_leave_applications_user_idTousers: {
                    select: {
                        id: true,
                        username: true,
                        first_name: true,
                        last_name: true,
                    },
                },
                leave_types: true,
            },
            orderBy: { created_at: 'desc' },
            take: 10,
        });
        return {
            success: true,
            pending_time_entries: pendingTimeEntries,
            pending_leave_applications: pendingLeaveApplications,
        };
    }
    async getRecentActivities(userId, role) {
        const activities = [];
        const recentTimeEntries = await this.prisma.time_entries.findMany({
            where: {
                user_id: userId,
            },
            orderBy: { clock_in_time: 'desc' },
            take: 5,
        });
        for (const entry of recentTimeEntries) {
            activities.push({
                type: 'time_entry',
                timestamp: entry.clock_in_time,
                description: `Clocked ${entry.status}`,
                data: entry,
            });
        }
        const recentLeaveApps = await this.prisma.leave_applications.findMany({
            where: {
                user_id: userId,
            },
            orderBy: { created_at: 'desc' },
            take: 5,
        });
        for (const app of recentLeaveApps) {
            activities.push({
                type: 'leave_application',
                timestamp: app.created_at || new Date(),
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
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map