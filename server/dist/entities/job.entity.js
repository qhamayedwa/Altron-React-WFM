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
exports.Job = void 0;
const typeorm_1 = require("typeorm");
const department_entity_1 = require("./department.entity");
const user_entity_1 = require("./user.entity");
let Job = class Job {
    id;
    title;
    code;
    description;
    departmentId;
    level;
    employmentType;
    minSalary;
    maxSalary;
    requiredSkills;
    requiredExperienceYears;
    educationRequirements;
    isActive;
    createdAt;
    updatedAt;
    department;
    users;
};
exports.Job = Job;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Job.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    __metadata("design:type", String)
], Job.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20, unique: true }),
    __metadata("design:type", String)
], Job.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Job.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'department_id', nullable: true }),
    __metadata("design:type", Number)
], Job.prototype, "departmentId", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, nullable: true }),
    __metadata("design:type", String)
], Job.prototype, "level", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'employment_type', length: 50, nullable: true }),
    __metadata("design:type", String)
], Job.prototype, "employmentType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'min_salary', type: 'float', nullable: true }),
    __metadata("design:type", Number)
], Job.prototype, "minSalary", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'max_salary', type: 'float', nullable: true }),
    __metadata("design:type", Number)
], Job.prototype, "maxSalary", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'required_skills', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Job.prototype, "requiredSkills", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'required_experience_years', type: 'int', nullable: true }),
    __metadata("design:type", Number)
], Job.prototype, "requiredExperienceYears", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'education_requirements', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Job.prototype, "educationRequirements", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', default: true }),
    __metadata("design:type", Boolean)
], Job.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at', type: 'timestamp' }),
    __metadata("design:type", Date)
], Job.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at', type: 'timestamp' }),
    __metadata("design:type", Date)
], Job.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => department_entity_1.Department, (department) => department.jobs, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'department_id' }),
    __metadata("design:type", department_entity_1.Department)
], Job.prototype, "department", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => user_entity_1.User, (user) => user.job),
    __metadata("design:type", Array)
], Job.prototype, "users", void 0);
exports.Job = Job = __decorate([
    (0, typeorm_1.Entity)('jobs')
], Job);
//# sourceMappingURL=job.entity.js.map