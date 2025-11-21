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
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const dto_1 = require("./dto");
let NotificationsService = class NotificationsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createNotification(dto) {
        let notificationType = await this.prisma.notification_types.findFirst({
            where: { name: dto.type_name },
        });
        if (!notificationType) {
            notificationType = await this.prisma.notification_types.create({
                data: {
                    name: dto.type_name,
                    display_name: dto.type_name.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
                    icon: 'bell',
                    color: 'primary',
                    is_active: true,
                },
            });
        }
        const expiresAt = dto.expires_hours
            ? new Date(Date.now() + dto.expires_hours * 60 * 60 * 1000)
            : null;
        const notification = await this.prisma.notifications.create({
            data: {
                user_id: dto.user_id,
                type_id: notificationType.id,
                title: dto.title,
                message: dto.message,
                action_url: dto.action_url,
                action_text: dto.action_text,
                priority: dto.priority || dto_1.NotificationPriority.MEDIUM,
                category: dto.category,
                related_entity_type: dto.related_entity_type,
                related_entity_id: dto.related_entity_id,
                expires_at: expiresAt,
                is_read: false,
            },
        });
        return { success: true, notification };
    }
    async createLeaveApprovalNotification(leaveApplicationId) {
        const leaveApp = await this.prisma.leave_applications.findUnique({
            where: { id: leaveApplicationId },
            include: {
                users_leave_applications_user_idTousers: true,
                leave_types: true,
            },
        });
        if (!leaveApp || !leaveApp.users_leave_applications_user_idTousers.department_id) {
            return null;
        }
        const department = await this.prisma.departments.findUnique({
            where: { id: leaveApp.users_leave_applications_user_idTousers.department_id },
        });
        if (!department) {
            return null;
        }
        const managerIds = [department.manager_id, department.deputy_manager_id].filter((id) => id !== null);
        const startDate = new Date(leaveApp.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const endDate = new Date(leaveApp.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const totalDays = Math.ceil((leaveApp.end_date.getTime() - leaveApp.start_date.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        const employeeName = `${leaveApp.users_leave_applications_user_idTousers.first_name || ''} ${leaveApp.users_leave_applications_user_idTousers.last_name || ''}`.trim() || leaveApp.users_leave_applications_user_idTousers.username;
        for (const managerId of managerIds) {
            await this.createNotification({
                user_id: managerId,
                type_name: 'leave_approval_required',
                title: 'Leave Approval Required',
                message: `${employeeName} has requested ${totalDays} days of ${leaveApp.leave_types?.name || 'leave'} from ${startDate} to ${endDate}`,
                action_url: '/leave/approvals',
                action_text: 'Review Request',
                priority: dto_1.NotificationPriority.HIGH,
                category: dto_1.NotificationCategory.LEAVE,
                related_entity_type: 'LeaveApplication',
                related_entity_id: leaveApplicationId,
                expires_hours: 168,
            });
        }
        return { success: true };
    }
    async createLeaveStatusNotification(leaveApplicationId, status) {
        const leaveApp = await this.prisma.leave_applications.findUnique({
            where: { id: leaveApplicationId },
            include: {
                users_leave_applications_user_idTousers: true,
                leave_types: true,
            },
        });
        if (!leaveApp) {
            return null;
        }
        const startDate = new Date(leaveApp.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const endDate = new Date(leaveApp.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const statusMessages = {
            Approved: `Your leave request from ${startDate} to ${endDate} has been approved.`,
            Rejected: `Your leave request from ${startDate} to ${endDate} has been rejected.`,
            Cancelled: `Your leave request from ${startDate} to ${endDate} has been cancelled.`,
        };
        const priorityMap = {
            Approved: dto_1.NotificationPriority.MEDIUM,
            Rejected: dto_1.NotificationPriority.HIGH,
            Cancelled: dto_1.NotificationPriority.LOW,
        };
        await this.createNotification({
            user_id: leaveApp.user_id,
            type_name: 'leave_status_update',
            title: `Leave Request ${status}`,
            message: statusMessages[status] || `Your leave request status has been updated to ${status}.`,
            action_url: '/leave/applications',
            action_text: 'View Details',
            priority: priorityMap[status] || dto_1.NotificationPriority.MEDIUM,
            category: dto_1.NotificationCategory.LEAVE,
            related_entity_type: 'LeaveApplication',
            related_entity_id: leaveApplicationId,
            expires_hours: 72,
        });
        return { success: true };
    }
    async getUserNotifications(userId, limit = 50, unreadOnly = false, category) {
        const user = await this.prisma.users.findUnique({
            where: { id: userId },
            include: { user_roles: { include: { roles: true } } },
        });
        if (!user) {
            return [];
        }
        const isManager = user.user_roles.some((ur) => ur.roles.name === 'Manager');
        const whereConditions = {
            OR: [{ user_id: userId }],
            expires_at: {
                OR: [{ equals: null }, { gt: new Date() }],
            },
        };
        if (isManager && user.department_id) {
            const departmentEmployees = await this.prisma.users.findMany({
                where: {
                    department_id: user.department_id,
                    is_active: true,
                },
                select: { id: true },
            });
            const employeeIds = departmentEmployees.map((emp) => emp.id);
            if (employeeIds.length > 0) {
                whereConditions.OR.push({
                    AND: [
                        { user_id: { in: employeeIds } },
                        { category: { in: ['leave', 'timecard', 'attendance', 'urgent_approval'] } },
                    ],
                });
            }
        }
        if (unreadOnly) {
            whereConditions.is_read = false;
        }
        if (category) {
            whereConditions.category = category;
        }
        const notifications = await this.prisma.notifications.findMany({
            where: whereConditions,
            include: {
                notification_types: true,
                users: {
                    select: {
                        id: true,
                        username: true,
                        first_name: true,
                        last_name: true,
                    },
                },
            },
            orderBy: { created_at: 'desc' },
            take: limit,
        });
        return notifications;
    }
    async getUnreadCount(userId) {
        const user = await this.prisma.users.findUnique({
            where: { id: userId },
            include: { user_roles: { include: { roles: true } } },
        });
        if (!user) {
            return 0;
        }
        const isManager = user.user_roles.some((ur) => ur.roles.name === 'Manager');
        const whereConditions = {
            OR: [{ user_id: userId }],
            is_read: false,
            expires_at: {
                OR: [{ equals: null }, { gt: new Date() }],
            },
        };
        if (isManager && user.department_id) {
            const departmentEmployees = await this.prisma.users.findMany({
                where: {
                    department_id: user.department_id,
                    is_active: true,
                },
                select: { id: true },
            });
            const employeeIds = departmentEmployees.map((emp) => emp.id);
            if (employeeIds.length > 0) {
                whereConditions.OR.push({
                    AND: [
                        { user_id: { in: employeeIds } },
                        { category: { in: ['leave', 'timecard', 'attendance', 'urgent_approval'] } },
                    ],
                });
            }
        }
        const count = await this.prisma.notifications.count({
            where: whereConditions,
        });
        return count;
    }
    async markAsRead(notificationId, userId) {
        const notification = await this.prisma.notifications.findFirst({
            where: {
                id: notificationId,
                user_id: userId,
            },
        });
        if (!notification) {
            throw new common_1.NotFoundException('Notification not found');
        }
        const updated = await this.prisma.notifications.update({
            where: { id: notificationId },
            data: {
                is_read: true,
                read_at: new Date(),
            },
        });
        return { success: true, notification: updated };
    }
    async markAllAsRead(userId) {
        const result = await this.prisma.notifications.updateMany({
            where: {
                user_id: userId,
                is_read: false,
            },
            data: {
                is_read: true,
                read_at: new Date(),
            },
        });
        return { success: true, count: result.count };
    }
    async cleanupExpired() {
        const result = await this.prisma.notifications.deleteMany({
            where: {
                expires_at: {
                    lt: new Date(),
                },
            },
        });
        return { success: true, count: result.count };
    }
    async getNotificationTypes() {
        return this.prisma.notification_types.findMany({
            where: { is_active: true },
        });
    }
    async getUserPreferences(userId) {
        return this.prisma.notification_preferences.findMany({
            where: { user_id: userId },
            include: { notification_types: true },
        });
    }
    async updatePreference(userId, typeId, preferences) {
        const existing = await this.prisma.notification_preferences.findFirst({
            where: {
                user_id: userId,
                type_id: typeId,
            },
        });
        if (existing) {
            return this.prisma.notification_preferences.update({
                where: { id: existing.id },
                data: preferences,
            });
        }
        else {
            return this.prisma.notification_preferences.create({
                data: {
                    user_id: userId,
                    type_id: typeId,
                    ...preferences,
                },
            });
        }
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map