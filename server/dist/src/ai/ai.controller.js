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
exports.AiController = void 0;
const common_1 = require("@nestjs/common");
const authenticated_guard_1 = require("../auth/guards/authenticated.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const ai_service_1 = require("./ai.service");
let AiController = class AiController {
    aiService;
    constructor(aiService) {
        this.aiService = aiService;
    }
    async analyzeScheduling(departmentId, days) {
        const result = await this.aiService.analyzeSchedulingPatterns(departmentId ? parseInt(departmentId) : undefined, days ? parseInt(days) : 30);
        return {
            success: result.success,
            data: result,
        };
    }
    async generatePayrollInsights(body) {
        const result = await this.aiService.generatePayrollInsights(new Date(body.start_date), new Date(body.end_date));
        return {
            success: result.success,
            data: result,
        };
    }
    async analyzeAttendance(employeeId, days) {
        const result = await this.aiService.analyzeAttendancePatterns(employeeId ? parseInt(employeeId) : undefined, days ? parseInt(days) : 30);
        return {
            success: result.success,
            data: result,
        };
    }
    async suggestSchedule(body) {
        const result = await this.aiService.suggestOptimalSchedule(new Date(body.target_date), body.department_id);
        return {
            success: result.success,
            data: result,
        };
    }
    async naturalQuery(body) {
        if (!body.query || body.query.trim().length === 0) {
            return {
                success: false,
                error: 'Query cannot be empty',
            };
        }
        const result = await this.aiService.naturalLanguageQuery(body.query.trim());
        return {
            success: result.success,
            data: result,
        };
    }
    async quickInsights(req) {
        return {
            success: true,
            insights: {
                workforce_status: 'Analyzing current workforce patterns...',
                efficiency_score: 'Calculating efficiency metrics...',
                recommendations: ['Enable AI insights for detailed analysis'],
            },
        };
    }
    async testConnection() {
        try {
            const result = await this.aiService.naturalLanguageQuery('Test connection - what is the current date?');
            if (result.success) {
                return {
                    success: true,
                    message: 'OpenAI connection successful',
                    test_result: result,
                };
            }
            else {
                return {
                    success: false,
                    error: result.error || 'Connection test failed',
                };
            }
        }
        catch (error) {
            return {
                success: false,
                error: `Connection test failed: ${error.message || String(error)}`,
            };
        }
    }
};
exports.AiController = AiController;
__decorate([
    (0, common_1.Get)('analyze-scheduling'),
    (0, roles_decorator_1.Roles)('Manager', 'Super User', 'system_super_admin', 'HR'),
    __param(0, (0, common_1.Query)('department_id')),
    __param(1, (0, common_1.Query)('days')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "analyzeScheduling", null);
__decorate([
    (0, common_1.Post)('generate-payroll-insights'),
    (0, roles_decorator_1.Roles)('Manager', 'Super User', 'system_super_admin', 'Payroll'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "generatePayrollInsights", null);
__decorate([
    (0, common_1.Get)('analyze-attendance'),
    (0, roles_decorator_1.Roles)('Manager', 'Super User', 'system_super_admin', 'HR'),
    __param(0, (0, common_1.Query)('employee_id')),
    __param(1, (0, common_1.Query)('days')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "analyzeAttendance", null);
__decorate([
    (0, common_1.Post)('suggest-schedule'),
    (0, roles_decorator_1.Roles)('Manager', 'Super User', 'system_super_admin'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "suggestSchedule", null);
__decorate([
    (0, common_1.Post)('natural-query'),
    (0, roles_decorator_1.Roles)('Manager', 'Super User', 'system_super_admin', 'HR', 'Payroll'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "naturalQuery", null);
__decorate([
    (0, common_1.Get)('quick-insights'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "quickInsights", null);
__decorate([
    (0, common_1.Post)('test-connection'),
    (0, roles_decorator_1.Roles)('Super User', 'system_super_admin'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AiController.prototype, "testConnection", null);
exports.AiController = AiController = __decorate([
    (0, common_1.Controller)('ai'),
    (0, common_1.UseGuards)(authenticated_guard_1.AuthenticatedGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [ai_service_1.AiService])
], AiController);
//# sourceMappingURL=ai.controller.js.map