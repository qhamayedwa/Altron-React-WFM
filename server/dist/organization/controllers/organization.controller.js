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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrganizationController = void 0;
const common_1 = require("@nestjs/common");
const authenticated_guard_1 = require("../../auth/guards/authenticated.guard");
const roles_guard_1 = require("../../auth/guards/roles.guard");
const roles_decorator_1 = require("../../auth/decorators/roles.decorator");
const organization_service_1 = require("../services/organization.service");
const dto_1 = require("../dto");
let OrganizationController = class OrganizationController {
    organizationService;
    constructor(organizationService) {
        this.organizationService = organizationService;
    }
    async getDashboard() {
        return this.organizationService.getDashboard();
    }
    async findAllCompanies() {
        return this.organizationService.findAllCompanies();
    }
    async findCompany(id) {
        return this.organizationService.findCompany(id);
    }
    async createCompany(dto) {
        return this.organizationService.createCompany(dto);
    }
    async updateCompany(id, dto) {
        return this.organizationService.updateCompany(id, dto);
    }
    async deleteCompany(id) {
        return this.organizationService.deleteCompany(id);
    }
    async createRegion(companyId, dto) {
        return this.organizationService.createRegion(companyId, dto);
    }
    async findRegion(id) {
        return this.organizationService.findRegion(id);
    }
    async updateRegion(id, dto) {
        return this.organizationService.updateRegion(id, dto);
    }
    async deleteRegion(id) {
        return this.organizationService.deleteRegion(id);
    }
    async createSite(regionId, dto) {
        return this.organizationService.createSite(regionId, dto);
    }
    async findSite(id) {
        return this.organizationService.findSite(id);
    }
    async updateSite(id, dto) {
        return this.organizationService.updateSite(id, dto);
    }
    async deleteSite(id) {
        return this.organizationService.deleteSite(id);
    }
    async createDepartment(siteId, dto) {
        return this.organizationService.createDepartment(siteId, dto);
    }
    async findAllDepartments() {
        return this.organizationService.findAllDepartments();
    }
    async findDepartment(id) {
        return this.organizationService.findDepartment(id);
    }
    async updateDepartment(id, dto) {
        return this.organizationService.updateDepartment(id, dto);
    }
    async deleteDepartment(id) {
        return this.organizationService.deleteDepartment(id);
    }
    async assignEmployee(dto) {
        return this.organizationService.assignEmployee(dto);
    }
    async getHierarchy(companyId) {
        return this.organizationService.getHierarchy(companyId);
    }
    async searchOrganization(query) {
        return this.organizationService.searchOrganization(query);
    }
};
exports.OrganizationController = OrganizationController;
__decorate([
    (0, common_1.Get)('dashboard'),
    (0, roles_decorator_1.Roles)('Super User', 'Admin', 'HR'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], OrganizationController.prototype, "getDashboard", null);
__decorate([
    (0, common_1.Get)('companies'),
    (0, roles_decorator_1.Roles)('Super User', 'Admin', 'HR'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], OrganizationController.prototype, "findAllCompanies", null);
__decorate([
    (0, common_1.Get)('companies/:id'),
    (0, roles_decorator_1.Roles)('Super User', 'Admin', 'HR', 'Manager'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], OrganizationController.prototype, "findCompany", null);
__decorate([
    (0, common_1.Post)('companies'),
    (0, roles_decorator_1.Roles)('Super User', 'Admin'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateCompanyDto]),
    __metadata("design:returntype", Promise)
], OrganizationController.prototype, "createCompany", null);
__decorate([
    (0, common_1.Put)('companies/:id'),
    (0, roles_decorator_1.Roles)('Super User', 'Admin'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, dto_1.UpdateCompanyDto]),
    __metadata("design:returntype", Promise)
], OrganizationController.prototype, "updateCompany", null);
__decorate([
    (0, common_1.Delete)('companies/:id'),
    (0, roles_decorator_1.Roles)('Super User', 'Admin'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], OrganizationController.prototype, "deleteCompany", null);
__decorate([
    (0, common_1.Post)('companies/:companyId/regions'),
    (0, roles_decorator_1.Roles)('Super User', 'Admin', 'HR'),
    __param(0, (0, common_1.Param)('companyId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, dto_1.CreateRegionDto]),
    __metadata("design:returntype", Promise)
], OrganizationController.prototype, "createRegion", null);
__decorate([
    (0, common_1.Get)('regions/:id'),
    (0, roles_decorator_1.Roles)('Super User', 'Admin', 'HR', 'Manager'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], OrganizationController.prototype, "findRegion", null);
__decorate([
    (0, common_1.Put)('regions/:id'),
    (0, roles_decorator_1.Roles)('Super User', 'Admin', 'HR'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, dto_1.UpdateRegionDto]),
    __metadata("design:returntype", Promise)
], OrganizationController.prototype, "updateRegion", null);
__decorate([
    (0, common_1.Delete)('regions/:id'),
    (0, roles_decorator_1.Roles)('Super User', 'Admin', 'HR'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], OrganizationController.prototype, "deleteRegion", null);
__decorate([
    (0, common_1.Post)('regions/:regionId/sites'),
    (0, roles_decorator_1.Roles)('Super User', 'Admin', 'HR'),
    __param(0, (0, common_1.Param)('regionId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, dto_1.CreateSiteDto]),
    __metadata("design:returntype", Promise)
], OrganizationController.prototype, "createSite", null);
__decorate([
    (0, common_1.Get)('sites/:id'),
    (0, roles_decorator_1.Roles)('Super User', 'Admin', 'HR', 'Manager'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], OrganizationController.prototype, "findSite", null);
__decorate([
    (0, common_1.Put)('sites/:id'),
    (0, roles_decorator_1.Roles)('Super User', 'Admin', 'HR'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, dto_1.UpdateSiteDto]),
    __metadata("design:returntype", Promise)
], OrganizationController.prototype, "updateSite", null);
__decorate([
    (0, common_1.Delete)('sites/:id'),
    (0, roles_decorator_1.Roles)('Super User', 'Admin', 'HR'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], OrganizationController.prototype, "deleteSite", null);
__decorate([
    (0, common_1.Post)('sites/:siteId/departments'),
    (0, roles_decorator_1.Roles)('Super User', 'Admin', 'HR'),
    __param(0, (0, common_1.Param)('siteId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, dto_1.CreateDepartmentDto]),
    __metadata("design:returntype", Promise)
], OrganizationController.prototype, "createDepartment", null);
__decorate([
    (0, common_1.Get)('departments'),
    (0, roles_decorator_1.Roles)('Super User', 'Admin', 'HR', 'Manager'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], OrganizationController.prototype, "findAllDepartments", null);
__decorate([
    (0, common_1.Get)('departments/:id'),
    (0, roles_decorator_1.Roles)('Super User', 'Admin', 'HR', 'Manager'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], OrganizationController.prototype, "findDepartment", null);
__decorate([
    (0, common_1.Put)('departments/:id'),
    (0, roles_decorator_1.Roles)('Super User', 'Admin', 'HR'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, dto_1.UpdateDepartmentDto]),
    __metadata("design:returntype", Promise)
], OrganizationController.prototype, "updateDepartment", null);
__decorate([
    (0, common_1.Delete)('departments/:id'),
    (0, roles_decorator_1.Roles)('Super User', 'Admin', 'HR'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], OrganizationController.prototype, "deleteDepartment", null);
__decorate([
    (0, common_1.Post)('departments/assign-employee'),
    (0, roles_decorator_1.Roles)('Super User', 'Admin', 'HR'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.AssignEmployeeDto]),
    __metadata("design:returntype", Promise)
], OrganizationController.prototype, "assignEmployee", null);
__decorate([
    (0, common_1.Get)('hierarchy/:companyId'),
    (0, roles_decorator_1.Roles)('Super User', 'Admin', 'HR', 'Manager'),
    __param(0, (0, common_1.Param)('companyId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], OrganizationController.prototype, "getHierarchy", null);
__decorate([
    (0, common_1.Get)('search'),
    (0, roles_decorator_1.Roles)('Super User', 'Admin', 'HR', 'Manager'),
    __param(0, (0, common_1.Query)('q')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrganizationController.prototype, "searchOrganization", null);
exports.OrganizationController = OrganizationController = __decorate([
    (0, common_1.Controller)('organization'),
    (0, common_1.UseGuards)(authenticated_guard_1.AuthenticatedGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [organization_service_1.OrganizationService])
], OrganizationController);
//# sourceMappingURL=organization.controller.js.map