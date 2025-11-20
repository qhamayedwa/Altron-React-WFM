import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateCompanyDto,
  UpdateCompanyDto,
  CreateRegionDto,
  UpdateRegionDto,
  CreateSiteDto,
  UpdateSiteDto,
  CreateDepartmentDto,
  UpdateDepartmentDto,
  AssignEmployeeDto,
} from '../dto';

@Injectable()
export class OrganizationService {
  constructor(private prisma: PrismaService) {}

  async getDashboard() {
    const [companies, regions, sites, departments, employees] = await Promise.all([
      this.prisma.companies.count({ where: { is_active: true } }),
      this.prisma.regions.count({ where: { is_active: true } }),
      this.prisma.sites.count({ where: { is_active: true } }),
      this.prisma.departments.count({ where: { is_active: true } }),
      this.prisma.users.count({ where: { is_active: true } }),
    ]);

    const companiesList = await this.prisma.companies.findMany({
      where: { is_active: true },
      include: {
        regions: { where: { is_active: true } },
      },
    });

    const companyDetails = await Promise.all(
      companiesList.map(async (company) => {
        const [sitesCount, departmentsCount, employeesCount] = await Promise.all([
          this.prisma.sites.count({
            where: {
              regions: { company_id: company.id },
              is_active: true,
            },
          }),
          this.prisma.departments.count({
            where: {
              sites: { regions: { companies: { id: company.id } } },
              is_active: true,
            },
          }),
          this.prisma.users.count({
            where: {
              departments_users_department_idTodepartments: { 
                sites: { regions: { company_id: company.id } } 
              },
              is_active: true,
            },
          }),
        ]);

        return {
          company,
          regions: company.regions.length,
          sites: sitesCount,
          departments: departmentsCount,
          employees: employeesCount,
        };
      })
    );

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
    const companies = await this.prisma.companies.findMany({
      include: {
        regions: { where: { is_active: true } },
      },
    });

    const companiesWithStats = await Promise.all(
      companies.map(async (company) => {
        const [sitesCount, departmentsCount, employeesCount] = await Promise.all([
          this.prisma.sites.count({
            where: {
              regions: { company_id: company.id },
              is_active: true,
            },
          }),
          this.prisma.departments.count({
            where: {
              sites: { regions: { companies: { id: company.id } } },
              is_active: true,
            },
          }),
          this.prisma.users.count({
            where: {
              departments_users_department_idTodepartments: { 
                sites: { regions: { company_id: company.id } } 
              },
              is_active: true,
            },
          }),
        ]);

        return {
          ...company,
          _stats: {
            regions: company.regions.length,
            sites: sitesCount,
            departments: departmentsCount,
            employees: employeesCount,
          },
        };
      })
    );

    return { success: true, companies: companiesWithStats };
  }

  async findCompany(id: number) {
    const company = await this.prisma.companies.findUnique({
      where: { id },
      include: {
        regions: { where: { is_active: true } },
      },
    });

    if (!company) {
      throw new NotFoundException(`Company with ID ${id} not found`);
    }

    const [sitesCount, departmentsCount, employeesCount] = await Promise.all([
      this.prisma.sites.count({
        where: {
          regions: { company_id: id },
          is_active: true,
        },
      }),
      this.prisma.departments.count({
        where: {
          sites: { regions: { companies: { id } } },
          is_active: true,
        },
      }),
      this.prisma.users.count({
        where: {
          departments_users_department_idTodepartments: { sites: { regions: { companies: { id } } } },
          is_active: true,
        },
      }),
    ]);

    return {
      success: true,
      company,
      regions: company.regions,
      stats: {
        regions: company.regions.length,
        sites: sitesCount,
        departments: departmentsCount,
        employees: employeesCount,
      },
    };
  }

  async createCompany(dto: CreateCompanyDto) {
    const existingCompany = await this.prisma.companies.findFirst({
      where: { code: dto.code },
    });

    if (existingCompany) {
      throw new ConflictException(`Company with code ${dto.code} already exists`);
    }

    const company = await this.prisma.companies.create({
      data: {
        ...dto,
        country: dto.country || 'South Africa',
        timezone: dto.timezone || 'Africa/Johannesburg',
        currency: dto.currency || 'ZAR',
        fiscal_year_start: dto.fiscal_year_start || 4,
      },
    });

    return { success: true, company };
  }

  async updateCompany(id: number, dto: UpdateCompanyDto) {
    const existingCompany = await this.prisma.companies.findUnique({
      where: { id },
    });

    if (!existingCompany) {
      throw new NotFoundException(`Company with ID ${id} not found`);
    }

    const company = await this.prisma.companies.update({
      where: { id },
      data: {
        ...dto,
        updated_at: new Date(),
      },
    });

    return { success: true, company };
  }

  async deleteCompany(id: number) {
    const company = await this.prisma.companies.findUnique({
      where: { id },
    });

    if (!company) {
      throw new NotFoundException(`Company with ID ${id} not found`);
    }

    const [regionsCount, sitesCount, departmentsCount, employeesCount] = await Promise.all([
      this.prisma.regions.count({ where: { company_id: id, is_active: true } }),
      this.prisma.sites.count({ where: { regions: { company_id: id }, is_active: true } }),
      this.prisma.departments.count({ where: { sites: { regions: { company_id: id } }, is_active: true } }),
      this.prisma.users.count({ where: { departments_users_department_idTodepartments: { sites: { regions: { company_id: id } } }, is_active: true } }),
    ]);

    if (regionsCount > 0 || sitesCount > 0 || departmentsCount > 0 || employeesCount > 0) {
      throw new BadRequestException(
        `Cannot delete company: ${regionsCount} active regions, ${sitesCount} active sites, ${departmentsCount} active departments, ${employeesCount} active employees exist in hierarchy. Please deactivate all descendants first.`
      );
    }

    const deleted = await this.prisma.companies.update({
      where: { id },
      data: {
        is_active: false,
      },
    });

    return { success: true, message: 'Company deleted successfully', company: deleted };
  }

  async createRegion(companyId: number, dto: CreateRegionDto) {
    const company = await this.prisma.companies.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      throw new NotFoundException(`Company with ID ${companyId} not found`);
    }

    const existingRegion = await this.prisma.regions.findFirst({
      where: { company_id: companyId, code: dto.code },
    });

    if (existingRegion) {
      throw new ConflictException(`Region with code ${dto.code} already exists for this company`);
    }

    const region = await this.prisma.regions.create({
      data: {
        ...dto,
        company_id: companyId,
      },
    });

    return { success: true, region };
  }

  async findRegion(id: number) {
    const region = await this.prisma.regions.findUnique({
      where: { id },
      include: {
        companies: true,
        sites: { where: { is_active: true } },
      },
    });

    if (!region) {
      throw new NotFoundException(`Region with ID ${id} not found`);
    }

    const [departmentsCount, employeesCount] = await Promise.all([
      this.prisma.departments.count({
        where: {
          sites: { region_id: id },
          is_active: true,
        },
      }),
      this.prisma.users.count({
        where: {
          departments_users_department_idTodepartments: { sites: { region_id: id } },
          is_active: true,
        },
      }),
    ]);

    return {
      success: true,
      region,
      stats: {
        sites: region.sites.length,
        departments: departmentsCount,
        employees: employeesCount,
      },
    };
  }

  async updateRegion(id: number, dto: UpdateRegionDto) {
    const region = await this.prisma.regions.findUnique({ where: { id } });

    if (!region) {
      throw new NotFoundException(`Region with ID ${id} not found`);
    }

    if (dto.code && dto.code !== region.code) {
      const duplicate = await this.prisma.regions.findFirst({
        where: {
          company_id: region.company_id,
          code: dto.code,
          id: { not: id },
        },
      });
      if (duplicate) {
        throw new ConflictException(`Region with code ${dto.code} already exists for this company`);
      }
    }

    const updated = await this.prisma.regions.update({
      where: { id },
      data: {
        ...dto,
        updated_at: new Date(),
      },
    });

    return { success: true, region: updated };
  }

  async deleteRegion(id: number) {
    const region = await this.prisma.regions.findUnique({
      where: { id },
      include: {
        sites: { where: { is_active: true } },
      },
    });

    if (!region) {
      throw new NotFoundException(`Region with ID ${id} not found`);
    }

    if (region.sites.length > 0) {
      throw new BadRequestException(
        `Cannot delete region: ${region.sites.length} active sites still exist. Please deactivate or move sites first.`
      );
    }

    const deleted = await this.prisma.regions.update({
      where: { id },
      data: {
        is_active: false,
      },
    });

    return { success: true, message: 'Region deleted successfully', region: deleted };
  }

  async createSite(regionId: number, dto: CreateSiteDto) {
    const region = await this.prisma.regions.findUnique({
      where: { id: regionId },
    });

    if (!region) {
      throw new NotFoundException(`Region with ID ${regionId} not found`);
    }

    const site = await this.prisma.sites.create({
      data: {
        ...dto,
        region_id: regionId,
        geo_fence_radius: dto.geo_fence_radius || 100,
        allow_remote_work: dto.allow_remote_work || false,
      },
    });

    return { success: true, site };
  }

  async findSite(id: number) {
    const site = await this.prisma.sites.findUnique({
      where: { id },
      include: {
        regions: { include: { companies: true } },
        departments: { where: { is_active: true } },
      },
    });

    if (!site) {
      throw new NotFoundException(`Site with ID ${id} not found`);
    }

    const departmentDetails = await Promise.all(
      site.departments.map(async (dept) => {
        const employeeCount = await this.prisma.users.count({
          where: { department_id: dept.id, is_active: true },
        });
        return {
          department: dept,
          employee_count: employeeCount,
        };
      })
    );

    const totalEmployees = departmentDetails.reduce((sum, d) => sum + d.employee_count, 0);

    return {
      success: true,
      site,
      department_details: departmentDetails,
      stats: {
        departments: site.departments.length,
        employees: totalEmployees,
      },
    };
  }

  async updateSite(id: number, dto: UpdateSiteDto) {
    const site = await this.prisma.sites.findUnique({ where: { id } });

    if (!site) {
      throw new NotFoundException(`Site with ID ${id} not found`);
    }

    const updated = await this.prisma.sites.update({
      where: { id },
      data: {
        ...dto,
        updated_at: new Date(),
      },
    });

    return { success: true, site: updated };
  }

  async deleteSite(id: number) {
    const site = await this.prisma.sites.findUnique({ where: { id } });

    if (!site) {
      throw new NotFoundException(`Site with ID ${id} not found`);
    }

    const [departmentsCount, employeesCount] = await Promise.all([
      this.prisma.departments.count({ where: { site_id: id, is_active: true } }),
      this.prisma.users.count({ where: { departments_users_department_idTodepartments: { site_id: id }, is_active: true } }),
    ]);

    if (departmentsCount > 0 || employeesCount > 0) {
      throw new BadRequestException(
        `Cannot delete site: ${departmentsCount} active departments and ${employeesCount} active employees exist. Please deactivate or reassign all descendants first.`
      );
    }

    const deleted = await this.prisma.sites.update({
      where: { id },
      data: {
        is_active: false,
      },
    });

    return { success: true, message: 'Site deleted successfully', site: deleted };
  }

  async createDepartment(siteId: number, dto: CreateDepartmentDto) {
    const site = await this.prisma.sites.findUnique({
      where: { id: siteId },
    });

    if (!site) {
      throw new NotFoundException(`Site with ID ${siteId} not found`);
    }

    if (dto.manager_id) {
      const manager = await this.prisma.users.findUnique({
        where: { id: dto.manager_id },
      });
      if (!manager) {
        throw new BadRequestException(`Manager with ID ${dto.manager_id} not found`);
      }
    }

    if (dto.deputy_manager_id) {
      const deputyManager = await this.prisma.users.findUnique({
        where: { id: dto.deputy_manager_id },
      });
      if (!deputyManager) {
        throw new BadRequestException(`Deputy manager with ID ${dto.deputy_manager_id} not found`);
      }
    }

    const department = await this.prisma.departments.create({
      data: {
        ...dto,
        site_id: siteId,
        standard_hours_per_day: dto.standard_hours_per_day || 8.0,
        standard_hours_per_week: dto.standard_hours_per_week || 40.0,
      },
    });

    return { success: true, department };
  }

  async findDepartment(id: number) {
    const department = await this.prisma.departments.findUnique({
      where: { id },
      include: {
        sites: { include: { regions: { include: { companies: true } } } },
        users_departments_manager_idTousers: true,
        users_departments_deputy_manager_idTousers: true,
      },
    });

    if (!department) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }

    const allEmployees = await this.prisma.users.findMany({
      where: { department_id: id },
    });

    const activeEmployees = allEmployees.filter(e => e.is_active);
    const stats = {
      total_employees: allEmployees.length,
      active_employees: activeEmployees.length,
      inactive_employees: allEmployees.filter(e => !e.is_active).length,
      full_time: allEmployees.filter(e => e.employment_type === 'full_time').length,
      part_time: allEmployees.filter(e => e.employment_type === 'part_time').length,
      contractors: allEmployees.filter(e => e.employment_type === 'contract').length,
    };

    return {
      success: true,
      department,
      employees: activeEmployees,
      stats,
    };
  }

  async updateDepartment(id: number, dto: UpdateDepartmentDto) {
    const department = await this.prisma.departments.findUnique({ where: { id } });

    if (!department) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }

    if (dto.manager_id) {
      const manager = await this.prisma.users.findUnique({ where: { id: dto.manager_id } });
      if (!manager) {
        throw new BadRequestException(`Manager with ID ${dto.manager_id} not found`);
      }
    }

    if (dto.deputy_manager_id) {
      const deputyManager = await this.prisma.users.findUnique({ where: { id: dto.deputy_manager_id } });
      if (!deputyManager) {
        throw new BadRequestException(`Deputy manager with ID ${dto.deputy_manager_id} not found`);
      }
    }

    const updated = await this.prisma.departments.update({
      where: { id },
      data: {
        ...dto,
        updated_at: new Date(),
      },
    });

    return { success: true, department: updated };
  }

  async deleteDepartment(id: number) {
    const department = await this.prisma.departments.findUnique({ where: { id } });

    if (!department) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }

    const employeeCount = await this.prisma.users.count({
      where: { department_id: id },
    });

    if (employeeCount > 0) {
      throw new BadRequestException(
        `Cannot delete department: ${employeeCount} employees (active and inactive) still assigned. Please reassign all employees first.`
      );
    }

    const deleted = await this.prisma.departments.update({
      where: { id },
      data: {
        is_active: false,
      },
    });

    return { success: true, message: 'Department deleted successfully', department: deleted };
  }

  async assignEmployee(dto: AssignEmployeeDto) {
    const [employee, department] = await Promise.all([
      this.prisma.users.findUnique({ where: { id: dto.employee_id } }),
      this.prisma.departments.findUnique({ where: { id: dto.department_id } }),
    ]);

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${dto.employee_id} not found`);
    }
    if (!department) {
      throw new NotFoundException(`Department with ID ${dto.department_id} not found`);
    }

    const oldDepartment = employee.department_id
      ? await this.prisma.departments.findUnique({ where: { id: employee.department_id } })
      : null;

    const updated = await this.prisma.users.update({
      where: { id: dto.employee_id },
      data: { department_id: dto.department_id },
    });

    const employeeName = employee.first_name && employee.last_name 
      ? `${employee.first_name} ${employee.last_name}`
      : employee.username;

    return {
      success: true,
      message: `Successfully assigned ${employeeName} from ${oldDepartment?.name || 'Unassigned'} to ${department.name}`,
      employee: updated,
    };
  }

  async getHierarchy(companyId: number) {
    const company = await this.prisma.companies.findUnique({
      where: { id: companyId },
      include: {
        regions: {
          where: { is_active: true },
          include: {
            sites: {
              where: { is_active: true },
              include: {
                departments: {
                  where: { is_active: true },
                },
              },
            },
          },
        },
      },
    });

    if (!company) {
      throw new NotFoundException(`Company with ID ${companyId} not found`);
    }

    const hierarchy = {
      company: {
        id: company.id,
        name: company.name,
        code: company.code,
      },
      regions: await Promise.all(
        company.regions.map(async (region) => ({
          id: region.id,
          name: region.name,
          code: region.code,
          sites: await Promise.all(
            region.sites.map(async (site) => ({
              id: site.id,
              name: site.name,
              code: site.code,
              departments: await Promise.all(
                site.departments.map(async (dept) => {
                  const employeeCount = await this.prisma.users.count({
                    where: { department_id: dept.id, is_active: true },
                  });
                  return {
                    id: dept.id,
                    name: dept.name,
                    code: dept.code,
                    employee_count: employeeCount,
                  };
                })
              ),
            }))
          ),
        }))
      ),
    };

    return { success: true, hierarchy };
  }

  async searchOrganization(query: string) {
    if (query.length < 2) {
      return { success: true, results: [] };
    }

    const [companies, regions, sites, departments] = await Promise.all([
      this.prisma.companies.findMany({
        where: {
          name: { contains: query, mode: 'insensitive' },
          is_active: true,
        },
        take: 5,
      }),
      this.prisma.regions.findMany({
        where: {
          name: { contains: query, mode: 'insensitive' },
          is_active: true,
        },
        include: { companies: true },
        take: 5,
      }),
      this.prisma.sites.findMany({
        where: {
          name: { contains: query, mode: 'insensitive' },
          is_active: true,
        },
        include: { regions: { include: { companies: true } } },
        take: 5,
      }),
      this.prisma.departments.findMany({
        where: {
          name: { contains: query, mode: 'insensitive' },
          is_active: true,
        },
        include: { sites: { include: { regions: { include: { companies: true } } } } },
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
        company: r.companies.name,
      })),
      ...sites.map(s => ({
        type: 'site',
        id: s.id,
        name: s.name,
        code: s.code,
        region: s.regions.name,
        company: s.regions.companies.name,
      })),
      ...departments.map(d => ({
        type: 'department',
        id: d.id,
        name: d.name,
        code: d.code,
        site: d.sites.name,
        region: d.sites.regions.name,
        company: d.sites.regions.companies.name,
      })),
    ];

    return { success: true, results };
  }

  async findAllDepartments() {
    const departments = await this.prisma.departments.findMany({
      where: { is_active: true },
      include: {
        sites: {
          include: {
            regions: {
              include: {
                companies: true,
              },
            },
          },
        },
      },
    });

    return { success: true, departments };
  }
}
