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
exports.ReportsController = void 0;
const common_1 = require("@nestjs/common");
const reports_service_1 = require("./reports.service");
const authenticated_guard_1 = require("../auth/guards/authenticated.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
let ReportsController = class ReportsController {
    reportsService;
    constructor(reportsService) {
        this.reportsService = reportsService;
    }
    async getTimeEntryReport(startDate, endDate, userId, departmentId) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const parsedUserId = userId ? parseInt(userId, 10) : undefined;
        const parsedDeptId = departmentId ? parseInt(departmentId, 10) : undefined;
        return this.reportsService.getTimeEntryReport(start, end, parsedUserId, parsedDeptId);
    }
    async getTimeEntryReportCSV(startDate, endDate, userId, departmentId) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const parsedUserId = userId ? parseInt(userId, 10) : undefined;
        const parsedDeptId = departmentId ? parseInt(departmentId, 10) : undefined;
        const report = await this.reportsService.getTimeEntryReport(start, end, parsedUserId, parsedDeptId);
        const headers = ['user_id', 'username', 'clock_in_time', 'clock_out_time', 'total_hours', 'status'];
        return this.reportsService.convertToCSV(report.entries, headers);
    }
    async getLeaveReport(startDate, endDate, userId, departmentId) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const parsedUserId = userId ? parseInt(userId, 10) : undefined;
        const parsedDeptId = departmentId ? parseInt(departmentId, 10) : undefined;
        return this.reportsService.getLeaveReport(start, end, parsedUserId, parsedDeptId);
    }
    async getLeaveReportCSV(startDate, endDate, userId, departmentId) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const parsedUserId = userId ? parseInt(userId, 10) : undefined;
        const parsedDeptId = departmentId ? parseInt(departmentId, 10) : undefined;
        const report = await this.reportsService.getLeaveReport(start, end, parsedUserId, parsedDeptId);
        const headers = ['user_id', 'username', 'start_date', 'end_date', 'status', 'reason'];
        return this.reportsService.convertToCSV(report.applications, headers);
    }
    async getAttendanceReport(startDate, endDate, departmentId) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const parsedDeptId = departmentId ? parseInt(departmentId, 10) : undefined;
        return this.reportsService.getAttendanceReport(start, end, parsedDeptId);
    }
    async getPayrollSummary(startDate, endDate, departmentId) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const parsedDeptId = departmentId ? parseInt(departmentId, 10) : undefined;
        return this.reportsService.getPayrollSummary(start, end, parsedDeptId);
    }
};
exports.ReportsController = ReportsController;
__decorate([
    (0, common_1.Get)('time-entries'),
    (0, roles_decorator_1.Roles)('Manager', 'Admin', 'Payroll', 'Super User', 'system_super_admin'),
    __param(0, (0, common_1.Query)('start_date')),
    __param(1, (0, common_1.Query)('end_date')),
    __param(2, (0, common_1.Query)('user_id')),
    __param(3, (0, common_1.Query)('department_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getTimeEntryReport", null);
__decorate([
    (0, common_1.Get)('time-entries/csv'),
    (0, roles_decorator_1.Roles)('Manager', 'Admin', 'Payroll', 'Super User', 'system_super_admin'),
    (0, common_1.Header)('Content-Type', 'text/csv'),
    (0, common_1.Header)('Content-Disposition', 'attachment; filename="time-entry-report.csv"'),
    __param(0, (0, common_1.Query)('start_date')),
    __param(1, (0, common_1.Query)('end_date')),
    __param(2, (0, common_1.Query)('user_id')),
    __param(3, (0, common_1.Query)('department_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getTimeEntryReportCSV", null);
__decorate([
    (0, common_1.Get)('leave'),
    (0, roles_decorator_1.Roles)('Manager', 'Admin', 'HR', 'Super User', 'system_super_admin'),
    __param(0, (0, common_1.Query)('start_date')),
    __param(1, (0, common_1.Query)('end_date')),
    __param(2, (0, common_1.Query)('user_id')),
    __param(3, (0, common_1.Query)('department_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getLeaveReport", null);
__decorate([
    (0, common_1.Get)('leave/csv'),
    (0, roles_decorator_1.Roles)('Manager', 'Admin', 'HR', 'Super User', 'system_super_admin'),
    (0, common_1.Header)('Content-Type', 'text/csv'),
    (0, common_1.Header)('Content-Disposition', 'attachment; filename="leave-report.csv"'),
    __param(0, (0, common_1.Query)('start_date')),
    __param(1, (0, common_1.Query)('end_date')),
    __param(2, (0, common_1.Query)('user_id')),
    __param(3, (0, common_1.Query)('department_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getLeaveReportCSV", null);
__decorate([
    (0, common_1.Get)('attendance'),
    (0, roles_decorator_1.Roles)('Manager', 'Admin', 'HR', 'Super User', 'system_super_admin'),
    __param(0, (0, common_1.Query)('start_date')),
    __param(1, (0, common_1.Query)('end_date')),
    __param(2, (0, common_1.Query)('department_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getAttendanceReport", null);
__decorate([
    (0, common_1.Get)('payroll-summary'),
    (0, roles_decorator_1.Roles)('Admin', 'Payroll', 'Super User', 'system_super_admin'),
    __param(0, (0, common_1.Query)('start_date')),
    __param(1, (0, common_1.Query)('end_date')),
    __param(2, (0, common_1.Query)('department_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getPayrollSummary", null);
exports.ReportsController = ReportsController = __decorate([
    (0, common_1.Controller)('reports'),
    (0, common_1.UseGuards)(authenticated_guard_1.AuthenticatedGuard),
    __metadata("design:paramtypes", [reports_service_1.ReportsService])
], ReportsController);
//# sourceMappingURL=reports.controller.js.map