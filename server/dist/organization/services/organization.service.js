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
exports.OrganizationService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const company_entity_1 = require("../../entities/company.entity");
const department_entity_1 = require("../../entities/department.entity");
const region_entity_1 = require("../../entities/region.entity");
const site_entity_1 = require("../../entities/site.entity");
const user_entity_1 = require("../../entities/user.entity");
let OrganizationService = class OrganizationService {
    companyRepo;
    departmentRepo;
    regionRepo;
    siteRepo;
    userRepo;
    constructor(companyRepo, departmentRepo, regionRepo, siteRepo, userRepo) {
        this.companyRepo = companyRepo;
        this.departmentRepo = departmentRepo;
        this.regionRepo = regionRepo;
        this.siteRepo = siteRepo;
        this.userRepo = userRepo;
    }
    async getDashboard() {
        const [companies, regions, sites, departments, employees] = await Promise.all([
            this.companyRepo.count({ where: { isActive: true } }),
            this.regionRepo.count({ where: { isActive: true } }),
            this.siteRepo.count({ where: { isActive: true } }),
            this.departmentRepo.count({ where: { isActive: true } }),
            this.userRepo.count({ where: { isActive: true } }),
        ]);
        const companiesList = await this.companyRepo.find({
            where: { isActive: true },
            relations: ['regions'],
        });
        const companyDetails = await Promise.all(companiesList.map(async (company) => {
            const activeRegions = company.regions?.filter(r => r.isActive) || [];
            const [sitesCount, departmentsCount, employeesCount] = await Promise.all([
                this.siteRepo.createQueryBuilder('site')
                    .innerJoin('site.region', 'region')
                    .where('region.companyId = :companyId', { companyId: company.id })
                    .andWhere('site.isActive = :isActive', { isActive: true })
                    .getCount(),
                this.departmentRepo.createQueryBuilder('dept')
                    .innerJoin('dept.site', 'site')
                    .innerJoin('site.region', 'region')
                    .where('region.companyId = :companyId', { companyId: company.id })
                    .andWhere('dept.isActive = :isActive', { isActive: true })
                    .getCount(),
                this.userRepo.createQueryBuilder('user')
                    .innerJoin('user.department', 'dept')
                    .innerJoin('dept.site', 'site')
                    .innerJoin('site.region', 'region')
                    .where('region.companyId = :companyId', { companyId: company.id })
                    .andWhere('user.isActive = :isActive', { isActive: true })
                    .getCount(),
            ]);
            return {
                company,
                regions: activeRegions.length,
                sites: sitesCount,
                departments: departmentsCount,
                employees: employeesCount,
            };
        }));
        return {
            success: true,
            stats: {
                total_companies: companies,
                total_regions: regions,
                total_sites: sites,
                total_departments: departments,
                total_employees: employees,
            },
            company_details: companyDetails,
        };
    }
    async findAllCompanies() {
        const companies = await this.companyRepo.find({
            relations: ['regions'],
        });
        const companiesWithStats = await Promise.all(companies.map(async (company) => {
            const activeRegions = company.regions?.filter(r => r.isActive) || [];
            const [sitesCount, departmentsCount, employeesCount] = await Promise.all([
                this.siteRepo.createQueryBuilder('site')
                    .innerJoin('site.region', 'region')
                    .where('region.companyId = :companyId', { companyId: company.id })
                    .andWhere('site.isActive = :isActive', { isActive: true })
                    .getCount(),
                this.departmentRepo.createQueryBuilder('dept')
                    .innerJoin('dept.site', 'site')
                    .innerJoin('site.region', 'region')
                    .where('region.companyId = :companyId', { companyId: company.id })
                    .andWhere('dept.isActive = :isActive', { isActive: true })
                    .getCount(),
                this.userRepo.createQueryBuilder('user')
                    .innerJoin('user.department', 'dept')
                    .innerJoin('dept.site', 'site')
                    .innerJoin('site.region', 'region')
                    .where('region.companyId = :companyId', { companyId: company.id })
                    .andWhere('user.isActive = :isActive', { isActive: true })
                    .getCount(),
            ]);
            return {
                ...company,
                _stats: {
                    regions: activeRegions.length,
                    sites: sitesCount,
                    departments: departmentsCount,
                    employees: employeesCount,
                },
            };
        }));
        return { success: true, companies: companiesWithStats };
    }
    async findCompany(id) {
        const company = await this.companyRepo.findOne({
            where: { id },
            relations: ['regions'],
        });
        if (!company) {
            throw new common_1.NotFoundException(`Company with ID ${id} not found`);
        }
        const activeRegions = company.regions?.filter(r => r.isActive) || [];
        const [sitesCount, departmentsCount, employeesCount] = await Promise.all([
            this.siteRepo.createQueryBuilder('site')
                .innerJoin('site.region', 'region')
                .where('region.companyId = :companyId', { companyId: id })
                .andWhere('site.isActive = :isActive', { isActive: true })
                .getCount(),
            this.departmentRepo.createQueryBuilder('dept')
                .innerJoin('dept.site', 'site')
                .innerJoin('site.region', 'region')
                .where('region.companyId = :companyId', { companyId: id })
                .andWhere('dept.isActive = :isActive', { isActive: true })
                .getCount(),
            this.userRepo.createQueryBuilder('user')
                .innerJoin('user.department', 'dept')
                .innerJoin('dept.site', 'site')
                .innerJoin('site.region', 'region')
                .where('region.companyId = :companyId', { companyId: id })
                .andWhere('user.isActive = :isActive', { isActive: true })
                .getCount(),
        ]);
        return {
            success: true,
            company,
            regions: activeRegions,
            stats: {
                regions: activeRegions.length,
                sites: sitesCount,
                departments: departmentsCount,
                employees: employeesCount,
            },
        };
    }
    async createCompany(dto) {
        const existingCompany = await this.companyRepo.findOne({
            where: { code: dto.code },
        });
        if (existingCompany) {
            throw new common_1.ConflictException(`Company with code ${dto.code} already exists`);
        }
        const company = this.companyRepo.create({
            name: dto.name,
            code: dto.code,
            legalName: dto.legal_name,
            registrationNumber: dto.registration_number,
            taxNumber: dto.tax_number,
            email: dto.email,
            phone: dto.phone,
            website: dto.website,
            addressLine1: dto.address_line1,
            addressLine2: dto.address_line2,
            city: dto.city,
            stateProvince: dto.state_province,
            postalCode: dto.postal_code,
            country: dto.country || 'South Africa',
            timezone: dto.timezone || 'Africa/Johannesburg',
            currency: dto.currency || 'ZAR',
            fiscalYearStart: dto.fiscal_year_start || 4,
            isActive: true,
        });
        const saved = await this.companyRepo.save(company);
        return { success: true, company: saved };
    }
    async updateCompany(id, dto) {
        const existingCompany = await this.companyRepo.findOne({
            where: { id },
        });
        if (!existingCompany) {
            throw new common_1.NotFoundException(`Company with ID ${id} not found`);
        }
        if (dto.name !== undefined)
            existingCompany.name = dto.name;
        if (dto.code !== undefined)
            existingCompany.code = dto.code;
        if (dto.legal_name !== undefined)
            existingCompany.legalName = dto.legal_name;
        if (dto.registration_number !== undefined)
            existingCompany.registrationNumber = dto.registration_number;
        if (dto.tax_number !== undefined)
            existingCompany.taxNumber = dto.tax_number;
        if (dto.email !== undefined)
            existingCompany.email = dto.email;
        if (dto.phone !== undefined)
            existingCompany.phone = dto.phone;
        if (dto.website !== undefined)
            existingCompany.website = dto.website;
        if (dto.address_line1 !== undefined)
            existingCompany.addressLine1 = dto.address_line1;
        if (dto.address_line2 !== undefined)
            existingCompany.addressLine2 = dto.address_line2;
        if (dto.city !== undefined)
            existingCompany.city = dto.city;
        if (dto.state_province !== undefined)
            existingCompany.stateProvince = dto.state_province;
        if (dto.postal_code !== undefined)
            existingCompany.postalCode = dto.postal_code;
        if (dto.country !== undefined)
            existingCompany.country = dto.country;
        if (dto.timezone !== undefined)
            existingCompany.timezone = dto.timezone;
        if (dto.currency !== undefined)
            existingCompany.currency = dto.currency;
        if (dto.fiscal_year_start !== undefined)
            existingCompany.fiscalYearStart = dto.fiscal_year_start;
        if (dto.is_active !== undefined)
            existingCompany.isActive = dto.is_active;
        const updated = await this.companyRepo.save(existingCompany);
        return { success: true, company: updated };
    }
    async deleteCompany(id) {
        const company = await this.companyRepo.findOne({
            where: { id },
        });
        if (!company) {
            throw new common_1.NotFoundException(`Company with ID ${id} not found`);
        }
        const [regionsCount, sitesCount, departmentsCount, employeesCount] = await Promise.all([
            this.regionRepo.count({ where: { companyId: id, isActive: true } }),
            this.siteRepo.createQueryBuilder('site')
                .innerJoin('site.region', 'region')
                .where('region.companyId = :companyId', { companyId: id })
                .andWhere('site.isActive = :isActive', { isActive: true })
                .getCount(),
            this.departmentRepo.createQueryBuilder('dept')
                .innerJoin('dept.site', 'site')
                .innerJoin('site.region', 'region')
                .where('region.companyId = :companyId', { companyId: id })
                .andWhere('dept.isActive = :isActive', { isActive: true })
                .getCount(),
            this.userRepo.createQueryBuilder('user')
                .innerJoin('user.department', 'dept')
                .innerJoin('dept.site', 'site')
                .innerJoin('site.region', 'region')
                .where('region.companyId = :companyId', { companyId: id })
                .andWhere('user.isActive = :isActive', { isActive: true })
                .getCount(),
        ]);
        if (regionsCount > 0 || sitesCount > 0 || departmentsCount > 0 || employeesCount > 0) {
            throw new common_1.BadRequestException(`Cannot delete company: ${regionsCount} active regions, ${sitesCount} active sites, ${departmentsCount} active departments, ${employeesCount} active employees exist in hierarchy. Please deactivate all descendants first.`);
        }
        company.isActive = false;
        const deleted = await this.companyRepo.save(company);
        return { success: true, message: 'Company deleted successfully', company: deleted };
    }
    async createRegion(companyId, dto) {
        const company = await this.companyRepo.findOne({
            where: { id: companyId },
        });
        if (!company) {
            throw new common_1.NotFoundException(`Company with ID ${companyId} not found`);
        }
        const existingRegion = await this.regionRepo.findOne({
            where: { companyId, code: dto.code },
        });
        if (existingRegion) {
            throw new common_1.ConflictException(`Region with code ${dto.code} already exists for this company`);
        }
        const region = this.regionRepo.create({
            companyId,
            name: dto.name,
            code: dto.code,
            description: dto.description,
            managerName: dto.manager_name,
            email: dto.email,
            phone: dto.phone,
            addressLine1: dto.address_line1,
            addressLine2: dto.address_line2,
            city: dto.city,
            stateProvince: dto.state_province,
            postalCode: dto.postal_code,
            timezone: dto.timezone,
            isActive: true,
        });
        const saved = await this.regionRepo.save(region);
        return { success: true, region: saved };
    }
    async findRegion(id) {
        const region = await this.regionRepo.findOne({
            where: { id },
            relations: ['company', 'sites'],
        });
        if (!region) {
            throw new common_1.NotFoundException(`Region with ID ${id} not found`);
        }
        const activeSites = region.sites?.filter(s => s.isActive) || [];
        const [departmentsCount, employeesCount] = await Promise.all([
            this.departmentRepo.createQueryBuilder('dept')
                .innerJoin('dept.site', 'site')
                .where('site.regionId = :regionId', { regionId: id })
                .andWhere('dept.isActive = :isActive', { isActive: true })
                .getCount(),
            this.userRepo.createQueryBuilder('user')
                .innerJoin('user.department', 'dept')
                .innerJoin('dept.site', 'site')
                .where('site.regionId = :regionId', { regionId: id })
                .andWhere('user.isActive = :isActive', { isActive: true })
                .getCount(),
        ]);
        return {
            success: true,
            region,
            stats: {
                sites: activeSites.length,
                departments: departmentsCount,
                employees: employeesCount,
            },
        };
    }
    async updateRegion(id, dto) {
        const region = await this.regionRepo.findOne({ where: { id } });
        if (!region) {
            throw new common_1.NotFoundException(`Region with ID ${id} not found`);
        }
        if (dto.code && dto.code !== region.code) {
            const duplicate = await this.regionRepo.findOne({
                where: {
                    companyId: region.companyId,
                    code: dto.code,
                    id: (0, typeorm_2.Not)(id),
                },
            });
            if (duplicate) {
                throw new common_1.ConflictException(`Region with code ${dto.code} already exists for this company`);
            }
        }
        if (dto.name !== undefined)
            region.name = dto.name;
        if (dto.code !== undefined)
            region.code = dto.code;
        if (dto.description !== undefined)
            region.description = dto.description;
        if (dto.manager_name !== undefined)
            region.managerName = dto.manager_name;
        if (dto.email !== undefined)
            region.email = dto.email;
        if (dto.phone !== undefined)
            region.phone = dto.phone;
        if (dto.address_line1 !== undefined)
            region.addressLine1 = dto.address_line1;
        if (dto.address_line2 !== undefined)
            region.addressLine2 = dto.address_line2;
        if (dto.city !== undefined)
            region.city = dto.city;
        if (dto.state_province !== undefined)
            region.stateProvince = dto.state_province;
        if (dto.postal_code !== undefined)
            region.postalCode = dto.postal_code;
        if (dto.timezone !== undefined)
            region.timezone = dto.timezone;
        if (dto.is_active !== undefined)
            region.isActive = dto.is_active;
        const updated = await this.regionRepo.save(region);
        return { success: true, region: updated };
    }
    async deleteRegion(id) {
        const region = await this.regionRepo.findOne({
            where: { id },
            relations: ['sites'],
        });
        if (!region) {
            throw new common_1.NotFoundException(`Region with ID ${id} not found`);
        }
        const activeSites = region.sites?.filter(s => s.isActive) || [];
        if (activeSites.length > 0) {
            throw new common_1.BadRequestException(`Cannot delete region: ${activeSites.length} active sites still exist. Please deactivate or move sites first.`);
        }
        region.isActive = false;
        const deleted = await this.regionRepo.save(region);
        return { success: true, message: 'Region deleted successfully', region: deleted };
    }
    async createSite(regionId, dto) {
        const region = await this.regionRepo.findOne({
            where: { id: regionId },
        });
        if (!region) {
            throw new common_1.NotFoundException(`Region with ID ${regionId} not found`);
        }
        const site = this.siteRepo.create({
            regionId,
            name: dto.name,
            code: dto.code,
            siteType: dto.site_type,
            description: dto.description,
            managerName: dto.manager_name,
            email: dto.email,
            phone: dto.phone,
            addressLine1: dto.address_line1,
            addressLine2: dto.address_line2,
            city: dto.city,
            stateProvince: dto.state_province,
            postalCode: dto.postal_code,
            latitude: dto.latitude,
            longitude: dto.longitude,
            geoFenceRadius: dto.geo_fence_radius || 100,
            operatingHoursStart: dto.operating_hours_start ? new Date(`1970-01-01T${dto.operating_hours_start}`) : undefined,
            operatingHoursEnd: dto.operating_hours_end ? new Date(`1970-01-01T${dto.operating_hours_end}`) : undefined,
            timezone: dto.timezone,
            allowRemoteWork: dto.allow_remote_work || false,
            isActive: true,
        });
        const saved = await this.siteRepo.save(site);
        return { success: true, site: saved };
    }
    async findSite(id) {
        const site = await this.siteRepo.findOne({
            where: { id },
            relations: ['region', 'region.company', 'departments'],
        });
        if (!site) {
            throw new common_1.NotFoundException(`Site with ID ${id} not found`);
        }
        const activeDepartments = site.departments?.filter(d => d.isActive) || [];
        const departmentDetails = await Promise.all(activeDepartments.map(async (dept) => {
            const employeeCount = await this.userRepo.count({
                where: { departmentId: dept.id, isActive: true },
            });
            return {
                department: dept,
                employee_count: employeeCount,
            };
        }));
        const totalEmployees = departmentDetails.reduce((sum, d) => sum + d.employee_count, 0);
        return {
            success: true,
            site,
            department_details: departmentDetails,
            stats: {
                departments: activeDepartments.length,
                employees: totalEmployees,
            },
        };
    }
    async updateSite(id, dto) {
        const site = await this.siteRepo.findOne({ where: { id } });
        if (!site) {
            throw new common_1.NotFoundException(`Site with ID ${id} not found`);
        }
        if (dto.name !== undefined)
            site.name = dto.name;
        if (dto.code !== undefined)
            site.code = dto.code;
        if (dto.site_type !== undefined)
            site.siteType = dto.site_type;
        if (dto.description !== undefined)
            site.description = dto.description;
        if (dto.manager_name !== undefined)
            site.managerName = dto.manager_name;
        if (dto.email !== undefined)
            site.email = dto.email;
        if (dto.phone !== undefined)
            site.phone = dto.phone;
        if (dto.address_line1 !== undefined)
            site.addressLine1 = dto.address_line1;
        if (dto.address_line2 !== undefined)
            site.addressLine2 = dto.address_line2;
        if (dto.city !== undefined)
            site.city = dto.city;
        if (dto.state_province !== undefined)
            site.stateProvince = dto.state_province;
        if (dto.postal_code !== undefined)
            site.postalCode = dto.postal_code;
        if (dto.latitude !== undefined)
            site.latitude = dto.latitude;
        if (dto.longitude !== undefined)
            site.longitude = dto.longitude;
        if (dto.geo_fence_radius !== undefined)
            site.geoFenceRadius = dto.geo_fence_radius;
        if (dto.operating_hours_start !== undefined)
            site.operatingHoursStart = dto.operating_hours_start ? new Date(`1970-01-01T${dto.operating_hours_start}`) : undefined;
        if (dto.operating_hours_end !== undefined)
            site.operatingHoursEnd = dto.operating_hours_end ? new Date(`1970-01-01T${dto.operating_hours_end}`) : undefined;
        if (dto.timezone !== undefined)
            site.timezone = dto.timezone;
        if (dto.allow_remote_work !== undefined)
            site.allowRemoteWork = dto.allow_remote_work;
        if (dto.is_active !== undefined)
            site.isActive = dto.is_active;
        const updated = await this.siteRepo.save(site);
        return { success: true, site: updated };
    }
    async deleteSite(id) {
        const site = await this.siteRepo.findOne({ where: { id } });
        if (!site) {
            throw new common_1.NotFoundException(`Site with ID ${id} not found`);
        }
        const [departmentsCount, employeesCount] = await Promise.all([
            this.departmentRepo.count({ where: { siteId: id, isActive: true } }),
            this.userRepo.createQueryBuilder('user')
                .innerJoin('user.department', 'dept')
                .where('dept.siteId = :siteId', { siteId: id })
                .andWhere('user.isActive = :isActive', { isActive: true })
                .getCount(),
        ]);
        if (departmentsCount > 0 || employeesCount > 0) {
            throw new common_1.BadRequestException(`Cannot delete site: ${departmentsCount} active departments and ${employeesCount} active employees exist. Please deactivate or reassign all descendants first.`);
        }
        site.isActive = false;
        const deleted = await this.siteRepo.save(site);
        return { success: true, message: 'Site deleted successfully', site: deleted };
    }
    async createDepartment(siteId, dto) {
        const site = await this.siteRepo.findOne({
            where: { id: siteId },
        });
        if (!site) {
            throw new common_1.NotFoundException(`Site with ID ${siteId} not found`);
        }
        if (dto.manager_id) {
            const manager = await this.userRepo.findOne({
                where: { id: dto.manager_id },
            });
            if (!manager) {
                throw new common_1.BadRequestException(`Manager with ID ${dto.manager_id} not found`);
            }
        }
        if (dto.deputy_manager_id) {
            const deputyManager = await this.userRepo.findOne({
                where: { id: dto.deputy_manager_id },
            });
            if (!deputyManager) {
                throw new common_1.BadRequestException(`Deputy manager with ID ${dto.deputy_manager_id} not found`);
            }
        }
        const department = this.departmentRepo.create({
            siteId,
            name: dto.name,
            code: dto.code,
            description: dto.description,
            costCenter: dto.cost_center,
            budgetCode: dto.budget_code,
            managerId: dto.manager_id,
            deputyManagerId: dto.deputy_manager_id,
            email: dto.email,
            phone: dto.phone,
            extension: dto.extension,
            standardHoursPerDay: dto.standard_hours_per_day || 8.0,
            standardHoursPerWeek: dto.standard_hours_per_week || 40.0,
            isActive: true,
        });
        const saved = await this.departmentRepo.save(department);
        return { success: true, department: saved };
    }
    async findDepartment(id) {
        const department = await this.departmentRepo.findOne({
            where: { id },
            relations: ['site', 'site.region', 'site.region.company', 'manager', 'deputyManager'],
        });
        if (!department) {
            throw new common_1.NotFoundException(`Department with ID ${id} not found`);
        }
        const allEmployees = await this.userRepo.find({
            where: { departmentId: id },
        });
        const activeEmployees = allEmployees.filter(e => e.isActive);
        const stats = {
            total_employees: allEmployees.length,
            active_employees: activeEmployees.length,
            inactive_employees: allEmployees.filter(e => !e.isActive).length,
            full_time: allEmployees.filter(e => e.employmentType === 'full_time').length,
            part_time: allEmployees.filter(e => e.employmentType === 'part_time').length,
            contractors: allEmployees.filter(e => e.employmentType === 'contract').length,
        };
        return {
            success: true,
            department,
            employees: activeEmployees,
            stats,
        };
    }
    async updateDepartment(id, dto) {
        const department = await this.departmentRepo.findOne({ where: { id } });
        if (!department) {
            throw new common_1.NotFoundException(`Department with ID ${id} not found`);
        }
        if (dto.manager_id) {
            const manager = await this.userRepo.findOne({ where: { id: dto.manager_id } });
            if (!manager) {
                throw new common_1.BadRequestException(`Manager with ID ${dto.manager_id} not found`);
            }
        }
        if (dto.deputy_manager_id) {
            const deputyManager = await this.userRepo.findOne({ where: { id: dto.deputy_manager_id } });
            if (!deputyManager) {
                throw new common_1.BadRequestException(`Deputy manager with ID ${dto.deputy_manager_id} not found`);
            }
        }
        if (dto.name !== undefined)
            department.name = dto.name;
        if (dto.code !== undefined)
            department.code = dto.code;
        if (dto.description !== undefined)
            department.description = dto.description;
        if (dto.cost_center !== undefined)
            department.costCenter = dto.cost_center;
        if (dto.budget_code !== undefined)
            department.budgetCode = dto.budget_code;
        if (dto.manager_id !== undefined)
            department.managerId = dto.manager_id;
        if (dto.deputy_manager_id !== undefined)
            department.deputyManagerId = dto.deputy_manager_id;
        if (dto.email !== undefined)
            department.email = dto.email;
        if (dto.phone !== undefined)
            department.phone = dto.phone;
        if (dto.extension !== undefined)
            department.extension = dto.extension;
        if (dto.standard_hours_per_day !== undefined)
            department.standardHoursPerDay = dto.standard_hours_per_day;
        if (dto.standard_hours_per_week !== undefined)
            department.standardHoursPerWeek = dto.standard_hours_per_week;
        if (dto.is_active !== undefined)
            department.isActive = dto.is_active;
        const updated = await this.departmentRepo.save(department);
        return { success: true, department: updated };
    }
    async deleteDepartment(id) {
        const department = await this.departmentRepo.findOne({ where: { id } });
        if (!department) {
            throw new common_1.NotFoundException(`Department with ID ${id} not found`);
        }
        const employeeCount = await this.userRepo.count({
            where: { departmentId: id },
        });
        if (employeeCount > 0) {
            throw new common_1.BadRequestException(`Cannot delete department: ${employeeCount} employees (active and inactive) still assigned. Please reassign all employees first.`);
        }
        department.isActive = false;
        const deleted = await this.departmentRepo.save(department);
        return { success: true, message: 'Department deleted successfully', department: deleted };
    }
    async assignEmployee(dto) {
        const [employee, department] = await Promise.all([
            this.userRepo.findOne({ where: { id: dto.employee_id } }),
            this.departmentRepo.findOne({ where: { id: dto.department_id } }),
        ]);
        if (!employee) {
            throw new common_1.NotFoundException(`Employee with ID ${dto.employee_id} not found`);
        }
        if (!department) {
            throw new common_1.NotFoundException(`Department with ID ${dto.department_id} not found`);
        }
        const oldDepartment = employee.departmentId
            ? await this.departmentRepo.findOne({ where: { id: employee.departmentId } })
            : null;
        employee.departmentId = dto.department_id;
        const updated = await this.userRepo.save(employee);
        const employeeName = employee.firstName && employee.lastName
            ? `${employee.firstName} ${employee.lastName}`
            : employee.username;
        return {
            success: true,
            message: `Successfully assigned ${employeeName} from ${oldDepartment?.name || 'Unassigned'} to ${department.name}`,
            employee: updated,
        };
    }
    async getHierarchy(companyId) {
        const company = await this.companyRepo.findOne({
            where: { id: companyId },
            relations: ['regions', 'regions.sites', 'regions.sites.departments'],
        });
        if (!company) {
            throw new common_1.NotFoundException(`Company with ID ${companyId} not found`);
        }
        const activeRegions = company.regions?.filter(r => r.isActive) || [];
        const hierarchy = {
            company: {
                id: company.id,
                name: company.name,
                code: company.code,
            },
            regions: await Promise.all(activeRegions.map(async (region) => {
                const activeSites = region.sites?.filter(s => s.isActive) || [];
                return {
                    id: region.id,
                    name: region.name,
                    code: region.code,
                    sites: await Promise.all(activeSites.map(async (site) => {
                        const activeDepartments = site.departments?.filter(d => d.isActive) || [];
                        return {
                            id: site.id,
                            name: site.name,
                            code: site.code,
                            departments: await Promise.all(activeDepartments.map(async (dept) => {
                                const employeeCount = await this.userRepo.count({
                                    where: { departmentId: dept.id, isActive: true },
                                });
                                return {
                                    id: dept.id,
                                    name: dept.name,
                                    code: dept.code,
                                    employee_count: employeeCount,
                                };
                            })),
                        };
                    })),
                };
            })),
        };
        return { success: true, hierarchy };
    }
    async searchOrganization(query) {
        if (query.length < 2) {
            return { success: true, results: [] };
        }
        const [companies, regions, sites, departments] = await Promise.all([
            this.companyRepo.find({
                where: {
                    name: (0, typeorm_2.ILike)(`%${query}%`),
                    isActive: true,
                },
                take: 5,
            }),
            this.regionRepo.find({
                where: {
                    name: (0, typeorm_2.ILike)(`%${query}%`),
                    isActive: true,
                },
                relations: ['company'],
                take: 5,
            }),
            this.siteRepo.find({
                where: {
                    name: (0, typeorm_2.ILike)(`%${query}%`),
                    isActive: true,
                },
                relations: ['region', 'region.company'],
                take: 5,
            }),
            this.departmentRepo.find({
                where: {
                    name: (0, typeorm_2.ILike)(`%${query}%`),
                    isActive: true,
                },
                relations: ['site', 'site.region', 'site.region.company'],
                take: 5,
            }),
        ]);
        const results = [
            ...companies.map(c => ({
                type: 'company',
                id: c.id,
                name: c.name,
                code: c.code,
            })),
            ...regions.map(r => ({
                type: 'region',
                id: r.id,
                name: r.name,
                code: r.code,
                company: r.company?.name,
            })),
            ...sites.map(s => ({
                type: 'site',
                id: s.id,
                name: s.name,
                code: s.code,
                region: s.region?.name,
                company: s.region?.company?.name,
            })),
            ...departments.map(d => ({
                type: 'department',
                id: d.id,
                name: d.name,
                code: d.code,
                site: d.site?.name,
                region: d.site?.region?.name,
                company: d.site?.region?.company?.name,
            })),
        ];
        return { success: true, results };
    }
    async findAllDepartments() {
        const departments = await this.departmentRepo.find({
            where: { isActive: true },
            relations: ['site', 'site.region', 'site.region.company'],
        });
        return { success: true, departments };
    }
};
exports.OrganizationService = OrganizationService;
exports.OrganizationService = OrganizationService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(company_entity_1.Company)),
    __param(1, (0, typeorm_1.InjectRepository)(department_entity_1.Department)),
    __param(2, (0, typeorm_1.InjectRepository)(region_entity_1.Region)),
    __param(3, (0, typeorm_1.InjectRepository)(site_entity_1.Site)),
    __param(4, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], OrganizationService);
//# sourceMappingURL=organization.service.js.map