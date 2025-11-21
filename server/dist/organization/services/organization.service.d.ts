import { Repository } from 'typeorm';
import { Company } from '../../entities/company.entity';
import { Department } from '../../entities/department.entity';
import { Region } from '../../entities/region.entity';
import { Site } from '../../entities/site.entity';
import { User } from '../../entities/user.entity';
import { CreateCompanyDto, UpdateCompanyDto, CreateRegionDto, UpdateRegionDto, CreateSiteDto, UpdateSiteDto, CreateDepartmentDto, UpdateDepartmentDto, AssignEmployeeDto } from '../dto';
export declare class OrganizationService {
    private companyRepo;
    private departmentRepo;
    private regionRepo;
    private siteRepo;
    private userRepo;
    constructor(companyRepo: Repository<Company>, departmentRepo: Repository<Department>, regionRepo: Repository<Region>, siteRepo: Repository<Site>, userRepo: Repository<User>);
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
            company: Company;
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
            regions: Region[];
        }[];
    }>;
    findCompany(id: number): Promise<{
        success: boolean;
        company: Company;
        regions: Region[];
        stats: {
            regions: number;
            sites: number;
            departments: number;
            employees: number;
        };
    }>;
    createCompany(dto: CreateCompanyDto): Promise<{
        success: boolean;
        company: Company;
    }>;
    updateCompany(id: number, dto: UpdateCompanyDto): Promise<{
        success: boolean;
        company: Company;
    }>;
    deleteCompany(id: number): Promise<{
        success: boolean;
        message: string;
        company: Company;
    }>;
    createRegion(companyId: number, dto: CreateRegionDto): Promise<{
        success: boolean;
        region: Region;
    }>;
    findRegion(id: number): Promise<{
        success: boolean;
        region: Region;
        stats: {
            sites: number;
            departments: number;
            employees: number;
        };
    }>;
    updateRegion(id: number, dto: UpdateRegionDto): Promise<{
        success: boolean;
        region: Region;
    }>;
    deleteRegion(id: number): Promise<{
        success: boolean;
        message: string;
        region: Region;
    }>;
    createSite(regionId: number, dto: CreateSiteDto): Promise<{
        success: boolean;
        site: Site;
    }>;
    findSite(id: number): Promise<{
        success: boolean;
        site: Site;
        department_details: {
            department: Department;
            employee_count: number;
        }[];
        stats: {
            departments: number;
            employees: number;
        };
    }>;
    updateSite(id: number, dto: UpdateSiteDto): Promise<{
        success: boolean;
        site: Site;
    }>;
    deleteSite(id: number): Promise<{
        success: boolean;
        message: string;
        site: Site;
    }>;
    createDepartment(siteId: number, dto: CreateDepartmentDto): Promise<{
        success: boolean;
        department: Department;
    }>;
    findDepartment(id: number): Promise<{
        success: boolean;
        department: Department;
        employees: User[];
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
        department: Department;
    }>;
    deleteDepartment(id: number): Promise<{
        success: boolean;
        message: string;
        department: Department;
    }>;
    assignEmployee(dto: AssignEmployeeDto): Promise<{
        success: boolean;
        message: string;
        employee: User;
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
    findAllDepartments(): Promise<{
        success: boolean;
        departments: Department[];
    }>;
}
