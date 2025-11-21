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
exports.User = void 0;
const typeorm_1 = require("typeorm");
const department_entity_1 = require("./department.entity");
const job_entity_1 = require("./job.entity");
const time_entry_entity_1 = require("./time-entry.entity");
const leave_application_entity_1 = require("./leave-application.entity");
const leave_balance_entity_1 = require("./leave-balance.entity");
const schedule_entity_1 = require("./schedule.entity");
const notification_entity_1 = require("./notification.entity");
const notification_preference_entity_1 = require("./notification-preference.entity");
const dashboard_config_entity_1 = require("./dashboard-config.entity");
const pay_calculation_entity_1 = require("./pay-calculation.entity");
const pay_code_entity_1 = require("./pay-code.entity");
const pay_rule_entity_1 = require("./pay-rule.entity");
const post_entity_1 = require("./post.entity");
const pulse_survey_entity_1 = require("./pulse-survey.entity");
const pulse_survey_response_entity_1 = require("./pulse-survey-response.entity");
const user_role_entity_1 = require("./user-role.entity");
const workflow_config_entity_1 = require("./workflow-config.entity");
const workflow_execution_entity_1 = require("./workflow-execution.entity");
let User = class User {
    id;
    username;
    email;
    passwordHash;
    firstName;
    lastName;
    phone;
    departmentId;
    jobId;
    managerId;
    employeeNumber;
    hireDate;
    terminationDate;
    employmentStatus;
    employmentType;
    workSchedule;
    standardHoursPerWeek;
    hourlyRate;
    annualSalary;
    payFrequency;
    bankName;
    bankAccountNumber;
    bankBranchCode;
    taxId;
    dateOfBirth;
    gender;
    nationality;
    idNumber;
    passportNumber;
    addressLine1;
    addressLine2;
    city;
    stateProvince;
    postalCode;
    country;
    emergencyContactName;
    emergencyContactPhone;
    emergencyContactRelationship;
    profilePictureUrl;
    isActive;
    lastLogin;
    createdAt;
    updatedAt;
    department;
    job;
    manager;
    subordinates;
    managedDepartments;
    deputyManagedDepartments;
    timeEntries;
    leaveApplications;
    approvedLeaveApplications;
    leaveBalances;
    schedules;
    notifications;
    dashboardConfigs;
    payCalculations;
    pulseSurveyResponses;
    userRoles;
    assignedSchedules;
    approvedTimeEntries;
    absenceApprovedTimeEntries;
    calculatedPayCalculations;
    posts;
    createdPulseSurveys;
    notificationPreferences;
    payCodes;
    payRules;
    workflowConfigs;
    workflowExecutions;
};
exports.User = User;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], User.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 64, unique: true }),
    __metadata("design:type", String)
], User.prototype, "username", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 120, unique: true }),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'password_hash', length: 256 }),
    __metadata("design:type", String)
], User.prototype, "passwordHash", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'first_name', length: 50, nullable: true }),
    __metadata("design:type", String)
], User.prototype, "firstName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'last_name', length: 50, nullable: true }),
    __metadata("design:type", String)
], User.prototype, "lastName", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20, nullable: true }),
    __metadata("design:type", String)
], User.prototype, "phone", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'department_id', nullable: true }),
    __metadata("design:type", Number)
], User.prototype, "departmentId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'job_id', nullable: true }),
    __metadata("design:type", Number)
], User.prototype, "jobId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'manager_id', nullable: true }),
    __metadata("design:type", Number)
], User.prototype, "managerId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'employee_number', length: 20, nullable: true }),
    __metadata("design:type", String)
], User.prototype, "employeeNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', name: 'hire_date', nullable: true }),
    __metadata("design:type", Date)
], User.prototype, "hireDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', name: 'termination_date', nullable: true }),
    __metadata("design:type", Date)
], User.prototype, "terminationDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'employment_status', length: 20, nullable: true }),
    __metadata("design:type", String)
], User.prototype, "employmentStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'employment_type', length: 20, nullable: true }),
    __metadata("design:type", String)
], User.prototype, "employmentType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'work_schedule', length: 20, nullable: true }),
    __metadata("design:type", String)
], User.prototype, "workSchedule", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float', name: 'standard_hours_per_week', nullable: true }),
    __metadata("design:type", Number)
], User.prototype, "standardHoursPerWeek", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float', name: 'hourly_rate', nullable: true }),
    __metadata("design:type", Number)
], User.prototype, "hourlyRate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float', name: 'annual_salary', nullable: true }),
    __metadata("design:type", Number)
], User.prototype, "annualSalary", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'pay_frequency', length: 20, nullable: true }),
    __metadata("design:type", String)
], User.prototype, "payFrequency", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'bank_name', length: 100, nullable: true }),
    __metadata("design:type", String)
], User.prototype, "bankName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'bank_account_number', length: 50, nullable: true }),
    __metadata("design:type", String)
], User.prototype, "bankAccountNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'bank_branch_code', length: 20, nullable: true }),
    __metadata("design:type", String)
], User.prototype, "bankBranchCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tax_id', length: 50, nullable: true }),
    __metadata("design:type", String)
], User.prototype, "taxId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', name: 'date_of_birth', nullable: true }),
    __metadata("design:type", Date)
], User.prototype, "dateOfBirth", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 10, nullable: true }),
    __metadata("design:type", String)
], User.prototype, "gender", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'nationality', length: 50, nullable: true }),
    __metadata("design:type", String)
], User.prototype, "nationality", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'id_number', length: 20, nullable: true }),
    __metadata("design:type", String)
], User.prototype, "idNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'passport_number', length: 20, nullable: true }),
    __metadata("design:type", String)
], User.prototype, "passportNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'address_line1', length: 100, nullable: true }),
    __metadata("design:type", String)
], User.prototype, "addressLine1", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'address_line2', length: 100, nullable: true }),
    __metadata("design:type", String)
], User.prototype, "addressLine2", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, nullable: true }),
    __metadata("design:type", String)
], User.prototype, "city", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'state_province', length: 50, nullable: true }),
    __metadata("design:type", String)
], User.prototype, "stateProvince", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'postal_code', length: 20, nullable: true }),
    __metadata("design:type", String)
], User.prototype, "postalCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, nullable: true }),
    __metadata("design:type", String)
], User.prototype, "country", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'emergency_contact_name', length: 100, nullable: true }),
    __metadata("design:type", String)
], User.prototype, "emergencyContactName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'emergency_contact_phone', length: 20, nullable: true }),
    __metadata("design:type", String)
], User.prototype, "emergencyContactPhone", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'emergency_contact_relationship', length: 50, nullable: true }),
    __metadata("design:type", String)
], User.prototype, "emergencyContactRelationship", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'profile_picture_url', length: 255, nullable: true }),
    __metadata("design:type", String)
], User.prototype, "profilePictureUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', default: true }),
    __metadata("design:type", Boolean)
], User.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'last_login', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], User.prototype, "lastLogin", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at', type: 'timestamp' }),
    __metadata("design:type", Date)
], User.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at', type: 'timestamp' }),
    __metadata("design:type", Date)
], User.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => department_entity_1.Department, (department) => department.users, { onDelete: 'SET NULL' }),
    (0, typeorm_1.JoinColumn)({ name: 'department_id' }),
    __metadata("design:type", department_entity_1.Department)
], User.prototype, "department", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => job_entity_1.Job, (job) => job.users, { onDelete: 'SET NULL' }),
    (0, typeorm_1.JoinColumn)({ name: 'job_id' }),
    __metadata("design:type", job_entity_1.Job)
], User.prototype, "job", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User, (user) => user.subordinates, { onDelete: 'SET NULL' }),
    (0, typeorm_1.JoinColumn)({ name: 'manager_id' }),
    __metadata("design:type", User)
], User.prototype, "manager", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => User, (user) => user.manager),
    __metadata("design:type", Array)
], User.prototype, "subordinates", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => department_entity_1.Department, (department) => department.manager),
    __metadata("design:type", Array)
], User.prototype, "managedDepartments", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => department_entity_1.Department, (department) => department.deputyManager),
    __metadata("design:type", Array)
], User.prototype, "deputyManagedDepartments", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => time_entry_entity_1.TimeEntry, (timeEntry) => timeEntry.user),
    __metadata("design:type", Array)
], User.prototype, "timeEntries", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => leave_application_entity_1.LeaveApplication, (leaveApp) => leaveApp.user),
    __metadata("design:type", Array)
], User.prototype, "leaveApplications", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => leave_application_entity_1.LeaveApplication, (leaveApp) => leaveApp.managerApproved),
    __metadata("design:type", Array)
], User.prototype, "approvedLeaveApplications", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => leave_balance_entity_1.LeaveBalance, (balance) => balance.user),
    __metadata("design:type", Array)
], User.prototype, "leaveBalances", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => schedule_entity_1.Schedule, (schedule) => schedule.user),
    __metadata("design:type", Array)
], User.prototype, "schedules", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => notification_entity_1.Notification, (notification) => notification.user),
    __metadata("design:type", Array)
], User.prototype, "notifications", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => dashboard_config_entity_1.DashboardConfig, (config) => config.createdByUser),
    __metadata("design:type", Array)
], User.prototype, "dashboardConfigs", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => pay_calculation_entity_1.PayCalculation, (calc) => calc.user),
    __metadata("design:type", Array)
], User.prototype, "payCalculations", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => pulse_survey_response_entity_1.PulseSurveyResponse, (response) => response.user),
    __metadata("design:type", Array)
], User.prototype, "pulseSurveyResponses", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => user_role_entity_1.UserRole, (userRole) => userRole.user),
    __metadata("design:type", Array)
], User.prototype, "userRoles", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => schedule_entity_1.Schedule, (schedule) => schedule.assignedByManager),
    __metadata("design:type", Array)
], User.prototype, "assignedSchedules", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => time_entry_entity_1.TimeEntry, (timeEntry) => timeEntry.approvedByManager),
    __metadata("design:type", Array)
], User.prototype, "approvedTimeEntries", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => time_entry_entity_1.TimeEntry, (timeEntry) => timeEntry.absenceApprovedBy),
    __metadata("design:type", Array)
], User.prototype, "absenceApprovedTimeEntries", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => pay_calculation_entity_1.PayCalculation, (calc) => calc.calculatedBy),
    __metadata("design:type", Array)
], User.prototype, "calculatedPayCalculations", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => post_entity_1.Post, (post) => post.user),
    __metadata("design:type", Array)
], User.prototype, "posts", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => pulse_survey_entity_1.PulseSurvey, (survey) => survey.createdBy),
    __metadata("design:type", Array)
], User.prototype, "createdPulseSurveys", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => notification_preference_entity_1.NotificationPreference, (pref) => pref.user),
    __metadata("design:type", Array)
], User.prototype, "notificationPreferences", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => pay_code_entity_1.PayCode, (payCode) => payCode.createdBy),
    __metadata("design:type", Array)
], User.prototype, "payCodes", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => pay_rule_entity_1.PayRule, (payRule) => payRule.createdBy),
    __metadata("design:type", Array)
], User.prototype, "payRules", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => workflow_config_entity_1.WorkflowConfig, (config) => config.user),
    __metadata("design:type", Array)
], User.prototype, "workflowConfigs", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => workflow_execution_entity_1.WorkflowExecution, (execution) => execution.triggeredByUser),
    __metadata("design:type", Array)
], User.prototype, "workflowExecutions", void 0);
exports.User = User = __decorate([
    (0, typeorm_1.Entity)('users')
], User);
//# sourceMappingURL=user.entity.js.map