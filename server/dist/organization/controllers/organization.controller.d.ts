import { OrganizationService } from '../services/organization.service';
import { CreateCompanyDto, UpdateCompanyDto, CreateRegionDto, UpdateRegionDto, CreateSiteDto, UpdateSiteDto, CreateDepartmentDto, UpdateDepartmentDto, AssignEmployeeDto } from '../dto';
export declare class OrganizationController {
    private readonly organizationService;
    constructor(organizationService: OrganizationService);
    getDashboard(): Promise<{
        success: boolean;
        stats: {
            total_companies: number;
            total_regions: number;
            total_sites: number;
            total_departments: number;
            total_employees: number;
        };
        company_details: {
            company: import("../../entities/company.entity").Company;
            regions: number;
            sites: number;
            departments: number;
            employees: number;
        }[];
    }>;
    findAllCompanies(): Promise<{
        success: boolean;
        companies: {
            _stats: {
                regions: number;
                sites: number;
                departments: number;
                employees: number;
            };
            id: number;
            name: string;
            code: string;
            legalName?: string;
            registrationNumber?: string;
            taxNumber?: string;
            email?: string;
            phone?: string;
            website?: string;
            addressLine1?: string;
            addressLine2?: string;
            city?: string;
            stateProvince?: string;
            postalCode?: string;
            country?: string;
            timezone?: string;
            currency?: string;
            fiscalYearStart?: number;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            regions: import("../../entities/region.entity").Region[];
        }[];
    }>;
    findCompany(id: number): Promise<{
        success: boolean;
        company: import("../../entities/company.entity").Company;
        regions: import("../../entities/region.entity").Region[];
        stats: {
            regions: number;
            sites: number;
            departments: number;
            employees: number;
        };
    }>;
    createCompany(dto: CreateCompanyDto): Promise<{
        success: boolean;
        company: import("../../entities/company.entity").Company;
    }>;
    updateCompany(id: number, dto: UpdateCompanyDto): Promise<{
        success: boolean;
        company: import("../../entities/company.entity").Company;
    }>;
    deleteCompany(id: number): Promise<{
        success: boolean;
        message: string;
        company: import("../../entities/company.entity").Company;
    }>;
    createRegion(companyId: number, dto: CreateRegionDto): Promise<{
        success: boolean;
        region: import("../../entities/region.entity").Region;
    }>;
    findRegion(id: number): Promise<{
        success: boolean;
        region: import("../../entities/region.entity").Region;
        stats: {
            sites: number;
            departments: number;
            employees: number;
        };
    }>;
    updateRegion(id: number, dto: UpdateRegionDto): Promise<{
        success: boolean;
        region: import("../../entities/region.entity").Region;
    }>;
    deleteRegion(id: number): Promise<{
        success: boolean;
        message: string;
        region: import("../../entities/region.entity").Region;
    }>;
    createSite(regionId: number, dto: CreateSiteDto): Promise<{
        success: boolean;
        site: import("../../entities/site.entity").Site;
    }>;
    findSite(id: number): Promise<{
        success: boolean;
        site: import("../../entities/site.entity").Site;
        department_details: {
            department: import("../../entities/department.entity").Department;
            employee_count: number;
        }[];
        stats: {
            departments: number;
            employees: number;
        };
    }>;
    updateSite(id: number, dto: UpdateSiteDto): Promise<{
        success: boolean;
        site: import("../../entities/site.entity").Site;
    }>;
    deleteSite(id: number): Promise<{
        success: boolean;
        message: string;
        site: import("../../entities/site.entity").Site;
    }>;
    createDepartment(siteId: number, dto: CreateDepartmentDto): Promise<{
        success: boolean;
        department: import("../../entities/department.entity").Department;
    }>;
    findAllDepartments(): Promise<{
        success: boolean;
        departments: import("../../entities/department.entity").Department[];
    }>;
    findDepartment(id: number): Promise<{
        success: boolean;
        department: import("../../entities/department.entity").Department;
        employees: import("../../entities/user.entity").User[];
        stats: {
            total_employees: number;
            active_employees: number;
            inactive_employees: number;
            full_time: number;
            part_time: number;
            contractors: number;
        };
    }>;
    updateDepartment(id: number, dto: UpdateDepartmentDto): Promise<{
        success: boolean;
        department: import("../../entities/department.entity").Department;
    }>;
    deleteDepartment(id: number): Promise<{
        success: boolean;
        message: string;
        department: import("../../entities/department.entity").Department;
    }>;
    assignEmployee(dto: AssignEmployeeDto): Promise<{
        success: boolean;
        message: string;
        employee: import("../../entities/user.entity").User;
    }>;
    getHierarchy(companyId: number): Promise<{
        success: boolean;
        hierarchy: {
            company: {
                id: number;
                name: string;
                code: string;
            };
            regions: {
                id: number;
                name: string;
                code: string;
                sites: {
                    id: number;
                    name: string;
                    code: string;
                    departments: {
                        id: number;
                        name: string;
                        code: string;
                        employee_count: number;
                    }[];
                }[];
            }[];
        };
    }>;
    searchOrganization(query: string): Promise<{
        success: boolean;
        results: {
            type: string;
            id: number;
            name: string;
            code: string;
        }[];
    }>;
}
