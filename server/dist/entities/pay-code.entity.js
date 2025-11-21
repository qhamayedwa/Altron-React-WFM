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
exports.PayCode = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
const time_entry_entity_1 = require("./time-entry.entity");
let PayCode = class PayCode {
    id;
    code;
    description;
    isAbsenceCode;
    isActive;
    createdAt;
    updatedAt;
    createdById;
    configuration;
    createdBy;
    timeEntries;
    absenceTimeEntries;
};
exports.PayCode = PayCode;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], PayCode.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 32, unique: true }),
    __metadata("design:type", String)
], PayCode.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255 }),
    __metadata("design:type", String)
], PayCode.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_absence_code' }),
    __metadata("design:type", Boolean)
], PayCode.prototype, "isAbsenceCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active' }),
    __metadata("design:type", Boolean)
], PayCode.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at', type: 'timestamp' }),
    __metadata("design:type", Date)
], PayCode.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at', type: 'timestamp' }),
    __metadata("design:type", Date)
], PayCode.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'created_by_id' }),
    __metadata("design:type", Number)
], PayCode.prototype, "createdById", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], PayCode.prototype, "configuration", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.payRules),
    (0, typeorm_1.JoinColumn)({ name: 'created_by_id' }),
    __metadata("design:type", user_entity_1.User)
], PayCode.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => time_entry_entity_1.TimeEntry, (timeEntry) => timeEntry.payCode),
    __metadata("design:type", Array)
], PayCode.prototype, "timeEntries", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => time_entry_entity_1.TimeEntry, (timeEntry) => timeEntry.absencePayCode),
    __metadata("design:type", Array)
], PayCode.prototype, "absenceTimeEntries", void 0);
exports.PayCode = PayCode = __decorate([
    (0, typeorm_1.Entity)('pay_codes')
], PayCode);
//# sourceMappingURL=pay-code.entity.js.map