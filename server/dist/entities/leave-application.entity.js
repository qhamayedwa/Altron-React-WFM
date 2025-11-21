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
exports.LeaveApplication = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
const leave_type_entity_1 = require("./leave-type.entity");
let LeaveApplication = class LeaveApplication {
    id;
    userId;
    leaveTypeId;
    startDate;
    endDate;
    reason;
    status;
    isHourly;
    hoursRequested;
    managerApprovedId;
    managerComments;
    createdAt;
    updatedAt;
    approvedAt;
    user;
    leaveType;
    managerApproved;
};
exports.LeaveApplication = LeaveApplication;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], LeaveApplication.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id' }),
    __metadata("design:type", Number)
], LeaveApplication.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'leave_type_id' }),
    __metadata("design:type", Number)
], LeaveApplication.prototype, "leaveTypeId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'start_date', type: 'date' }),
    __metadata("design:type", Date)
], LeaveApplication.prototype, "startDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'end_date', type: 'date' }),
    __metadata("design:type", Date)
], LeaveApplication.prototype, "endDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], LeaveApplication.prototype, "reason", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20 }),
    __metadata("design:type", String)
], LeaveApplication.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_hourly', default: false }),
    __metadata("design:type", Boolean)
], LeaveApplication.prototype, "isHourly", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'hours_requested', type: 'float', nullable: true }),
    __metadata("design:type", Number)
], LeaveApplication.prototype, "hoursRequested", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'manager_approved_id', nullable: true }),
    __metadata("design:type", Number)
], LeaveApplication.prototype, "managerApprovedId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'manager_comments', type: 'text', nullable: true }),
    __metadata("design:type", String)
], LeaveApplication.prototype, "managerComments", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at', type: 'timestamp' }),
    __metadata("design:type", Date)
], LeaveApplication.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at', type: 'timestamp' }),
    __metadata("design:type", Date)
], LeaveApplication.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'approved_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], LeaveApplication.prototype, "approvedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.leaveApplications),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], LeaveApplication.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => leave_type_entity_1.LeaveType, (leaveType) => leaveType.leaveApplications),
    (0, typeorm_1.JoinColumn)({ name: 'leave_type_id' }),
    __metadata("design:type", leave_type_entity_1.LeaveType)
], LeaveApplication.prototype, "leaveType", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.approvedLeaveApplications, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'manager_approved_id' }),
    __metadata("design:type", user_entity_1.User)
], LeaveApplication.prototype, "managerApproved", void 0);
exports.LeaveApplication = LeaveApplication = __decorate([
    (0, typeorm_1.Entity)('leave_applications')
], LeaveApplication);
//# sourceMappingURL=leave-application.entity.js.map