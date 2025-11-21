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
exports.TimeEntry = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
const pay_code_entity_1 = require("./pay-code.entity");
const pay_calculation_entity_1 = require("./pay-calculation.entity");
let TimeEntry = class TimeEntry {
    id;
    userId;
    clockInTime;
    clockOutTime;
    status;
    notes;
    approvedByManagerId;
    isOvertimeApproved;
    createdAt;
    updatedAt;
    clockInLatitude;
    clockInLongitude;
    clockOutLatitude;
    clockOutLongitude;
    breakStartTime;
    breakEndTime;
    totalBreakMinutes;
    absencePayCodeId;
    absenceReason;
    absenceApprovedById;
    absenceApprovedAt;
    payCodeId;
    user;
    approvedByManager;
    absenceApprovedBy;
    payCode;
    absencePayCode;
    payCalculations;
};
exports.TimeEntry = TimeEntry;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], TimeEntry.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id' }),
    __metadata("design:type", Number)
], TimeEntry.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'clock_in_time', type: 'timestamp' }),
    __metadata("design:type", Date)
], TimeEntry.prototype, "clockInTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'clock_out_time', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], TimeEntry.prototype, "clockOutTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20 }),
    __metadata("design:type", String)
], TimeEntry.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], TimeEntry.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'approved_by_manager_id', nullable: true }),
    __metadata("design:type", Number)
], TimeEntry.prototype, "approvedByManagerId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_overtime_approved', default: false }),
    __metadata("design:type", Boolean)
], TimeEntry.prototype, "isOvertimeApproved", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at', type: 'timestamp' }),
    __metadata("design:type", Date)
], TimeEntry.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at', type: 'timestamp' }),
    __metadata("design:type", Date)
], TimeEntry.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'clock_in_latitude', type: 'float', nullable: true }),
    __metadata("design:type", Number)
], TimeEntry.prototype, "clockInLatitude", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'clock_in_longitude', type: 'float', nullable: true }),
    __metadata("design:type", Number)
], TimeEntry.prototype, "clockInLongitude", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'clock_out_latitude', type: 'float', nullable: true }),
    __metadata("design:type", Number)
], TimeEntry.prototype, "clockOutLatitude", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'clock_out_longitude', type: 'float', nullable: true }),
    __metadata("design:type", Number)
], TimeEntry.prototype, "clockOutLongitude", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'break_start_time', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], TimeEntry.prototype, "breakStartTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'break_end_time', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], TimeEntry.prototype, "breakEndTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_break_minutes', type: 'int', nullable: true }),
    __metadata("design:type", Number)
], TimeEntry.prototype, "totalBreakMinutes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'absence_pay_code_id', nullable: true }),
    __metadata("design:type", Number)
], TimeEntry.prototype, "absencePayCodeId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'absence_reason', type: 'text', nullable: true }),
    __metadata("design:type", String)
], TimeEntry.prototype, "absenceReason", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'absence_approved_by_id', nullable: true }),
    __metadata("design:type", Number)
], TimeEntry.prototype, "absenceApprovedById", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'absence_approved_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], TimeEntry.prototype, "absenceApprovedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'pay_code_id', nullable: true }),
    __metadata("design:type", Number)
], TimeEntry.prototype, "payCodeId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.timeEntries),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], TimeEntry.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.approvedTimeEntries, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'approved_by_manager_id' }),
    __metadata("design:type", user_entity_1.User)
], TimeEntry.prototype, "approvedByManager", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.absenceApprovedTimeEntries, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'absence_approved_by_id' }),
    __metadata("design:type", user_entity_1.User)
], TimeEntry.prototype, "absenceApprovedBy", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => pay_code_entity_1.PayCode, (payCode) => payCode.timeEntries, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'pay_code_id' }),
    __metadata("design:type", pay_code_entity_1.PayCode)
], TimeEntry.prototype, "payCode", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => pay_code_entity_1.PayCode, (payCode) => payCode.absenceTimeEntries, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'absence_pay_code_id' }),
    __metadata("design:type", pay_code_entity_1.PayCode)
], TimeEntry.prototype, "absencePayCode", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => pay_calculation_entity_1.PayCalculation, (calculation) => calculation.timeEntry),
    __metadata("design:type", Array)
], TimeEntry.prototype, "payCalculations", void 0);
exports.TimeEntry = TimeEntry = __decorate([
    (0, typeorm_1.Entity)('time_entries')
], TimeEntry);
//# sourceMappingURL=time-entry.entity.js.map