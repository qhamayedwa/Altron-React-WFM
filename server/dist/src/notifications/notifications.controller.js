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
exports.NotificationsController = void 0;
const common_1 = require("@nestjs/common");
const notifications_service_1 = require("./notifications.service");
const dto_1 = require("./dto");
const authenticated_guard_1 = require("../auth/guards/authenticated.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
let NotificationsController = class NotificationsController {
    notificationsService;
    constructor(notificationsService) {
        this.notificationsService = notificationsService;
    }
    async createNotification(dto) {
        return this.notificationsService.createNotification(dto);
    }
    async getMyNotifications(req, limit, unreadOnly, category) {
        const userId = req.user.id;
        const parsedLimit = limit ? parseInt(limit, 10) : 50;
        const parsedUnreadOnly = unreadOnly === 'true';
        const notifications = await this.notificationsService.getUserNotifications(userId, parsedLimit, parsedUnreadOnly, category);
        return { success: true, notifications };
    }
    async getUnreadCount(req) {
        const count = await this.notificationsService.getUnreadCount(req.user.id);
        return { success: true, count };
    }
    async getRecentNotifications(req, limit) {
        const userId = req.user.id;
        const parsedLimit = limit ? parseInt(limit, 10) : 5;
        const notifications = await this.notificationsService.getUserNotifications(userId, parsedLimit, false);
        return { success: true, notifications };
    }
    async markAsRead(id, req) {
        return this.notificationsService.markAsRead(id, req.user.id);
    }
    async markAllAsRead(req) {
        return this.notificationsService.markAllAsRead(req.user.id);
    }
    async getNotificationTypes() {
        const types = await this.notificationsService.getNotificationTypes();
        return { success: true, types };
    }
    async getUserPreferences(req) {
        const preferences = await this.notificationsService.getUserPreferences(req.user.id);
        return { success: true, preferences };
    }
    async updatePreference(typeId, req, dto) {
        const preference = await this.notificationsService.updatePreference(req.user.id, typeId, dto);
        return { success: true, preference };
    }
    async cleanupExpired() {
        return this.notificationsService.cleanupExpired();
    }
    async createLeaveApprovalNotification(id) {
        return this.notificationsService.createLeaveApprovalNotification(id);
    }
    async createLeaveStatusNotification(id, status) {
        return this.notificationsService.createLeaveStatusNotification(id, status);
    }
};
exports.NotificationsController = NotificationsController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('Super User', 'Admin', 'system_super_admin'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateNotificationDto]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "createNotification", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('unread_only')),
    __param(3, (0, common_1.Query)('category')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "getMyNotifications", null);
__decorate([
    (0, common_1.Get)('unread-count'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "getUnreadCount", null);
__decorate([
    (0, common_1.Get)('recent'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "getRecentNotifications", null);
__decorate([
    (0, common_1.Post)(':id/mark-read'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "markAsRead", null);
__decorate([
    (0, common_1.Post)('mark-all-read'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "markAllAsRead", null);
__decorate([
    (0, common_1.Get)('types'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "getNotificationTypes", null);
__decorate([
    (0, common_1.Get)('preferences'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "getUserPreferences", null);
__decorate([
    (0, common_1.Post)('preferences/:typeId'),
    __param(0, (0, common_1.Param)('typeId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, dto_1.UpdateNotificationPreferenceDto]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "updatePreference", null);
__decorate([
    (0, common_1.Post)('cleanup-expired'),
    (0, roles_decorator_1.Roles)('Super User', 'Admin', 'system_super_admin'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "cleanupExpired", null);
__decorate([
    (0, common_1.Post)('leave-approval/:id'),
    (0, roles_decorator_1.Roles)('Super User', 'Admin', 'HR', 'Manager', 'system_super_admin'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "createLeaveApprovalNotification", null);
__decorate([
    (0, common_1.Post)('leave-status/:id'),
    (0, roles_decorator_1.Roles)('Super User', 'Admin', 'HR', 'Manager', 'system_super_admin'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "createLeaveStatusNotification", null);
exports.NotificationsController = NotificationsController = __decorate([
    (0, common_1.Controller)('notifications'),
    (0, common_1.UseGuards)(authenticated_guard_1.AuthenticatedGuard),
    __metadata("design:paramtypes", [notifications_service_1.NotificationsService])
], NotificationsController);
//# sourceMappingURL=notifications.controller.js.map