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
exports.PulseSurvey = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
const pulse_survey_response_entity_1 = require("./pulse-survey-response.entity");
let PulseSurvey = class PulseSurvey {
    id;
    title;
    description;
    createdById;
    createdAt;
    endsAt;
    isActive;
    isAnonymous;
    targetDepartment;
    createdBy;
    pulseSurveyResponses;
};
exports.PulseSurvey = PulseSurvey;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], PulseSurvey.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 200 }),
    __metadata("design:type", String)
], PulseSurvey.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], PulseSurvey.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'created_by_id' }),
    __metadata("design:type", Number)
], PulseSurvey.prototype, "createdById", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at', type: 'timestamp' }),
    __metadata("design:type", Date)
], PulseSurvey.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ends_at', type: 'timestamp' }),
    __metadata("design:type", Date)
], PulseSurvey.prototype, "endsAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', default: true }),
    __metadata("design:type", Boolean)
], PulseSurvey.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_anonymous', default: false }),
    __metadata("design:type", Boolean)
], PulseSurvey.prototype, "isAnonymous", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'target_department', length: 64, nullable: true }),
    __metadata("design:type", String)
], PulseSurvey.prototype, "targetDepartment", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.createdPulseSurveys),
    (0, typeorm_1.JoinColumn)({ name: 'created_by_id' }),
    __metadata("design:type", user_entity_1.User)
], PulseSurvey.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => pulse_survey_response_entity_1.PulseSurveyResponse, (response) => response.survey),
    __metadata("design:type", Array)
], PulseSurvey.prototype, "pulseSurveyResponses", void 0);
exports.PulseSurvey = PulseSurvey = __decorate([
    (0, typeorm_1.Entity)('pulse_surveys')
], PulseSurvey);
//# sourceMappingURL=pulse-survey.entity.js.map