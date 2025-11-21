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
exports.Region = void 0;
const typeorm_1 = require("typeorm");
const company_entity_1 = require("./company.entity");
const site_entity_1 = require("./site.entity");
let Region = class Region {
    id;
    companyId;
    name;
    code;
    description;
    managerName;
    email;
    phone;
    addressLine1;
    addressLine2;
    city;
    stateProvince;
    postalCode;
    timezone;
    isActive;
    createdAt;
    updatedAt;
    company;
    sites;
};
exports.Region = Region;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Region.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'company_id' }),
    __metadata("design:type", Number)
], Region.prototype, "companyId", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    __metadata("design:type", String)
], Region.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 10 }),
    __metadata("design:type", String)
], Region.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Region.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'manager_name', length: 100, nullable: true }),
    __metadata("design:type", String)
], Region.prototype, "managerName", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 120, nullable: true }),
    __metadata("design:type", String)
], Region.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20, nullable: true }),
    __metadata("design:type", String)
], Region.prototype, "phone", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'address_line1', length: 100, nullable: true }),
    __metadata("design:type", String)
], Region.prototype, "addressLine1", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'address_line2', length: 100, nullable: true }),
    __metadata("design:type", String)
], Region.prototype, "addressLine2", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, nullable: true }),
    __metadata("design:type", String)
], Region.prototype, "city", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'state_province', length: 50, nullable: true }),
    __metadata("design:type", String)
], Region.prototype, "stateProvince", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'postal_code', length: 20, nullable: true }),
    __metadata("design:type", String)
], Region.prototype, "postalCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, nullable: true }),
    __metadata("design:type", String)
], Region.prototype, "timezone", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', default: true }),
    __metadata("design:type", Boolean)
], Region.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at', type: 'timestamp' }),
    __metadata("design:type", Date)
], Region.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at', type: 'timestamp' }),
    __metadata("design:type", Date)
], Region.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => company_entity_1.Company, (company) => company.regions),
    (0, typeorm_1.JoinColumn)({ name: 'company_id' }),
    __metadata("design:type", company_entity_1.Company)
], Region.prototype, "company", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => site_entity_1.Site, (site) => site.region),
    __metadata("design:type", Array)
], Region.prototype, "sites", void 0);
exports.Region = Region = __decorate([
    (0, typeorm_1.Entity)('regions')
], Region);
//# sourceMappingURL=region.entity.js.map