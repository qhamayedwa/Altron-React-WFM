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
exports.ShiftType = void 0;
const typeorm_1 = require("typeorm");
const schedule_entity_1 = require("./schedule.entity");
let ShiftType = class ShiftType {
    id;
    name;
    defaultStartTime;
    defaultEndTime;
    description;
    isActive;
    createdAt;
    schedules;
};
exports.ShiftType = ShiftType;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], ShiftType.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 64, unique: true }),
    __metadata("design:type", String)
], ShiftType.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'default_start_time', type: 'time' }),
    __metadata("design:type", Date)
], ShiftType.prototype, "defaultStartTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'default_end_time', type: 'time' }),
    __metadata("design:type", Date)
], ShiftType.prototype, "defaultEndTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255, nullable: true }),
    __metadata("design:type", String)
], ShiftType.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', default: true }),
    __metadata("design:type", Boolean)
], ShiftType.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at', type: 'timestamp' }),
    __metadata("design:type", Date)
], ShiftType.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => schedule_entity_1.Schedule, (schedule) => schedule.shiftType),
    __metadata("design:type", Array)
], ShiftType.prototype, "schedules", void 0);
exports.ShiftType = ShiftType = __decorate([
    (0, typeorm_1.Entity)('shift_types')
], ShiftType);
//# sourceMappingURL=shift-type.entity.js.map