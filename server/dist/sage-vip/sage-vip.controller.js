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
exports.SageVipController = void 0;
const common_1 = require("@nestjs/common");
const sage_vip_service_1 = require("./sage-vip.service");
const authenticated_guard_1 = require("../auth/guards/authenticated.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
let SageVipController = class SageVipController {
    sageVipService;
    constructor(sageVipService) {
        this.sageVipService = sageVipService;
    }
    async getStatus() {
        return this.sageVipService.getStatus();
    }
    async testConnection() {
        return this.sageVipService.testConnection();
    }
    async syncEmployees() {
        return this.sageVipService.syncEmployees();
    }
    async pushTimesheets(startDate, endDate) {
        const start = startDate ? new Date(startDate) : new Date();
        const end = endDate ? new Date(endDate) : new Date();
        return this.sageVipService.pushTimesheets(start, end);
    }
    async transferLeave(startDate, endDate) {
        const start = startDate ? new Date(startDate) : new Date();
        const end = endDate ? new Date(endDate) : new Date();
        return this.sageVipService.transferLeave(start, end);
    }
    async getSyncHistory(limit) {
        const parsedLimit = limit ? parseInt(limit, 10) : 20;
        return this.sageVipService.getSyncHistory(parsedLimit);
    }
};
exports.SageVipController = SageVipController;
__decorate([
    (0, common_1.Get)('status'),
    (0, roles_decorator_1.Roles)('Super User', 'Admin', 'Payroll', 'system_super_admin'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SageVipController.prototype, "getStatus", null);
__decorate([
    (0, common_1.Post)('test-connection'),
    (0, roles_decorator_1.Roles)('Super User', 'Admin', 'system_super_admin'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SageVipController.prototype, "testConnection", null);
__decorate([
    (0, common_1.Post)('sync-employees'),
    (0, roles_decorator_1.Roles)('Super User', 'Admin', 'HR', 'system_super_admin'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SageVipController.prototype, "syncEmployees", null);
__decorate([
    (0, common_1.Post)('push-timesheets'),
    (0, roles_decorator_1.Roles)('Super User', 'Admin', 'Payroll', 'system_super_admin'),
    __param(0, (0, common_1.Query)('start_date')),
    __param(1, (0, common_1.Query)('end_date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], SageVipController.prototype, "pushTimesheets", null);
__decorate([
    (0, common_1.Post)('transfer-leave'),
    (0, roles_decorator_1.Roles)('Super User', 'Admin', 'HR', 'Payroll', 'system_super_admin'),
    __param(0, (0, common_1.Query)('start_date')),
    __param(1, (0, common_1.Query)('end_date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], SageVipController.prototype, "transferLeave", null);
__decorate([
    (0, common_1.Get)('sync-history'),
    (0, roles_decorator_1.Roles)('Super User', 'Admin', 'Payroll', 'system_super_admin'),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SageVipController.prototype, "getSyncHistory", null);
exports.SageVipController = SageVipController = __decorate([
    (0, common_1.Controller)('sage-vip'),
    (0, common_1.UseGuards)(authenticated_guard_1.AuthenticatedGuard),
    __metadata("design:paramtypes", [sage_vip_service_1.SageVipService])
], SageVipController);
//# sourceMappingURL=sage-vip.controller.js.map