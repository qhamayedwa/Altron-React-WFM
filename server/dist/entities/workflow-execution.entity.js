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
exports.WorkflowExecution = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
let WorkflowExecution = class WorkflowExecution {
    id;
    workflowName;
    workflowType;
    startedAt;
    completedAt;
    status;
    recordsProcessed;
    recordsSuccessful;
    recordsFailed;
    triggeredByUserId;
    executionMode;
    executionLog;
    errorMessage;
    triggeredByUser;
};
exports.WorkflowExecution = WorkflowExecution;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], WorkflowExecution.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'workflow_name', length: 50 }),
    __metadata("design:type", String)
], WorkflowExecution.prototype, "workflowName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'workflow_type', length: 30 }),
    __metadata("design:type", String)
], WorkflowExecution.prototype, "workflowType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'started_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], WorkflowExecution.prototype, "startedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'completed_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], WorkflowExecution.prototype, "completedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20, nullable: true }),
    __metadata("design:type", String)
], WorkflowExecution.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'records_processed', type: 'int', nullable: true }),
    __metadata("design:type", Number)
], WorkflowExecution.prototype, "recordsProcessed", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'records_successful', type: 'int', nullable: true }),
    __metadata("design:type", Number)
], WorkflowExecution.prototype, "recordsSuccessful", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'records_failed', type: 'int', nullable: true }),
    __metadata("design:type", Number)
], WorkflowExecution.prototype, "recordsFailed", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'triggered_by_user_id', nullable: true }),
    __metadata("design:type", Number)
], WorkflowExecution.prototype, "triggeredByUserId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'execution_mode', length: 20, nullable: true }),
    __metadata("design:type", String)
], WorkflowExecution.prototype, "executionMode", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'execution_log', type: 'text', nullable: true }),
    __metadata("design:type", String)
], WorkflowExecution.prototype, "executionLog", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'error_message', type: 'text', nullable: true }),
    __metadata("design:type", String)
], WorkflowExecution.prototype, "errorMessage", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.workflowExecutions, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'triggered_by_user_id' }),
    __metadata("design:type", user_entity_1.User)
], WorkflowExecution.prototype, "triggeredByUser", void 0);
exports.WorkflowExecution = WorkflowExecution = __decorate([
    (0, typeorm_1.Entity)('workflow_executions')
], WorkflowExecution);
//# sourceMappingURL=workflow-execution.entity.js.map