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
exports.Site = void 0;
const typeorm_1 = require("typeorm");
const region_entity_1 = require("./region.entity");
const department_entity_1 = require("./department.entity");
let Site = class Site {
    id;
    regionId;
    name;
    code;
    siteType;
    description;
    managerName;
    email;
    phone;
    addressLine1;
    addressLine2;
    city;
    stateProvince;
    postalCode;
    latitude;
    longitude;
    geoFenceRadius;
    operatingHoursStart;
    operatingHoursEnd;
    timezone;
    allowRemoteWork;
    isActive;
    createdAt;
    updatedAt;
    region;
    departments;
};
exports.Site = Site;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Site.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'region_id' }),
    __metadata("design:type", Number)
], Site.prototype, "regionId", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    __metadata("design:type", String)
], Site.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 10 }),
    __metadata("design:type", String)
], Site.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'site_type', length: 50, nullable: true }),
    __metadata("design:type", String)
], Site.prototype, "siteType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Site.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'manager_name', length: 100, nullable: true }),
    __metadata("design:type", String)
], Site.prototype, "managerName", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 120, nullable: true }),
    __metadata("design:type", String)
], Site.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20, nullable: true }),
    __metadata("design:type", String)
], Site.prototype, "phone", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'address_line1', length: 100 }),
    __metadata("design:type", String)
], Site.prototype, "addressLine1", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'address_line2', length: 100, nullable: true }),
    __metadata("design:type", String)
], Site.prototype, "addressLine2", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50 }),
    __metadata("design:type", String)
], Site.prototype, "city", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'state_province', length: 50, nullable: true }),
    __metadata("design:type", String)
], Site.prototype, "stateProvince", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'postal_code', length: 20, nullable: true }),
    __metadata("design:type", String)
], Site.prototype, "postalCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float', nullable: true }),
    __metadata("design:type", Number)
], Site.prototype, "latitude", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float', nullable: true }),
    __metadata("design:type", Number)
], Site.prototype, "longitude", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'geo_fence_radius', type: 'int', nullable: true }),
    __metadata("design:type", Number)
], Site.prototype, "geoFenceRadius", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'operating_hours_start', type: 'time', nullable: true }),
    __metadata("design:type", Date)
], Site.prototype, "operatingHoursStart", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'operating_hours_end', type: 'time', nullable: true }),
    __metadata("design:type", Date)
], Site.prototype, "operatingHoursEnd", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, nullable: true }),
    __metadata("design:type", String)
], Site.prototype, "timezone", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'allow_remote_work', default: false }),
    __metadata("design:type", Boolean)
], Site.prototype, "allowRemoteWork", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', default: true }),
    __metadata("design:type", Boolean)
], Site.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at', type: 'timestamp' }),
    __metadata("design:type", Date)
], Site.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at', type: 'timestamp' }),
    __metadata("design:type", Date)
], Site.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => region_entity_1.Region, (region) => region.sites),
    (0, typeorm_1.JoinColumn)({ name: 'region_id' }),
    __metadata("design:type", region_entity_1.Region)
], Site.prototype, "region", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => department_entity_1.Department, (department) => department.site),
    __metadata("design:type", Array)
], Site.prototype, "departments", void 0);
exports.Site = Site = __decorate([
    (0, typeorm_1.Entity)('sites')
], Site);
//# sourceMappingURL=site.entity.js.map