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
exports.PayCalculation = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
const time_entry_entity_1 = require("./time-entry.entity");
let PayCalculation = class PayCalculation {
    id;
    userId;
    timeEntryId;
    payPeriodStart;
    payPeriodEnd;
    payComponents;
    totalHours;
    regularHours;
    overtimeHours;
    doubleTimeHours;
    totalAllowances;
    calculatedAt;
    calculatedById;
    user;
    timeEntry;
    calculatedBy;
};
exports.PayCalculation = PayCalculation;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], PayCalculation.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id' }),
    __metadata("design:type", Number)
], PayCalculation.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'time_entry_id' }),
    __metadata("design:type", Number)
], PayCalculation.prototype, "timeEntryId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'pay_period_start', type: 'date' }),
    __metadata("design:type", Date)
], PayCalculation.prototype, "payPeriodStart", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'pay_period_end', type: 'date' }),
    __metadata("design:type", Date)
], PayCalculation.prototype, "payPeriodEnd", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'pay_components', type: 'text' }),
    __metadata("design:type", String)
], PayCalculation.prototype, "payComponents", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_hours', type: 'float', nullable: true }),
    __metadata("design:type", Number)
], PayCalculation.prototype, "totalHours", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'regular_hours', type: 'float', nullable: true }),
    __metadata("design:type", Number)
], PayCalculation.prototype, "regularHours", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'overtime_hours', type: 'float', nullable: true }),
    __metadata("design:type", Number)
], PayCalculation.prototype, "overtimeHours", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'double_time_hours', type: 'float', nullable: true }),
    __metadata("design:type", Number)
], PayCalculation.prototype, "doubleTimeHours", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_allowances', type: 'float', nullable: true }),
    __metadata("design:type", Number)
], PayCalculation.prototype, "totalAllowances", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'calculated_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], PayCalculation.prototype, "calculatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'calculated_by_id' }),
    __metadata("design:type", Number)
], PayCalculation.prototype, "calculatedById", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.payCalculations),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], PayCalculation.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => time_entry_entity_1.TimeEntry, (timeEntry) => timeEntry.payCalculations),
    (0, typeorm_1.JoinColumn)({ name: 'time_entry_id' }),
    __metadata("design:type", time_entry_entity_1.TimeEntry)
], PayCalculation.prototype, "timeEntry", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.calculatedPayCalculations),
    (0, typeorm_1.JoinColumn)({ name: 'calculated_by_id' }),
    __metadata("design:type", user_entity_1.User)
], PayCalculation.prototype, "calculatedBy", void 0);
exports.PayCalculation = PayCalculation = __decorate([
    (0, typeorm_1.Entity)('pay_calculations')
], PayCalculation);
//# sourceMappingURL=pay-calculation.entity.js.map