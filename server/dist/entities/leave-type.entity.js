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
exports.LeaveType = void 0;
const typeorm_1 = require("typeorm");
const leave_application_entity_1 = require("./leave-application.entity");
const leave_balance_entity_1 = require("./leave-balance.entity");
let LeaveType = class LeaveType {
    id;
    name;
    defaultAccrualRate;
    description;
    isActive;
    requiresApproval;
    maxConsecutiveDays;
    createdAt;
    leaveApplications;
    leaveBalances;
};
exports.LeaveType = LeaveType;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], LeaveType.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 64, unique: true }),
    __metadata("design:type", String)
], LeaveType.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'default_accrual_rate', type: 'float', nullable: true }),
    __metadata("design:type", Number)
], LeaveType.prototype, "defaultAccrualRate", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255, nullable: true }),
    __metadata("design:type", String)
], LeaveType.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', default: true }),
    __metadata("design:type", Boolean)
], LeaveType.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'requires_approval', default: true }),
    __metadata("design:type", Boolean)
], LeaveType.prototype, "requiresApproval", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'max_consecutive_days', type: 'int', nullable: true }),
    __metadata("design:type", Number)
], LeaveType.prototype, "maxConsecutiveDays", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at', type: 'timestamp' }),
    __metadata("design:type", Date)
], LeaveType.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => leave_application_entity_1.LeaveApplication, (application) => application.leaveType),
    __metadata("design:type", Array)
], LeaveType.prototype, "leaveApplications", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => leave_balance_entity_1.LeaveBalance, (balance) => balance.leaveType),
    __metadata("design:type", Array)
], LeaveType.prototype, "leaveBalances", void 0);
exports.LeaveType = LeaveType = __decorate([
    (0, typeorm_1.Entity)('leave_types')
], LeaveType);
//# sourceMappingURL=leave-type.entity.js.map