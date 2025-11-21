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
exports.TimeController = void 0;
const common_1 = require("@nestjs/common");
const time_service_1 = require("./time.service");
const authenticated_guard_1 = require("../auth/guards/authenticated.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const clock_in_dto_1 = require("./dto/clock-in.dto");
const clock_out_dto_1 = require("./dto/clock-out.dto");
const get_time_entries_dto_1 = require("./dto/get-time-entries.dto");
const approve_time_entry_dto_1 = require("./dto/approve-time-entry.dto");
let TimeController = class TimeController {
    timeService;
    constructor(timeService) {
        this.timeService = timeService;
    }
    async clockIn(req, dto) {
        const result = await this.timeService.clockIn(req.user.id, dto);
        return {
            success: true,
            data: result,
            message: 'Successfully clocked in',
            timestamp: new Date().toISOString(),
        };
    }
    async clockOut(req, dto) {
        const result = await this.timeService.clockOut(req.user.id, dto);
        return {
            success: true,
            data: result,
            message: 'Successfully clocked out',
            timestamp: new Date().toISOString(),
        };
    }
    async getCurrentStatus(req) {
        const result = await this.timeService.getCurrentStatus(req.user.id);
        return {
            success: true,
            data: result,
            timestamp: new Date().toISOString(),
        };
    }
    async getTimeEntries(req, dto) {
        const isSuperUser = req.user.user_roles?.some((ur) => ur.roles?.name === 'Super User' || ur.roles?.name === 'system_super_admin' || ur.roles?.name === 'Admin');
        const managedDepartmentIds = await this.timeService.getManagedDepartmentIds(req.user.id);
        const result = await this.timeService.getTimeEntries(req.user.id, dto, isSuperUser, managedDepartmentIds);
        return {
            success: true,
            data: result,
            timestamp: new Date().toISOString(),
        };
    }
    async getPendingApprovals(req) {
        const isSuperUser = req.user.user_roles?.some((ur) => ur.roles?.name === 'Super User' || ur.roles?.name === 'system_super_admin' || ur.roles?.name === 'Admin');
        const managedDepartmentIds = await this.timeService.getManagedDepartmentIds(req.user.id);
        const result = await this.timeService.getPendingApprovals(req.user.id, isSuperUser, managedDepartmentIds);
        return {
            success: true,
            data: result,
            timestamp: new Date().toISOString(),
        };
    }
    async approveTimeEntry(req, dto) {
        const isSuperUser = req.user.user_roles?.some((ur) => ur.roles?.name === 'Super User' || ur.roles?.name === 'system_super_admin' || ur.roles?.name === 'Admin');
        const managedDepartmentIds = await this.timeService.getManagedDepartmentIds(req.user.id);
        const result = await this.timeService.approveTimeEntry(dto.entry_id, req.user.id, isSuperUser, managedDepartmentIds, dto.notes);
        return {
            success: true,
            data: result,
            message: 'Time entry approved successfully',
            timestamp: new Date().toISOString(),
        };
    }
    async rejectTimeEntry(req, dto) {
        const isSuperUser = req.user.user_roles?.some((ur) => ur.roles?.name === 'Super User' || ur.roles?.name === 'system_super_admin' || ur.roles?.name === 'Admin');
        const managedDepartmentIds = await this.timeService.getManagedDepartmentIds(req.user.id);
        const result = await this.timeService.rejectTimeEntry(dto.entry_id, req.user.id, isSuperUser, managedDepartmentIds, dto.notes);
        return {
            success: true,
            data: result,
            message: 'Time entry rejected',
            timestamp: new Date().toISOString(),
        };
    }
};
exports.TimeController = TimeController;
__decorate([
    (0, common_1.Post)('clock-in'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, clock_in_dto_1.ClockInDto]),
    __metadata("design:returntype", Promise)
], TimeController.prototype, "clockIn", null);
__decorate([
    (0, common_1.Post)('clock-out'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, clock_out_dto_1.ClockOutDto]),
    __metadata("design:returntype", Promise)
], TimeController.prototype, "clockOut", null);
__decorate([
    (0, common_1.Get)('current-status'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TimeController.prototype, "getCurrentStatus", null);
__decorate([
    (0, common_1.Get)('entries'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, get_time_entries_dto_1.GetTimeEntriesDto]),
    __metadata("design:returntype", Promise)
], TimeController.prototype, "getTimeEntries", null);
__decorate([
    (0, common_1.Get)('pending-approvals'),
    (0, roles_decorator_1.Roles)('Manager', 'Super User', 'system_super_admin', 'Admin'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TimeController.prototype, "getPendingApprovals", null);
__decorate([
    (0, common_1.Post)('approve'),
    (0, roles_decorator_1.Roles)('Manager', 'Super User', 'system_super_admin', 'Admin'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, approve_time_entry_dto_1.ApproveTimeEntryDto]),
    __metadata("design:returntype", Promise)
], TimeController.prototype, "approveTimeEntry", null);
__decorate([
    (0, common_1.Post)('reject'),
    (0, roles_decorator_1.Roles)('Manager', 'Super User', 'system_super_admin', 'Admin'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, approve_time_entry_dto_1.ApproveTimeEntryDto]),
    __metadata("design:returntype", Promise)
], TimeController.prototype, "rejectTimeEntry", null);
exports.TimeController = TimeController = __decorate([
    (0, common_1.Controller)('time'),
    (0, common_1.UseGuards)(authenticated_guard_1.AuthenticatedGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [time_service_1.TimeService])
], TimeController);
//# sourceMappingURL=time.controller.js.map