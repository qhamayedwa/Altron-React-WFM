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
exports.TenantSetting = void 0;
const typeorm_1 = require("typeorm");
const tenant_entity_1 = require("./tenant.entity");
let TenantSetting = class TenantSetting {
    id;
    tenantId;
    companyLogoUrl;
    primaryColor;
    secondaryColor;
    enableGeolocation;
    enableOvertimeAlerts;
    enableLeaveWorkflow;
    enablePayrollIntegration;
    enableAiScheduling;
    defaultPayFrequency;
    overtimeThreshold;
    weekendOvertimeRate;
    holidayOvertimeRate;
    defaultAnnualLeaveDays;
    defaultSickLeaveDays;
    leaveApprovalRequired;
    emailNotifications;
    smsNotifications;
    createdAt;
    updatedAt;
    tenant;
};
exports.TenantSetting = TenantSetting;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], TenantSetting.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tenant_id' }),
    __metadata("design:type", Number)
], TenantSetting.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'company_logo_url', length: 255, nullable: true }),
    __metadata("design:type", String)
], TenantSetting.prototype, "companyLogoUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'primary_color', length: 7, nullable: true }),
    __metadata("design:type", String)
], TenantSetting.prototype, "primaryColor", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'secondary_color', length: 7, nullable: true }),
    __metadata("design:type", String)
], TenantSetting.prototype, "secondaryColor", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'enable_geolocation', default: false }),
    __metadata("design:type", Boolean)
], TenantSetting.prototype, "enableGeolocation", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'enable_overtime_alerts', default: false }),
    __metadata("design:type", Boolean)
], TenantSetting.prototype, "enableOvertimeAlerts", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'enable_leave_workflow', default: true }),
    __metadata("design:type", Boolean)
], TenantSetting.prototype, "enableLeaveWorkflow", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'enable_payroll_integration', default: false }),
    __metadata("design:type", Boolean)
], TenantSetting.prototype, "enablePayrollIntegration", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'enable_ai_scheduling', default: false }),
    __metadata("design:type", Boolean)
], TenantSetting.prototype, "enableAiScheduling", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'default_pay_frequency', length: 20, nullable: true }),
    __metadata("design:type", String)
], TenantSetting.prototype, "defaultPayFrequency", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'overtime_threshold', type: 'int', nullable: true }),
    __metadata("design:type", Number)
], TenantSetting.prototype, "overtimeThreshold", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'weekend_overtime_rate', type: 'float', nullable: true }),
    __metadata("design:type", Number)
], TenantSetting.prototype, "weekendOvertimeRate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'holiday_overtime_rate', type: 'float', nullable: true }),
    __metadata("design:type", Number)
], TenantSetting.prototype, "holidayOvertimeRate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'default_annual_leave_days', type: 'int', nullable: true }),
    __metadata("design:type", Number)
], TenantSetting.prototype, "defaultAnnualLeaveDays", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'default_sick_leave_days', type: 'int', nullable: true }),
    __metadata("design:type", Number)
], TenantSetting.prototype, "defaultSickLeaveDays", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'leave_approval_required', default: true }),
    __metadata("design:type", Boolean)
], TenantSetting.prototype, "leaveApprovalRequired", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'email_notifications', default: true }),
    __metadata("design:type", Boolean)
], TenantSetting.prototype, "emailNotifications", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'sms_notifications', default: false }),
    __metadata("design:type", Boolean)
], TenantSetting.prototype, "smsNotifications", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at', type: 'timestamp' }),
    __metadata("design:type", Date)
], TenantSetting.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at', type: 'timestamp' }),
    __metadata("design:type", Date)
], TenantSetting.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => tenant_entity_1.Tenant, (tenant) => tenant.tenantSettings),
    (0, typeorm_1.JoinColumn)({ name: 'tenant_id' }),
    __metadata("design:type", tenant_entity_1.Tenant)
], TenantSetting.prototype, "tenant", void 0);
exports.TenantSetting = TenantSetting = __decorate([
    (0, typeorm_1.Entity)('tenant_settings')
], TenantSetting);
//# sourceMappingURL=tenant-setting.entity.js.map