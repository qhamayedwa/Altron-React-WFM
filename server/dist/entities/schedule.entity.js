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
exports.Schedule = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
const shift_type_entity_1 = require("./shift-type.entity");
let Schedule = class Schedule {
    id;
    userId;
    shiftTypeId;
    startTime;
    endTime;
    assignedByManagerId;
    notes;
    payRuleLinkId;
    status;
    createdAt;
    updatedAt;
    batchId;
    user;
    shiftType;
    assignedByManager;
};
exports.Schedule = Schedule;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Schedule.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id' }),
    __metadata("design:type", Number)
], Schedule.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'shift_type_id', nullable: true }),
    __metadata("design:type", Number)
], Schedule.prototype, "shiftTypeId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'start_time', type: 'timestamp' }),
    __metadata("design:type", Date)
], Schedule.prototype, "startTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'end_time', type: 'timestamp' }),
    __metadata("design:type", Date)
], Schedule.prototype, "endTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'assigned_by_manager_id' }),
    __metadata("design:type", Number)
], Schedule.prototype, "assignedByManagerId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Schedule.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'pay_rule_link_id', type: 'int', nullable: true }),
    __metadata("design:type", Number)
], Schedule.prototype, "payRuleLinkId", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20 }),
    __metadata("design:type", String)
], Schedule.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at', type: 'timestamp' }),
    __metadata("design:type", Date)
], Schedule.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at', type: 'timestamp' }),
    __metadata("design:type", Date)
], Schedule.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'batch_id', length: 50, nullable: true }),
    __metadata("design:type", String)
], Schedule.prototype, "batchId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.schedules),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], Schedule.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => shift_type_entity_1.ShiftType, (shiftType) => shiftType.schedules, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'shift_type_id' }),
    __metadata("design:type", shift_type_entity_1.ShiftType)
], Schedule.prototype, "shiftType", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.assignedSchedules),
    (0, typeorm_1.JoinColumn)({ name: 'assigned_by_manager_id' }),
    __metadata("design:type", user_entity_1.User)
], Schedule.prototype, "assignedByManager", void 0);
exports.Schedule = Schedule = __decorate([
    (0, typeorm_1.Entity)('schedules')
], Schedule);
//# sourceMappingURL=schedule.entity.js.map