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
exports.NotificationType = void 0;
const typeorm_1 = require("typeorm");
const notification_entity_1 = require("./notification.entity");
const notification_preference_entity_1 = require("./notification-preference.entity");
let NotificationType = class NotificationType {
    id;
    name;
    displayName;
    description;
    icon;
    color;
    isActive;
    priority;
    autoClearHours;
    createdAt;
    notifications;
    notificationPreferences;
};
exports.NotificationType = NotificationType;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], NotificationType.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, unique: true }),
    __metadata("design:type", String)
], NotificationType.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'display_name', length: 100 }),
    __metadata("design:type", String)
], NotificationType.prototype, "displayName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], NotificationType.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, nullable: true }),
    __metadata("design:type", String)
], NotificationType.prototype, "icon", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20, nullable: true }),
    __metadata("design:type", String)
], NotificationType.prototype, "color", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', default: true }),
    __metadata("design:type", Boolean)
], NotificationType.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 10, nullable: true }),
    __metadata("design:type", String)
], NotificationType.prototype, "priority", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'auto_clear_hours', type: 'int', nullable: true }),
    __metadata("design:type", Number)
], NotificationType.prototype, "autoClearHours", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at', type: 'timestamp' }),
    __metadata("design:type", Date)
], NotificationType.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => notification_entity_1.Notification, (notification) => notification.notificationType),
    __metadata("design:type", Array)
], NotificationType.prototype, "notifications", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => notification_preference_entity_1.NotificationPreference, (preference) => preference.notificationType),
    __metadata("design:type", Array)
], NotificationType.prototype, "notificationPreferences", void 0);
exports.NotificationType = NotificationType = __decorate([
    (0, typeorm_1.Entity)('notification_types')
], NotificationType);
//# sourceMappingURL=notification-type.entity.js.map