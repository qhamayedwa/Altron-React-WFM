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
exports.LeaveBalance = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
const leave_type_entity_1 = require("./leave-type.entity");
let LeaveBalance = class LeaveBalance {
    id;
    userId;
    leaveTypeId;
    balance;
    accruedThisYear;
    usedThisYear;
    lastAccrualDate;
    year;
    createdAt;
    updatedAt;
    user;
    leaveType;
};
exports.LeaveBalance = LeaveBalance;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], LeaveBalance.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id' }),
    __metadata("design:type", Number)
], LeaveBalance.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'leave_type_id' }),
    __metadata("design:type", Number)
], LeaveBalance.prototype, "leaveTypeId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float' }),
    __metadata("design:type", Number)
], LeaveBalance.prototype, "balance", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'accrued_this_year', type: 'float', nullable: true }),
    __metadata("design:type", Number)
], LeaveBalance.prototype, "accruedThisYear", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'used_this_year', type: 'float', nullable: true }),
    __metadata("design:type", Number)
], LeaveBalance.prototype, "usedThisYear", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'last_accrual_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], LeaveBalance.prototype, "lastAccrualDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], LeaveBalance.prototype, "year", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at', type: 'timestamp' }),
    __metadata("design:type", Date)
], LeaveBalance.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at', type: 'timestamp' }),
    __metadata("design:type", Date)
], LeaveBalance.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.leaveBalances),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], LeaveBalance.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => leave_type_entity_1.LeaveType, (leaveType) => leaveType.leaveBalances),
    (0, typeorm_1.JoinColumn)({ name: 'leave_type_id' }),
    __metadata("design:type", leave_type_entity_1.LeaveType)
], LeaveBalance.prototype, "leaveType", void 0);
exports.LeaveBalance = LeaveBalance = __decorate([
    (0, typeorm_1.Entity)('leave_balances')
], LeaveBalance);
//# sourceMappingURL=leave-balance.entity.js.map