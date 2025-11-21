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
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const department_entity_1 = require("../entities/department.entity");
const leave_application_entity_1 = require("../entities/leave-application.entity");
const leave_type_entity_1 = require("../entities/leave-type.entity");
const notification_entity_1 = require("../entities/notification.entity");
const notification_preference_entity_1 = require("../entities/notification-preference.entity");
const notification_type_entity_1 = require("../entities/notification-type.entity");
const user_entity_1 = require("../entities/user.entity");
const dto_1 = require("./dto");
let NotificationsService = class NotificationsService {
    departmentRepo;
    leaveApplicationRepo;
    leaveTypeRepo;
    notificationRepo;
    notificationPreferenceRepo;
    notificationTypeRepo;
    userRepo;
    constructor(departmentRepo, leaveApplicationRepo, leaveTypeRepo, notificationRepo, notificationPreferenceRepo, notificationTypeRepo, userRepo) {
        this.departmentRepo = departmentRepo;
        this.leaveApplicationRepo = leaveApplicationRepo;
        this.leaveTypeRepo = leaveTypeRepo;
        this.notificationRepo = notificationRepo;
        this.notificationPreferenceRepo = notificationPreferenceRepo;
        this.notificationTypeRepo = notificationTypeRepo;
        this.userRepo = userRepo;
    }
    async createNotification(dto) {
        let notificationType = await this.notificationTypeRepo.findOne({
            where: { name: dto.type_name },
        });
        if (!notificationType) {
            notificationType = await this.notificationTypeRepo.save(this.notificationTypeRepo.create({
                name: dto.type_name,
                displayName: dto.type_name.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
                icon: 'bell',
                color: 'primary',
                isActive: true,
            }));
        }
        const notificationData = {
            userId: dto.user_id,
            typeId: notificationType.id,
            title: dto.title,
            message: dto.message,
            priority: dto.priority || dto_1.NotificationPriority.MEDIUM,
            isRead: false,
        };
        if (dto.action_url) {
            notificationData.actionUrl = dto.action_url;
        }
        if (dto.action_text) {
            notificationData.actionText = dto.action_text;
        }
        if (dto.category) {
            notificationData.category = dto.category;
        }
        if (dto.related_entity_type) {
            notificationData.relatedEntityType = dto.related_entity_type;
        }
        if (dto.related_entity_id) {
            notificationData.relatedEntityId = dto.related_entity_id;
        }
        if (dto.expires_hours) {
            notificationData.expiresAt = new Date(Date.now() + dto.expires_hours * 60 * 60 * 1000);
        }
        const notification = await this.notificationRepo.save(this.notificationRepo.create(notificationData));
        return { success: true, notification };
    }
    async createLeaveApprovalNotification(leaveApplicationId) {
        const leaveApp = await this.leaveApplicationRepo.findOne({
            where: { id: leaveApplicationId },
            relations: {
                user: true,
                leaveType: true,
            },
        });
        if (!leaveApp || !leaveApp.user.departmentId) {
            return null;
        }
        const department = await this.departmentRepo.findOne({
            where: { id: leaveApp.user.departmentId },
        });
        if (!department) {
            return null;
        }
        const managerIds = [department.managerId, department.deputyManagerId].filter((id) => id !== null);
        const startDate = new Date(leaveApp.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const endDate = new Date(leaveApp.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const totalDays = Math.ceil((leaveApp.endDate.getTime() - leaveApp.startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        const employeeName = `${leaveApp.user.firstName || ''} ${leaveApp.user.lastName || ''}`.trim() || leaveApp.user.username;
        for (const managerId of managerIds) {
            await this.createNotification({
                user_id: managerId,
                type_name: 'leave_approval_required',
                title: 'Leave Approval Required',
                message: `${employeeName} has requested ${totalDays} days of ${leaveApp.leaveType?.name || 'leave'} from ${startDate} to ${endDate}`,
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
        const leaveApp = await this.leaveApplicationRepo.findOne({
            where: { id: leaveApplicationId },
            relations: {
                user: true,
                leaveType: true,
            },
        });
        if (!leaveApp) {
            return null;
        }
        const startDate = new Date(leaveApp.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const endDate = new Date(leaveApp.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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
            user_id: leaveApp.userId,
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
        const user = await this.userRepo.findOne({
            where: { id: userId },
            relations: {
                userRoles: {
                    role: true,
                },
            },
        });
        if (!user) {
            return [];
        }
        const isManager = user.userRoles?.some((ur) => ur.role?.name === 'Manager');
        const queryBuilder = this.notificationRepo.createQueryBuilder('notification')
            .leftJoinAndSelect('notification.notificationType', 'notificationType')
            .leftJoinAndSelect('notification.user', 'user')
            .where('notification.userId = :userId', { userId });
        if (isManager && user.departmentId) {
            const departmentEmployees = await this.userRepo.find({
                where: {
                    departmentId: user.departmentId,
                    isActive: true,
                },
                select: ['id'],
            });
            const employeeIds = departmentEmployees.map((emp) => emp.id);
            if (employeeIds.length > 0) {
                queryBuilder.orWhere('(notification.userId IN (:...employeeIds) AND notification.category IN (:...categories))', {
                    employeeIds,
                    categories: ['leave', 'timecard', 'attendance', 'urgent_approval'],
                });
            }
        }
        queryBuilder.andWhere('(notification.expiresAt IS NULL OR notification.expiresAt > :now)', { now: new Date() });
        if (unreadOnly) {
            queryBuilder.andWhere('notification.isRead = :isRead', { isRead: false });
        }
        if (category) {
            queryBuilder.andWhere('notification.category = :category', { category });
        }
        queryBuilder
            .orderBy('notification.createdAt', 'DESC')
            .take(limit);
        const notifications = await queryBuilder.getMany();
        return notifications;
    }
    async getUnreadCount(userId) {
        const user = await this.userRepo.findOne({
            where: { id: userId },
            relations: {
                userRoles: {
                    role: true,
                },
            },
        });
        if (!user) {
            return 0;
        }
        const isManager = user.userRoles?.some((ur) => ur.role?.name === 'Manager');
        const queryBuilder = this.notificationRepo.createQueryBuilder('notification')
            .where('notification.userId = :userId', { userId })
            .andWhere('notification.isRead = :isRead', { isRead: false });
        if (isManager && user.departmentId) {
            const departmentEmployees = await this.userRepo.find({
                where: {
                    departmentId: user.departmentId,
                    isActive: true,
                },
                select: ['id'],
            });
            const employeeIds = departmentEmployees.map((emp) => emp.id);
            if (employeeIds.length > 0) {
                queryBuilder.orWhere('(notification.userId IN (:...employeeIds) AND notification.category IN (:...categories) AND notification.isRead = :isRead)', {
                    employeeIds,
                    categories: ['leave', 'timecard', 'attendance', 'urgent_approval'],
                    isRead: false,
                });
            }
        }
        queryBuilder.andWhere('(notification.expiresAt IS NULL OR notification.expiresAt > :now)', { now: new Date() });
        const count = await queryBuilder.getCount();
        return count;
    }
    async markAsRead(notificationId, userId) {
        const notification = await this.notificationRepo.findOne({
            where: {
                id: notificationId,
                userId: userId,
            },
        });
        if (!notification) {
            throw new common_1.NotFoundException('Notification not found');
        }
        await this.notificationRepo.update({ id: notificationId }, {
            isRead: true,
            readAt: new Date(),
        });
        const updated = await this.notificationRepo.findOne({
            where: { id: notificationId },
        });
        return { success: true, notification: updated };
    }
    async markAllAsRead(userId) {
        const result = await this.notificationRepo.update({
            userId: userId,
            isRead: false,
        }, {
            isRead: true,
            readAt: new Date(),
        });
        return { success: true, count: result.affected || 0 };
    }
    async cleanupExpired() {
        const result = await this.notificationRepo.delete({
            expiresAt: (0, typeorm_2.LessThan)(new Date()),
        });
        return { success: true, count: result.affected || 0 };
    }
    async getNotificationTypes() {
        return this.notificationTypeRepo.find({
            where: { isActive: true },
        });
    }
    async getUserPreferences(userId) {
        return this.notificationPreferenceRepo.find({
            where: { userId: userId },
            relations: { notificationType: true },
        });
    }
    async updatePreference(userId, typeId, preferences) {
        const existing = await this.notificationPreferenceRepo.findOne({
            where: {
                userId: userId,
                typeId: typeId,
            },
        });
        if (existing) {
            await this.notificationPreferenceRepo.update({ id: existing.id }, preferences);
            return this.notificationPreferenceRepo.findOne({
                where: { id: existing.id },
            });
        }
        else {
            return this.notificationPreferenceRepo.save(this.notificationPreferenceRepo.create({
                userId: userId,
                typeId: typeId,
                ...preferences,
            }));
        }
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(department_entity_1.Department)),
    __param(1, (0, typeorm_1.InjectRepository)(leave_application_entity_1.LeaveApplication)),
    __param(2, (0, typeorm_1.InjectRepository)(leave_type_entity_1.LeaveType)),
    __param(3, (0, typeorm_1.InjectRepository)(notification_entity_1.Notification)),
    __param(4, (0, typeorm_1.InjectRepository)(notification_preference_entity_1.NotificationPreference)),
    __param(5, (0, typeorm_1.InjectRepository)(notification_type_entity_1.NotificationType)),
    __param(6, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map