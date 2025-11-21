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
exports.SchedulingController = void 0;
const common_1 = require("@nestjs/common");
const scheduling_service_1 = require("./scheduling.service");
const authenticated_guard_1 = require("../auth/guards/authenticated.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const create_shift_type_dto_1 = require("./dto/create-shift-type.dto");
const update_shift_type_dto_1 = require("./dto/update-shift-type.dto");
const create_schedule_dto_1 = require("./dto/create-schedule.dto");
const update_schedule_dto_1 = require("./dto/update-schedule.dto");
const check_conflicts_dto_1 = require("./dto/check-conflicts.dto");
let SchedulingController = class SchedulingController {
    schedulingService;
    constructor(schedulingService) {
        this.schedulingService = schedulingService;
    }
    async createShiftType(dto) {
        const result = await this.schedulingService.createShiftType(dto);
        return {
            success: true,
            data: result,
            message: 'Shift type created successfully',
            timestamp: new Date().toISOString(),
        };
    }
    async getShiftTypes(includeInactive) {
        const activeOnly = includeInactive !== 'true';
        const result = await this.schedulingService.getShiftTypes(activeOnly);
        return {
            success: true,
            data: result,
            message: 'Shift types retrieved successfully',
            timestamp: new Date().toISOString(),
        };
    }
    async getShiftType(id) {
        const result = await this.schedulingService.getShiftType(parseInt(id, 10));
        return {
            success: true,
            data: result,
            message: 'Shift type retrieved successfully',
            timestamp: new Date().toISOString(),
        };
    }
    async updateShiftType(id, dto) {
        const result = await this.schedulingService.updateShiftType(parseInt(id, 10), dto);
        return {
            success: true,
            data: result,
            message: 'Shift type updated successfully',
            timestamp: new Date().toISOString(),
        };
    }
    async deleteShiftType(id) {
        await this.schedulingService.deleteShiftType(parseInt(id, 10));
        return {
            success: true,
            message: 'Shift type deleted successfully',
            timestamp: new Date().toISOString(),
        };
    }
    async getSchedules(req, userId, shiftTypeId, startDate, endDate, status) {
        const userRoles = req.user.user_roles?.map((ur) => ur.roles.name) || [];
        const isSuperUser = userRoles.includes('Super User') || userRoles.includes('system_super_admin');
        const managedDepartmentIds = await this.schedulingService.getManagedDepartmentIds(req.user.id);
        const filters = {
            user_id: userId ? parseInt(userId, 10) : undefined,
            shift_type_id: shiftTypeId ? parseInt(shiftTypeId, 10) : undefined,
            start_date: startDate,
            end_date: endDate,
            status,
        };
        const result = await this.schedulingService.getSchedules(req.user.id, isSuperUser, managedDepartmentIds, filters);
        return {
            success: true,
            data: result,
            message: 'Schedules retrieved successfully',
            timestamp: new Date().toISOString(),
        };
    }
    async getMySchedule(req, startDate, endDate) {
        const result = await this.schedulingService.getMySchedule(req.user.id, startDate, endDate);
        return {
            success: true,
            data: result,
            message: 'Your schedule retrieved successfully',
            timestamp: new Date().toISOString(),
        };
    }
    async createSchedule(req, dto) {
        const userRoles = req.user.user_roles?.map((ur) => ur.roles.name) || [];
        const isSuperUser = userRoles.includes('Super User') || userRoles.includes('system_super_admin');
        const managedDepartmentIds = await this.schedulingService.getManagedDepartmentIds(req.user.id);
        const result = await this.schedulingService.createSchedule(dto, req.user.id, isSuperUser, managedDepartmentIds);
        let message = '';
        if (result.created_count === 1) {
            message = 'Schedule created successfully!';
        }
        else {
            message = `Batch schedule created for ${result.created_count} employee(s)!`;
        }
        if (result.conflict_count > 0) {
            message += ` ${result.conflict_count} employee(s) had conflicts: ${result.conflict_employees.join(', ')}`;
        }
        return {
            success: true,
            data: result,
            message,
            timestamp: new Date().toISOString(),
        };
    }
    async updateSchedule(req, id, dto) {
        const userRoles = req.user.user_roles?.map((ur) => ur.roles.name) || [];
        const isSuperUser = userRoles.includes('Super User') || userRoles.includes('system_super_admin');
        const managedDepartmentIds = await this.schedulingService.getManagedDepartmentIds(req.user.id);
        const result = await this.schedulingService.updateSchedule(parseInt(id, 10), dto, req.user.id, isSuperUser, managedDepartmentIds);
        return {
            success: true,
            data: result,
            message: 'Schedule updated successfully',
            timestamp: new Date().toISOString(),
        };
    }
    async deleteSchedule(req, id) {
        const userRoles = req.user.user_roles?.map((ur) => ur.roles.name) || [];
        const isSuperUser = userRoles.includes('Super User') || userRoles.includes('system_super_admin');
        const managedDepartmentIds = await this.schedulingService.getManagedDepartmentIds(req.user.id);
        await this.schedulingService.deleteSchedule(parseInt(id, 10), req.user.id, isSuperUser, managedDepartmentIds);
        return {
            success: true,
            message: 'Schedule deleted successfully',
            timestamp: new Date().toISOString(),
        };
    }
    async checkConflicts(dto) {
        const result = await this.schedulingService.checkConflicts(dto);
        return {
            success: true,
            data: result,
            message: 'Conflict check completed',
            timestamp: new Date().toISOString(),
        };
    }
};
exports.SchedulingController = SchedulingController;
__decorate([
    (0, common_1.Post)('shift-types'),
    (0, roles_decorator_1.Roles)('Manager', 'Admin', 'Super User', 'system_super_admin'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_shift_type_dto_1.CreateShiftTypeDto]),
    __metadata("design:returntype", Promise)
], SchedulingController.prototype, "createShiftType", null);
__decorate([
    (0, common_1.Get)('shift-types'),
    (0, roles_decorator_1.Roles)('Manager', 'Admin', 'Super User', 'system_super_admin', 'Employee'),
    __param(0, (0, common_1.Query)('include_inactive')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SchedulingController.prototype, "getShiftTypes", null);
__decorate([
    (0, common_1.Get)('shift-types/:id'),
    (0, roles_decorator_1.Roles)('Manager', 'Admin', 'Super User', 'system_super_admin'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SchedulingController.prototype, "getShiftType", null);
__decorate([
    (0, common_1.Patch)('shift-types/:id'),
    (0, roles_decorator_1.Roles)('Manager', 'Admin', 'Super User', 'system_super_admin'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_shift_type_dto_1.UpdateShiftTypeDto]),
    __metadata("design:returntype", Promise)
], SchedulingController.prototype, "updateShiftType", null);
__decorate([
    (0, common_1.Delete)('shift-types/:id'),
    (0, roles_decorator_1.Roles)('Admin', 'Super User', 'system_super_admin'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SchedulingController.prototype, "deleteShiftType", null);
__decorate([
    (0, common_1.Get)('schedules'),
    (0, roles_decorator_1.Roles)('Manager', 'Admin', 'Super User', 'system_super_admin'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('user_id')),
    __param(2, (0, common_1.Query)('shift_type_id')),
    __param(3, (0, common_1.Query)('start_date')),
    __param(4, (0, common_1.Query)('end_date')),
    __param(5, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], SchedulingController.prototype, "getSchedules", null);
__decorate([
    (0, common_1.Get)('my-schedule'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('start_date')),
    __param(2, (0, common_1.Query)('end_date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], SchedulingController.prototype, "getMySchedule", null);
__decorate([
    (0, common_1.Post)('schedules'),
    (0, roles_decorator_1.Roles)('Manager', 'Admin', 'Super User', 'system_super_admin'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_schedule_dto_1.CreateScheduleDto]),
    __metadata("design:returntype", Promise)
], SchedulingController.prototype, "createSchedule", null);
__decorate([
    (0, common_1.Patch)('schedules/:id'),
    (0, roles_decorator_1.Roles)('Manager', 'Admin', 'Super User', 'system_super_admin'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_schedule_dto_1.UpdateScheduleDto]),
    __metadata("design:returntype", Promise)
], SchedulingController.prototype, "updateSchedule", null);
__decorate([
    (0, common_1.Delete)('schedules/:id'),
    (0, roles_decorator_1.Roles)('Manager', 'Admin', 'Super User', 'system_super_admin'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], SchedulingController.prototype, "deleteSchedule", null);
__decorate([
    (0, common_1.Post)('check-conflicts'),
    (0, roles_decorator_1.Roles)('Manager', 'Admin', 'Super User', 'system_super_admin'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [check_conflicts_dto_1.CheckConflictsDto]),
    __metadata("design:returntype", Promise)
], SchedulingController.prototype, "checkConflicts", null);
exports.SchedulingController = SchedulingController = __decorate([
    (0, common_1.Controller)('scheduling'),
    (0, common_1.UseGuards)(authenticated_guard_1.AuthenticatedGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [scheduling_service_1.SchedulingService])
], SchedulingController);
//# sourceMappingURL=scheduling.controller.js.map