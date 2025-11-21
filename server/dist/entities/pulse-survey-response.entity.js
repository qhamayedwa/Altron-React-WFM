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
exports.PulseSurveyResponse = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
const pulse_survey_entity_1 = require("./pulse-survey.entity");
let PulseSurveyResponse = class PulseSurveyResponse {
    id;
    surveyId;
    userId;
    responses;
    submittedAt;
    survey;
    user;
};
exports.PulseSurveyResponse = PulseSurveyResponse;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], PulseSurveyResponse.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'survey_id' }),
    __metadata("design:type", Number)
], PulseSurveyResponse.prototype, "surveyId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id' }),
    __metadata("design:type", Number)
], PulseSurveyResponse.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], PulseSurveyResponse.prototype, "responses", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'submitted_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], PulseSurveyResponse.prototype, "submittedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => pulse_survey_entity_1.PulseSurvey, (survey) => survey.pulseSurveyResponses),
    (0, typeorm_1.JoinColumn)({ name: 'survey_id' }),
    __metadata("design:type", pulse_survey_entity_1.PulseSurvey)
], PulseSurveyResponse.prototype, "survey", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.pulseSurveyResponses),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], PulseSurveyResponse.prototype, "user", void 0);
exports.PulseSurveyResponse = PulseSurveyResponse = __decorate([
    (0, typeorm_1.Entity)('pulse_survey_responses')
], PulseSurveyResponse);
//# sourceMappingURL=pulse-survey-response.entity.js.map