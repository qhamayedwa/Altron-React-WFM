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
exports.NotificationPreference = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
const notification_type_entity_1 = require("./notification-type.entity");
let NotificationPreference = class NotificationPreference {
    id;
    userId;
    typeId;
    webEnabled;
    emailEnabled;
    smsEnabled;
    immediate;
    dailyDigest;
    weeklyDigest;
    createdAt;
    updatedAt;
    user;
    notificationType;
};
exports.NotificationPreference = NotificationPreference;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], NotificationPreference.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id' }),
    __metadata("design:type", Number)
], NotificationPreference.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'type_id' }),
    __metadata("design:type", Number)
], NotificationPreference.prototype, "typeId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'web_enabled', default: true }),
    __metadata("design:type", Boolean)
], NotificationPreference.prototype, "webEnabled", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'email_enabled', default: false }),
    __metadata("design:type", Boolean)
], NotificationPreference.prototype, "emailEnabled", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'sms_enabled', default: false }),
    __metadata("design:type", Boolean)
], NotificationPreference.prototype, "smsEnabled", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], NotificationPreference.prototype, "immediate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'daily_digest', default: false }),
    __metadata("design:type", Boolean)
], NotificationPreference.prototype, "dailyDigest", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'weekly_digest', default: false }),
    __metadata("design:type", Boolean)
], NotificationPreference.prototype, "weeklyDigest", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at', type: 'timestamp' }),
    __metadata("design:type", Date)
], NotificationPreference.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at', type: 'timestamp' }),
    __metadata("design:type", Date)
], NotificationPreference.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.notificationPreferences),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], NotificationPreference.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => notification_type_entity_1.NotificationType, (type) => type.notificationPreferences),
    (0, typeorm_1.JoinColumn)({ name: 'type_id' }),
    __metadata("design:type", notification_type_entity_1.NotificationType)
], NotificationPreference.prototype, "notificationType", void 0);
exports.NotificationPreference = NotificationPreference = __decorate([
    (0, typeorm_1.Entity)('notification_preferences')
], NotificationPreference);
//# sourceMappingURL=notification-preference.entity.js.map