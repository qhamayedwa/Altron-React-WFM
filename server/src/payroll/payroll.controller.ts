import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { PayrollService } from './payroll.service';
import { CreatePayCodeDto } from './dto/create-pay-code.dto';
import { UpdatePayCodeDto } from './dto/update-pay-code.dto';
import { CreatePayRuleDto } from './dto/create-pay-rule.dto';
import { UpdatePayRuleDto } from './dto/update-pay-rule.dto';
import { CalculatePayrollDto } from './dto/calculate-payroll.dto';

@Controller('payroll')
@UseGuards(AuthenticatedGuard, RolesGuard)
export class PayrollController {
  constructor(private readonly payrollService: PayrollService) {}

  // ==================== PAY CODES ====================

  @Get('pay-codes')
  @Roles('Super User', 'Admin', 'Payroll')
  async getPayCodes(
    @Query('page') page?: string,
    @Query('per_page') perPage?: string,
    @Query('type') codeType?: 'absence' | 'payroll',
    @Query('status') statusFilter?: 'active' | 'inactive',
  ) {
    const result = await this.payrollService.getPayCodes(
      page ? parseInt(page) : 1,
      perPage ? parseInt(perPage) : 20,
      codeType,
      statusFilter,
    );

    return {
      success: true,
      data: result,
    };
  }

  @Get('pay-codes/:id')
  @Roles('Super User', 'Admin', 'Payroll')
  async getPayCodeById(@Param('id', ParseIntPipe) id: number) {
    const payCode = await this.payrollService.getPayCodeById(id);

    return {
      success: true,
      data: payCode,
    };
  }

  @Post('pay-codes')
  @Roles('Super User')
  async createPayCode(@Body() dto: CreatePayCodeDto, @Request() req: any) {
    const payCode = await this.payrollService.createPayCode(dto, req.user.id);

    return {
      success: true,
      data: payCode,
      message: `Pay code "${payCode.code}" created successfully`,
    };
  }

  @Patch('pay-codes/:id')
  @Roles('Super User')
  async updatePayCode(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePayCodeDto,
  ) {
    const payCode = await this.payrollService.updatePayCode(id, dto);

    return {
      success: true,
      data: payCode,
      message: `Pay code "${payCode.code}" updated successfully`,
    };
  }

  @Delete('pay-codes/:id')
  @Roles('Super User')
  async deletePayCode(@Param('id', ParseIntPipe) id: number) {
    const result = await this.payrollService.deletePayCode(id);

    return {
      success: true,
      message: result.message,
    };
  }

  @Post('pay-codes/:id/toggle')
  @Roles('Super User')
  async togglePayCodeStatus(@Param('id', ParseIntPipe) id: number) {
    const result = await this.payrollService.togglePayCodeStatus(id);

    return {
      success: true,
      data: { is_active: result.is_active },
      message: result.message,
    };
  }

  @Get('pay-codes/list/absence')
  @Roles('Super User', 'Admin', 'Manager', 'Payroll')
  async getAbsenceCodes() {
    const codes = await this.payrollService.getAbsenceCodes();

    return {
      success: true,
      data: codes,
    };
  }

  // ==================== PAY RULES ====================

  @Get('pay-rules')
  @Roles('Super User')
  async getPayRules(
    @Query('page') page?: string,
    @Query('per_page') perPage?: string,
    @Query('status') statusFilter?: 'active' | 'inactive',
  ) {
    const result = await this.payrollService.getPayRules(
      page ? parseInt(page) : 1,
      perPage ? parseInt(perPage) : 20,
      statusFilter,
    );

    return {
      success: true,
      data: result,
    };
  }

  @Get('pay-rules/:id')
  @Roles('Super User')
  async getPayRuleById(@Param('id', ParseIntPipe) id: number) {
    const payRule = await this.payrollService.getPayRuleById(id);

    return {
      success: true,
      data: payRule,
    };
  }

  @Post('pay-rules')
  @Roles('Super User')
  async createPayRule(@Body() dto: CreatePayRuleDto, @Request() req: any) {
    const payRule = await this.payrollService.createPayRule(dto, req.user.id);

    return {
      success: true,
      data: payRule,
      message: `Pay rule "${payRule.name}" created successfully`,
    };
  }

  @Patch('pay-rules/:id')
  @Roles('Super User')
  async updatePayRule(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePayRuleDto,
  ) {
    const payRule = await this.payrollService.updatePayRule(id, dto);

    return {
      success: true,
      data: payRule,
      message: `Pay rule "${payRule.name}" updated successfully`,
    };
  }

  @Delete('pay-rules/:id')
  @Roles('Super User')
  async deletePayRule(@Param('id', ParseIntPipe) id: number) {
    const result = await this.payrollService.deletePayRule(id);

    return {
      success: true,
      message: result.message,
    };
  }

  @Post('pay-rules/:id/toggle')
  @Roles('Super User')
  async togglePayRuleStatus(@Param('id', ParseIntPipe) id: number) {
    const result = await this.payrollService.togglePayRuleStatus(id);

    return {
      success: true,
      data: { is_active: result.is_active },
      message: result.message,
    };
  }

  @Post('pay-rules/reorder')
  @Roles('Super User')
  @HttpCode(HttpStatus.OK)
  async reorderPayRules(
    @Body() body: { rule_orders: Array<{ id: number; priority: number }> },
  ) {
    const result = await this.payrollService.reorderPayRules(body.rule_orders);

    return {
      success: true,
      message: result.message,
    };
  }

  // ==================== PAYROLL CALCULATION ====================

  @Post('calculate')
  @Roles('Super User')
  async calculatePayroll(@Body() dto: CalculatePayrollDto, @Request() req: any) {
    const isSuperUser = req.user.role === 'Super User';
    const result = await this.payrollService.calculatePayroll(
      dto,
      req.user.id,
      isSuperUser,
    );

    return {
      success: true,
      data: result,
      message: dto.save_results
        ? `Payroll calculated and saved for ${result.employee_count} employees`
        : `Payroll calculated for ${result.employee_count} employees`,
    };
  }

  @Get('calculations')
  @Roles('Super User', 'Payroll')
  async getPayCalculations(
    @Query('page') page?: string,
    @Query('per_page') perPage?: string,
    @Query('employee_id') employeeId?: string,
  ) {
    const result = await this.payrollService.getPayCalculations(
      page ? parseInt(page) : 1,
      perPage ? parseInt(perPage) : 20,
      employeeId ? parseInt(employeeId) : undefined,
    );

    return {
      success: true,
      data: result,
    };
  }
}
