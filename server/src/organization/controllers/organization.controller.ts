import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthenticatedGuard } from '../../auth/guards/authenticated.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { OrganizationService } from '../services/organization.service';
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

@Controller('organization')
@UseGuards(AuthenticatedGuard, RolesGuard)
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Get('dashboard')
  @Roles('Super User', 'Admin', 'HR')
  async getDashboard() {
    return this.organizationService.getDashboard();
  }

  @Get('companies')
  @Roles('Super User', 'Admin', 'HR')
  async findAllCompanies() {
    return this.organizationService.findAllCompanies();
  }

  @Get('companies/:id')
  @Roles('Super User', 'Admin', 'HR', 'Manager')
  async findCompany(@Param('id', ParseIntPipe) id: number) {
    return this.organizationService.findCompany(id);
  }

  @Post('companies')
  @Roles('Super User', 'Admin')
  async createCompany(@Body() dto: CreateCompanyDto) {
    return this.organizationService.createCompany(dto);
  }

  @Put('companies/:id')
  @Roles('Super User', 'Admin')
  async updateCompany(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCompanyDto
  ) {
    return this.organizationService.updateCompany(id, dto);
  }

  @Post('companies/:companyId/regions')
  @Roles('Super User', 'Admin', 'HR')
  async createRegion(
    @Param('companyId', ParseIntPipe) companyId: number,
    @Body() dto: CreateRegionDto
  ) {
    return this.organizationService.createRegion(companyId, dto);
  }

  @Get('regions/:id')
  @Roles('Super User', 'Admin', 'HR', 'Manager')
  async findRegion(@Param('id', ParseIntPipe) id: number) {
    return this.organizationService.findRegion(id);
  }

  @Put('regions/:id')
  @Roles('Super User', 'Admin')
  async updateRegion(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRegionDto
  ) {
    return this.organizationService.updateRegion(id, dto);
  }

  @Delete('regions/:id')
  @Roles('Super User', 'Admin')
  async deleteRegion(@Param('id', ParseIntPipe) id: number) {
    return this.organizationService.deleteRegion(id);
  }

  @Post('regions/:regionId/sites')
  @Roles('Super User', 'Admin', 'HR')
  async createSite(
    @Param('regionId', ParseIntPipe) regionId: number,
    @Body() dto: CreateSiteDto
  ) {
    return this.organizationService.createSite(regionId, dto);
  }

  @Get('sites/:id')
  @Roles('Super User', 'Admin', 'HR', 'Manager')
  async findSite(@Param('id', ParseIntPipe) id: number) {
    return this.organizationService.findSite(id);
  }

  @Post('sites/:siteId/departments')
  @Roles('Super User', 'Admin', 'HR')
  async createDepartment(
    @Param('siteId', ParseIntPipe) siteId: number,
    @Body() dto: CreateDepartmentDto
  ) {
    return this.organizationService.createDepartment(siteId, dto);
  }

  @Get('departments')
  @Roles('Super User', 'Admin', 'HR', 'Manager')
  async findAllDepartments() {
    return this.organizationService.findAllDepartments();
  }

  @Get('departments/:id')
  @Roles('Super User', 'Admin', 'HR', 'Manager')
  async findDepartment(@Param('id', ParseIntPipe) id: number) {
    return this.organizationService.findDepartment(id);
  }

  @Post('departments/assign-employee')
  @Roles('Super User', 'Admin', 'HR')
  async assignEmployee(@Body() dto: AssignEmployeeDto) {
    return this.organizationService.assignEmployee(dto);
  }

  @Get('hierarchy/:companyId')
  @Roles('Super User', 'Admin', 'HR', 'Manager')
  async getHierarchy(@Param('companyId', ParseIntPipe) companyId: number) {
    return this.organizationService.getHierarchy(companyId);
  }

  @Get('search')
  @Roles('Super User', 'Admin', 'HR', 'Manager')
  async searchOrganization(@Query('q') query: string) {
    return this.organizationService.searchOrganization(query);
  }
}
