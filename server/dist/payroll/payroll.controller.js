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
exports.PayrollController = void 0;
const common_1 = require("@nestjs/common");
const authenticated_guard_1 = require("../auth/guards/authenticated.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const payroll_service_1 = require("./payroll.service");
const create_pay_code_dto_1 = require("./dto/create-pay-code.dto");
const update_pay_code_dto_1 = require("./dto/update-pay-code.dto");
const create_pay_rule_dto_1 = require("./dto/create-pay-rule.dto");
const update_pay_rule_dto_1 = require("./dto/update-pay-rule.dto");
const calculate_payroll_dto_1 = require("./dto/calculate-payroll.dto");
let PayrollController = class PayrollController {
    payrollService;
    constructor(payrollService) {
        this.payrollService = payrollService;
    }
    async getPayCodes(page, perPage, codeType, statusFilter) {
        const result = await this.payrollService.getPayCodes(page ? parseInt(page) : 1, perPage ? parseInt(perPage) : 20, codeType, statusFilter);
        return {
            success: true,
            data: result,
        };
    }
    async getPayCodeById(id) {
        const payCode = await this.payrollService.getPayCodeById(id);
        return {
            success: true,
            data: payCode,
        };
    }
    async createPayCode(dto, req) {
        const payCode = await this.payrollService.createPayCode(dto, req.user.id);
        return {
            success: true,
            data: payCode,
            message: `Pay code "${payCode.code}" created successfully`,
        };
    }
    async updatePayCode(id, dto) {
        const payCode = await this.payrollService.updatePayCode(id, dto);
        return {
            success: true,
            data: payCode,
            message: `Pay code "${payCode?.code || 'N/A'}" updated successfully`,
        };
    }
    async deletePayCode(id) {
        const result = await this.payrollService.deletePayCode(id);
        return {
            success: true,
            message: result.message,
        };
    }
    async togglePayCodeStatus(id) {
        const result = await this.payrollService.togglePayCodeStatus(id);
        return {
            success: true,
            data: { is_active: result.is_active },
            message: result.message,
        };
    }
    async getAbsenceCodes() {
        const codes = await this.payrollService.getAbsenceCodes();
        return {
            success: true,
            data: codes,
        };
    }
    async getPayRules(page, perPage, statusFilter) {
        const result = await this.payrollService.getPayRules(page ? parseInt(page) : 1, perPage ? parseInt(perPage) : 20, statusFilter);
        return {
            success: true,
            data: result,
        };
    }
    async getPayRuleById(id) {
        const payRule = await this.payrollService.getPayRuleById(id);
        return {
            success: true,
            data: payRule,
        };
    }
    async createPayRule(dto, req) {
        const payRule = await this.payrollService.createPayRule(dto, req.user.id);
        return {
            success: true,
            data: payRule,
            message: `Pay rule "${payRule?.name || 'N/A'}" created successfully`,
        };
    }
    async updatePayRule(id, dto) {
        const payRule = await this.payrollService.updatePayRule(id, dto);
        return {
            success: true,
            data: payRule,
            message: `Pay rule "${payRule?.name || 'N/A'}" updated successfully`,
        };
    }
    async deletePayRule(id) {
        const result = await this.payrollService.deletePayRule(id);
        return {
            success: true,
            message: result.message,
        };
    }
    async togglePayRuleStatus(id) {
        const result = await this.payrollService.togglePayRuleStatus(id);
        return {
            success: true,
            data: { is_active: result.is_active },
            message: result.message,
        };
    }
    async reorderPayRules(body) {
        const result = await this.payrollService.reorderPayRules(body.rule_orders);
        return {
            success: true,
            message: result.message,
        };
    }
    async calculatePayroll(dto, req) {
        const isSuperUser = req.user.role === 'Super User';
        const result = await this.payrollService.calculatePayroll(dto, req.user.id, isSuperUser);
        return {
            success: true,
            data: result,
            message: dto.save_results
                ? `Payroll calculated and saved for ${result.employee_count} employees`
                : `Payroll calculated for ${result.employee_count} employees`,
        };
    }
    async getPayCalculations(page, perPage, employeeId) {
        const result = await this.payrollService.getPayCalculations(page ? parseInt(page) : 1, perPage ? parseInt(perPage) : 20, employeeId ? parseInt(employeeId) : undefined);
        return {
            success: true,
            data: result,
        };
    }
};
exports.PayrollController = PayrollController;
__decorate([
    (0, common_1.Get)('pay-codes'),
    (0, roles_decorator_1.Roles)('Super User', 'Admin', 'Payroll'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('per_page')),
    __param(2, (0, common_1.Query)('type')),
    __param(3, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "getPayCodes", null);
__decorate([
    (0, common_1.Get)('pay-codes/:id'),
    (0, roles_decorator_1.Roles)('Super User', 'Admin', 'Payroll'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "getPayCodeById", null);
__decorate([
    (0, common_1.Post)('pay-codes'),
    (0, roles_decorator_1.Roles)('Super User'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_pay_code_dto_1.CreatePayCodeDto, Object]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "createPayCode", null);
__decorate([
    (0, common_1.Patch)('pay-codes/:id'),
    (0, roles_decorator_1.Roles)('Super User'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_pay_code_dto_1.UpdatePayCodeDto]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "updatePayCode", null);
__decorate([
    (0, common_1.Delete)('pay-codes/:id'),
    (0, roles_decorator_1.Roles)('Super User'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "deletePayCode", null);
__decorate([
    (0, common_1.Post)('pay-codes/:id/toggle'),
    (0, roles_decorator_1.Roles)('Super User'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "togglePayCodeStatus", null);
__decorate([
    (0, common_1.Get)('pay-codes/list/absence'),
    (0, roles_decorator_1.Roles)('Super User', 'Admin', 'Manager', 'Payroll'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "getAbsenceCodes", null);
__decorate([
    (0, common_1.Get)('pay-rules'),
    (0, roles_decorator_1.Roles)('Super User'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('per_page')),
    __param(2, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "getPayRules", null);
__decorate([
    (0, common_1.Get)('pay-rules/:id'),
    (0, roles_decorator_1.Roles)('Super User'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "getPayRuleById", null);
__decorate([
    (0, common_1.Post)('pay-rules'),
    (0, roles_decorator_1.Roles)('Super User'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_pay_rule_dto_1.CreatePayRuleDto, Object]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "createPayRule", null);
__decorate([
    (0, common_1.Patch)('pay-rules/:id'),
    (0, roles_decorator_1.Roles)('Super User'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_pay_rule_dto_1.UpdatePayRuleDto]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "updatePayRule", null);
__decorate([
    (0, common_1.Delete)('pay-rules/:id'),
    (0, roles_decorator_1.Roles)('Super User'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "deletePayRule", null);
__decorate([
    (0, common_1.Post)('pay-rules/:id/toggle'),
    (0, roles_decorator_1.Roles)('Super User'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "togglePayRuleStatus", null);
__decorate([
    (0, common_1.Post)('pay-rules/reorder'),
    (0, roles_decorator_1.Roles)('Super User'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "reorderPayRules", null);
__decorate([
    (0, common_1.Post)('calculate'),
    (0, roles_decorator_1.Roles)('Super User'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [calculate_payroll_dto_1.CalculatePayrollDto, Object]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "calculatePayroll", null);
__decorate([
    (0, common_1.Get)('calculations'),
    (0, roles_decorator_1.Roles)('Super User', 'Payroll'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('per_page')),
    __param(2, (0, common_1.Query)('employee_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "getPayCalculations", null);
exports.PayrollController = PayrollController = __decorate([
    (0, common_1.Controller)('payroll'),
    (0, common_1.UseGuards)(authenticated_guard_1.AuthenticatedGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [payroll_service_1.PayrollService])
], PayrollController);
//# sourceMappingURL=payroll.controller.js.map