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
exports.Department = void 0;
const typeorm_1 = require("typeorm");
const site_entity_1 = require("./site.entity");
const user_entity_1 = require("./user.entity");
const job_entity_1 = require("./job.entity");
let Department = class Department {
    id;
    siteId;
    name;
    code;
    description;
    costCenter;
    budgetCode;
    managerId;
    deputyManagerId;
    email;
    phone;
    extension;
    standardHoursPerDay;
    standardHoursPerWeek;
    isActive;
    createdAt;
    updatedAt;
    site;
    manager;
    deputyManager;
    jobs;
    users;
};
exports.Department = Department;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Department.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'site_id' }),
    __metadata("design:type", Number)
], Department.prototype, "siteId", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    __metadata("design:type", String)
], Department.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 10 }),
    __metadata("design:type", String)
], Department.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Department.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cost_center', length: 20, nullable: true }),
    __metadata("design:type", String)
], Department.prototype, "costCenter", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'budget_code', length: 20, nullable: true }),
    __metadata("design:type", String)
], Department.prototype, "budgetCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'manager_id', nullable: true }),
    __metadata("design:type", Number)
], Department.prototype, "managerId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'deputy_manager_id', nullable: true }),
    __metadata("design:type", Number)
], Department.prototype, "deputyManagerId", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 120, nullable: true }),
    __metadata("design:type", String)
], Department.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20, nullable: true }),
    __metadata("design:type", String)
], Department.prototype, "phone", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 10, nullable: true }),
    __metadata("design:type", String)
], Department.prototype, "extension", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'standard_hours_per_day', type: 'float', nullable: true }),
    __metadata("design:type", Number)
], Department.prototype, "standardHoursPerDay", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'standard_hours_per_week', type: 'float', nullable: true }),
    __metadata("design:type", Number)
], Department.prototype, "standardHoursPerWeek", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', default: true }),
    __metadata("design:type", Boolean)
], Department.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at', type: 'timestamp' }),
    __metadata("design:type", Date)
], Department.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at', type: 'timestamp' }),
    __metadata("design:type", Date)
], Department.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => site_entity_1.Site, (site) => site.departments),
    (0, typeorm_1.JoinColumn)({ name: 'site_id' }),
    __metadata("design:type", site_entity_1.Site)
], Department.prototype, "site", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.managedDepartments, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'manager_id' }),
    __metadata("design:type", user_entity_1.User)
], Department.prototype, "manager", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.deputyManagedDepartments, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'deputy_manager_id' }),
    __metadata("design:type", user_entity_1.User)
], Department.prototype, "deputyManager", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => job_entity_1.Job, (job) => job.department),
    __metadata("design:type", Array)
], Department.prototype, "jobs", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => user_entity_1.User, (user) => user.department),
    __metadata("design:type", Array)
], Department.prototype, "users", void 0);
exports.Department = Department = __decorate([
    (0, typeorm_1.Entity)('departments')
], Department);
//# sourceMappingURL=department.entity.js.map