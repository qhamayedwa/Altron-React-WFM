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
exports.LeaveController = void 0;
const common_1 = require("@nestjs/common");
const leave_service_1 = require("./leave.service");
const authenticated_guard_1 = require("../auth/guards/authenticated.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const create_leave_application_dto_1 = require("./dto/create-leave-application.dto");
const update_leave_application_dto_1 = require("./dto/update-leave-application.dto");
const get_leave_applications_dto_1 = require("./dto/get-leave-applications.dto");
const create_leave_type_dto_1 = require("./dto/create-leave-type.dto");
const update_leave_type_dto_1 = require("./dto/update-leave-type.dto");
const adjust_leave_balance_dto_1 = require("./dto/adjust-leave-balance.dto");
let LeaveController = class LeaveController {
    leaveService;
    constructor(leaveService) {
        this.leaveService = leaveService;
    }
    async getMyLeaveBalances(req) {
        const result = await this.leaveService.getMyLeaveBalances(req.user.id);
        return {
            success: true,
            data: result,
            timestamp: new Date().toISOString(),
        };
    }
    async createLeaveApplication(req, dto) {
        const isPrivileged = req.user.user_roles?.some((ur) => ur.roles?.name === 'Super User' || ur.roles?.name === 'system_super_admin' || ur.roles?.name === 'Admin');
        const managedDepartmentIds = await this.leaveService.getManagedDepartmentIds(req.user.id);
        const result = await this.leaveService.createLeaveApplication(req.user.id, dto, req.user.id, isPrivileged, managedDepartmentIds);
        return {
            success: true,
            data: result,
            message: dto.auto_approve ? 'Leave application approved' : 'Leave application submitted successfully',
            timestamp: new Date().toISOString(),
        };
    }
    async getMyApplications(req, dto) {
        const result = await this.leaveService.getMyApplications(req.user.id, dto);
        return {
            success: true,
            data: result,
            timestamp: new Date().toISOString(),
        };
    }
    async getTeamApplications(req, dto) {
        const isPrivileged = req.user.user_roles?.some((ur) => ur.roles?.name === 'Super User' || ur.roles?.name === 'system_super_admin' || ur.roles?.name === 'Admin');
        const managedDepartmentIds = await this.leaveService.getManagedDepartmentIds(req.user.id);
        const result = await this.leaveService.getTeamApplications(req.user.id, dto, isPrivileged, managedDepartmentIds);
        return {
            success: true,
            data: result,
            timestamp: new Date().toISOString(),
        };
    }
    async approveApplication(req, id, dto) {
        const isPrivileged = req.user.user_roles?.some((ur) => ur.roles?.name === 'Super User' || ur.roles?.name === 'system_super_admin' || ur.roles?.name === 'Admin');
        const managedDepartmentIds = await this.leaveService.getManagedDepartmentIds(req.user.id);
        const result = await this.leaveService.approveApplication(id, req.user.id, dto, isPrivileged, managedDepartmentIds);
        return {
            success: true,
            data: result,
            message: 'Leave application approved successfully',
            timestamp: new Date().toISOString(),
        };
    }
    async rejectApplication(req, id, dto) {
        const isPrivileged = req.user.user_roles?.some((ur) => ur.roles?.name === 'Super User' || ur.roles?.name === 'system_super_admin' || ur.roles?.name === 'Admin');
        const managedDepartmentIds = await this.leaveService.getManagedDepartmentIds(req.user.id);
        const result = await this.leaveService.rejectApplication(id, req.user.id, dto, isPrivileged, managedDepartmentIds);
        return {
            success: true,
            data: result,
            message: 'Leave application rejected',
            timestamp: new Date().toISOString(),
        };
    }
    async cancelApplication(req, id) {
        const result = await this.leaveService.cancelApplication(id, req.user.id);
        return {
            success: true,
            data: result,
            message: 'Leave application cancelled successfully',
            timestamp: new Date().toISOString(),
        };
    }
    async getLeaveTypes() {
        const result = await this.leaveService.getLeaveTypes();
        return {
            success: true,
            data: result,
            timestamp: new Date().toISOString(),
        };
    }
    async getLeaveType(id) {
        const result = await this.leaveService.getLeaveType(id);
        return {
            success: true,
            data: result,
            timestamp: new Date().toISOString(),
        };
    }
    async createLeaveType(dto) {
        const result = await this.leaveService.createLeaveType(dto);
        return {
            success: true,
            data: result,
            message: 'Leave type created successfully',
            timestamp: new Date().toISOString(),
        };
    }
    async updateLeaveType(id, dto) {
        const result = await this.leaveService.updateLeaveType(id, dto);
        return {
            success: true,
            data: result,
            message: 'Leave type updated successfully',
            timestamp: new Date().toISOString(),
        };
    }
    async getLeaveBalances(year, userId, leaveTypeId) {
        const parsedYear = year ? parseInt(year, 10) : undefined;
        const parsedUserId = userId ? parseInt(userId, 10) : undefined;
        const parsedLeaveTypeId = leaveTypeId ? parseInt(leaveTypeId, 10) : undefined;
        const result = await this.leaveService.getLeaveBalances(parsedYear, parsedUserId, parsedLeaveTypeId);
        return {
            success: true,
            data: result,
            timestamp: new Date().toISOString(),
        };
    }
    async adjustLeaveBalance(id, dto) {
        const result = await this.leaveService.adjustLeaveBalance(id, dto);
        return {
            success: true,
            data: result,
            message: 'Leave balance adjusted successfully',
            timestamp: new Date().toISOString(),
        };
    }
    async runAccrual() {
        const result = await this.leaveService.runAccrual();
        return {
            success: true,
            data: result,
            message: `Leave accrual completed successfully. Processed ${result.users_processed} user records.`,
            timestamp: new Date().toISOString(),
        };
    }
};
exports.LeaveController = LeaveController;
__decorate([
    (0, common_1.Get)('my-balances'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], LeaveController.prototype, "getMyLeaveBalances", null);
__decorate([
    (0, common_1.Post)('applications'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_leave_application_dto_1.CreateLeaveApplicationDto]),
    __metadata("design:returntype", Promise)
], LeaveController.prototype, "createLeaveApplication", null);
__decorate([
    (0, common_1.Get)('my-applications'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, get_leave_applications_dto_1.GetLeaveApplicationsDto]),
    __metadata("design:returntype", Promise)
], LeaveController.prototype, "getMyApplications", null);
__decorate([
    (0, common_1.Get)('team-applications'),
    (0, roles_decorator_1.Roles)('Manager', 'Super User', 'system_super_admin', 'Admin'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, get_leave_applications_dto_1.GetLeaveApplicationsDto]),
    __metadata("design:returntype", Promise)
], LeaveController.prototype, "getTeamApplications", null);
__decorate([
    (0, common_1.Post)('applications/:id/approve'),
    (0, roles_decorator_1.Roles)('Manager', 'Super User', 'system_super_admin', 'Admin'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, update_leave_application_dto_1.UpdateLeaveApplicationDto]),
    __metadata("design:returntype", Promise)
], LeaveController.prototype, "approveApplication", null);
__decorate([
    (0, common_1.Post)('applications/:id/reject'),
    (0, roles_decorator_1.Roles)('Manager', 'Super User', 'system_super_admin', 'Admin'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, update_leave_application_dto_1.UpdateLeaveApplicationDto]),
    __metadata("design:returntype", Promise)
], LeaveController.prototype, "rejectApplication", null);
__decorate([
    (0, common_1.Post)('applications/:id/cancel'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], LeaveController.prototype, "cancelApplication", null);
__decorate([
    (0, common_1.Get)('types'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LeaveController.prototype, "getLeaveTypes", null);
__decorate([
    (0, common_1.Get)('types/:id'),
    (0, roles_decorator_1.Roles)('Admin', 'Super User', 'system_super_admin'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], LeaveController.prototype, "getLeaveType", null);
__decorate([
    (0, common_1.Post)('types'),
    (0, roles_decorator_1.Roles)('Admin', 'Super User', 'system_super_admin'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_leave_type_dto_1.CreateLeaveTypeDto]),
    __metadata("design:returntype", Promise)
], LeaveController.prototype, "createLeaveType", null);
__decorate([
    (0, common_1.Put)('types/:id'),
    (0, roles_decorator_1.Roles)('Admin', 'Super User', 'system_super_admin'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_leave_type_dto_1.UpdateLeaveTypeDto]),
    __metadata("design:returntype", Promise)
], LeaveController.prototype, "updateLeaveType", null);
__decorate([
    (0, common_1.Get)('balances'),
    (0, roles_decorator_1.Roles)('Admin', 'Super User', 'system_super_admin'),
    __param(0, (0, common_1.Query)('year')),
    __param(1, (0, common_1.Query)('user_id')),
    __param(2, (0, common_1.Query)('leave_type_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], LeaveController.prototype, "getLeaveBalances", null);
__decorate([
    (0, common_1.Post)('balances/:id/adjust'),
    (0, roles_decorator_1.Roles)('Admin', 'Super User', 'system_super_admin'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, adjust_leave_balance_dto_1.AdjustLeaveBalanceDto]),
    __metadata("design:returntype", Promise)
], LeaveController.prototype, "adjustLeaveBalance", null);
__decorate([
    (0, common_1.Post)('accrual/run'),
    (0, roles_decorator_1.Roles)('Super User', 'system_super_admin'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LeaveController.prototype, "runAccrual", null);
exports.LeaveController = LeaveController = __decorate([
    (0, common_1.Controller)('leave'),
    (0, common_1.UseGuards)(authenticated_guard_1.AuthenticatedGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [leave_service_1.LeaveService])
], LeaveController);
//# sourceMappingURL=leave.controller.js.map