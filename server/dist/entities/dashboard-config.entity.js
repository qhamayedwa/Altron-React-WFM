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
exports.DashboardConfig = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
let DashboardConfig = class DashboardConfig {
    id;
    configName;
    configData;
    createdBy;
    isActive;
    createdAt;
    updatedAt;
    createdByUser;
};
exports.DashboardConfig = DashboardConfig;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], DashboardConfig.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'config_name', length: 100, nullable: true }),
    __metadata("design:type", String)
], DashboardConfig.prototype, "configName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'config_data', type: 'text' }),
    __metadata("design:type", String)
], DashboardConfig.prototype, "configData", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'created_by' }),
    __metadata("design:type", Number)
], DashboardConfig.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', default: true }),
    __metadata("design:type", Boolean)
], DashboardConfig.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at', type: 'timestamp' }),
    __metadata("design:type", Date)
], DashboardConfig.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at', type: 'timestamp' }),
    __metadata("design:type", Date)
], DashboardConfig.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.dashboardConfigs),
    (0, typeorm_1.JoinColumn)({ name: 'created_by' }),
    __metadata("design:type", user_entity_1.User)
], DashboardConfig.prototype, "createdByUser", void 0);
exports.DashboardConfig = DashboardConfig = __decorate([
    (0, typeorm_1.Entity)('dashboard_configs')
], DashboardConfig);
//# sourceMappingURL=dashboard-config.entity.js.map