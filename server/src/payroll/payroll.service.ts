import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Or, In, Like, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { PayCalculation } from '../entities/pay-calculation.entity';
import { PayCode } from '../entities/pay-code.entity';
import { PayRule } from '../entities/pay-rule.entity';
import { TimeEntry } from '../entities/time-entry.entity';
import { User } from '../entities/user.entity';
import { UserRole } from '../entities/user-role.entity';
import { CreatePayCodeDto } from './dto/create-pay-code.dto';
import { UpdatePayCodeDto } from './dto/update-pay-code.dto';
import { CreatePayRuleDto } from './dto/create-pay-rule.dto';
import { UpdatePayRuleDto } from './dto/update-pay-rule.dto';
import { CalculatePayrollDto } from './dto/calculate-payroll.dto';

export interface PayComponent {
  hours?: number;
  amount?: number;
  multiplier?: number;
  differential?: number;
  type?: string;
  rule_name?: string;
  rules_applied?: string[];
}

export interface PayCalculationResult {
  user_id: number;
  username: string;
  total_hours: number;
  pay_components: Record<string, PayComponent>;
  summary: {
    regular_hours: number;
    overtime_hours: number;
    double_time_hours: number;
    total_allowances: number;
    shift_differentials: number;
  };
}

@Injectable()
export class PayrollService {
  constructor(
    @InjectRepository(PayCalculation)
    private payCalculationRepo: Repository<PayCalculation>,
    @InjectRepository(PayCode)
    private payCodeRepo: Repository<PayCode>,
    @InjectRepository(PayRule)
    private payRuleRepo: Repository<PayRule>,
    @InjectRepository(TimeEntry)
    private timeEntryRepo: Repository<TimeEntry>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(UserRole)
    private userRoleRepo: Repository<UserRole>,
    private dataSource: DataSource,
  ) {}

  // ==================== PAY CODES ====================

  async getPayCodes(
    page: number = 1,
    perPage: number = 20,
    codeType?: 'absence' | 'payroll',
    statusFilter?: 'active' | 'inactive'
  ) {
    const skip = (page - 1) * perPage;
    
    const where: any = {};
    if (codeType === 'absence') {
      where.isAbsenceCode = true;
    } else if (codeType === 'payroll') {
      where.isAbsenceCode = false;
    }
    
    if (statusFilter === 'active') {
      where.isActive = true;
    } else if (statusFilter === 'inactive') {
      where.isActive = false;
    }

    const [payCodes, total] = await Promise.all([
      this.payCodeRepo.find({
        where,
        order: { code: 'ASC' },
        skip,
        take: perPage,
        relations: ['createdBy'],
      }),
      this.payCodeRepo.count({ where }),
    ]);

    return {
      pay_codes: payCodes,
      total,
      page,
      per_page: perPage,
      total_pages: Math.ceil(total / perPage),
    };
  }

  async getPayCodeById(id: number) {
    const payCode = await this.payCodeRepo.findOne({
      where: { id },
      relations: ['createdBy'],
    });

    if (!payCode) {
      throw new NotFoundException(`Pay code with ID ${id} not found`);
    }

    // Get usage statistics
    const timeEntriesCount = await this.timeEntryRepo.count({
      where: [
        { absencePayCodeId: id },
        { payCodeId: id },
      ],
    });

    return {
      ...payCode,
      usage_count: timeEntriesCount,
    };
  }

  async createPayCode(dto: CreatePayCodeDto, createdById: number) {
    // Check if code already exists
    const existing = await this.payCodeRepo.findOne({
      where: { code: dto.code.toUpperCase() },
    });

    if (existing) {
      throw new BadRequestException(`Pay code "${dto.code}" already exists`);
    }

    const payCode = this.payCodeRepo.create({
      code: dto.code.toUpperCase(),
      description: dto.description,
      isAbsenceCode: dto.is_absence_code,
      configuration: dto.configuration ? JSON.stringify(dto.configuration) : undefined,
      createdById: createdById,
      isActive: true,
    });

    const saved = await this.payCodeRepo.save(payCode);

    const result = await this.payCodeRepo.findOne({
      where: { id: saved.id },
      relations: ['createdBy'],
    });

    return result!;
  }

  async updatePayCode(id: number, dto: UpdatePayCodeDto) {
    const payCode = await this.payCodeRepo.findOne({ where: { id } });
    
    if (!payCode) {
      throw new NotFoundException(`Pay code with ID ${id} not found`);
    }

    const updateData: any = {};
    if (dto.description !== undefined) {
      updateData.description = dto.description;
    }
    if (dto.is_active !== undefined) {
      updateData.isActive = dto.is_active;
    }
    if (dto.configuration !== undefined) {
      updateData.configuration = JSON.stringify(dto.configuration);
    }

    await this.payCodeRepo.update(id, updateData);

    return this.payCodeRepo.findOne({
      where: { id },
      relations: ['createdBy'],
    });
  }

  async deletePayCode(id: number) {
    // Check if code is used in any time entries
    const entriesUsingCode = await this.timeEntryRepo.count({
      where: [
        { absencePayCodeId: id },
        { payCodeId: id },
      ],
    });

    if (entriesUsingCode > 0) {
      throw new BadRequestException(
        `Cannot delete pay code - it is used in ${entriesUsingCode} time entries. Consider deactivating instead.`
      );
    }

    await this.payCodeRepo.delete(id);
    return { message: 'Pay code deleted successfully' };
  }

  async togglePayCodeStatus(id: number) {
    const payCode = await this.payCodeRepo.findOne({ where: { id } });
    
    if (!payCode) {
      throw new NotFoundException(`Pay code with ID ${id} not found`);
    }

    await this.payCodeRepo.update(id, {
      isActive: !payCode.isActive,
    });

    const updated = await this.payCodeRepo.findOne({ where: { id } });

    return {
      is_active: updated!.isActive,
      message: `Pay code "${updated!.code}" ${updated!.isActive ? 'activated' : 'deactivated'}`,
    };
  }

  async getAbsenceCodes() {
    const codes = await this.payCodeRepo.find({
      where: {
        isAbsenceCode: true,
        isActive: true,
      },
      order: { code: 'ASC' },
    });

    return codes.map((code) => {
      const config = code.configuration ? JSON.parse(code.configuration as string) : {};
      return {
        id: code.id,
        code: code.code,
        description: code.description,
        is_paid: config.is_paid || false,
        requires_approval: config.requires_approval || false,
        max_hours_per_day: config.max_hours_per_day,
        max_consecutive_days: config.max_consecutive_days,
      };
    });
  }

  // ==================== PAY RULES ====================

  async getPayRules(
    page: number = 1,
    perPage: number = 20,
    statusFilter?: 'active' | 'inactive'
  ) {
    const skip = (page - 1) * perPage;
    
    const where: any = {};
    if (statusFilter === 'active') {
      where.isActive = true;
    } else if (statusFilter === 'inactive') {
      where.isActive = false;
    }

    const [payRules, total] = await Promise.all([
      this.payRuleRepo.find({
        where,
        order: { priority: 'ASC', createdAt: 'DESC' },
        skip,
        take: perPage,
        relations: ['createdBy'],
      }),
      this.payRuleRepo.count({ where }),
    ]);

    return {
      pay_rules: payRules,
      total,
      page,
      per_page: perPage,
      total_pages: Math.ceil(total / perPage),
    };
  }

  async getPayRuleById(id: number) {
    const payRule = await this.payRuleRepo.findOne({
      where: { id },
      relations: ['createdBy'],
    });

    if (!payRule) {
      throw new NotFoundException(`Pay rule with ID ${id} not found`);
    }

    return payRule;
  }

  async createPayRule(dto: CreatePayRuleDto, createdById: number) {
    // Check if rule name already exists
    const existing = await this.payRuleRepo.findOne({
      where: { name: dto.name },
    });

    if (existing) {
      throw new BadRequestException(`Pay rule "${dto.name}" already exists`);
    }

    // Validate conditions and actions
    if (!dto.conditions || Object.keys(dto.conditions).length === 0) {
      throw new BadRequestException('At least one condition must be specified');
    }

    if (!dto.actions || Object.keys(dto.actions).length === 0) {
      throw new BadRequestException('At least one action must be specified');
    }

    const payRule = this.payRuleRepo.create({
      name: dto.name,
      description: dto.description || '',
      priority: dto.priority,
      conditions: JSON.stringify(dto.conditions),
      actions: JSON.stringify(dto.actions),
      createdById: createdById,
      isActive: true,
    });

    const saved = await this.payRuleRepo.save(payRule);

    return this.payRuleRepo.findOne({
      where: { id: saved.id },
      relations: ['createdBy'],
    });
  }

  async updatePayRule(id: number, dto: UpdatePayRuleDto) {
    const payRule = await this.payRuleRepo.findOne({ where: { id } });
    
    if (!payRule) {
      throw new NotFoundException(`Pay rule with ID ${id} not found`);
    }

    // Validate if conditions/actions provided
    if (dto.conditions && Object.keys(dto.conditions).length === 0) {
      throw new BadRequestException('At least one condition must be specified');
    }

    if (dto.actions && Object.keys(dto.actions).length === 0) {
      throw new BadRequestException('At least one action must be specified');
    }

    const updateData: any = {};
    if (dto.name !== undefined) {
      updateData.name = dto.name;
    }
    if (dto.description !== undefined) {
      updateData.description = dto.description;
    }
    if (dto.priority !== undefined) {
      updateData.priority = dto.priority;
    }
    if (dto.is_active !== undefined) {
      updateData.isActive = dto.is_active;
    }
    if (dto.conditions !== undefined) {
      updateData.conditions = JSON.stringify(dto.conditions);
    }
    if (dto.actions !== undefined) {
      updateData.actions = JSON.stringify(dto.actions);
    }

    await this.payRuleRepo.update(id, updateData);

    return this.payRuleRepo.findOne({
      where: { id },
      relations: ['createdBy'],
    });
  }

  async deletePayRule(id: number) {
    const payRule = await this.payRuleRepo.findOne({ where: { id } });
    
    if (!payRule) {
      throw new NotFoundException(`Pay rule with ID ${id} not found`);
    }

    // Check if rule is used in any calculations (search in pay_components JSON)
    const calculationsCount = await this.payCalculationRepo.count({
      where: {
        payComponents: Like(`%${payRule.name}%`),
      },
    });

    if (calculationsCount > 0) {
      throw new BadRequestException(
        `Cannot delete rule "${payRule.name}" - it has been used in ${calculationsCount} pay calculations. Consider deactivating instead.`
      );
    }

    await this.payRuleRepo.delete(id);
    return { message: 'Pay rule deleted successfully' };
  }

  async togglePayRuleStatus(id: number) {
    const payRule = await this.payRuleRepo.findOne({ where: { id } });
    
    if (!payRule) {
      throw new NotFoundException(`Pay rule with ID ${id} not found`);
    }

    await this.payRuleRepo.update(id, {
      isActive: !payRule.isActive,
    });

    const updated = await this.payRuleRepo.findOne({ where: { id } });

    return {
      is_active: updated!.isActive,
      message: `Rule "${updated!.name}" ${updated!.isActive ? 'activated' : 'deactivated'}`,
    };
  }

  async reorderPayRules(ruleOrders: Array<{ id: number; priority: number }>) {
    // Update priorities in transaction
    const queryRunner = this.dataSource.createQueryRunner();
    
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for (const order of ruleOrders) {
        await queryRunner.manager.update(PayRule, order.id, {
          priority: order.priority,
        });
      }

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }

    return { message: 'Rule priorities updated successfully' };
  }

  // ==================== PAY RULE ENGINE ====================

  private matchesConditions(
    timeEntry: any,
    conditions: any,
    context: { user_roles: string[]; total_entries: number }
  ): boolean {
    // Day of week condition
    if (conditions.day_of_week) {
      const dayOfWeek = new Date(timeEntry.clockInTime).getDay();
      if (!conditions.day_of_week.includes(dayOfWeek)) {
        return false;
      }
    }

    // Time range condition
    if (conditions.time_range) {
      const hour = new Date(timeEntry.clockInTime).getHours();
      const { start, end } = conditions.time_range;
      
      // Handle overnight shifts (e.g., 22:00 to 6:00)
      if (start > end) {
        if (!(hour >= start || hour < end)) {
          return false;
        }
      } else {
        if (!(hour >= start && hour < end)) {
          return false;
        }
      }
    }

    // Overtime threshold
    if (conditions.overtime_threshold !== undefined) {
      const hours = this.calculateEntryHours(timeEntry);
      if (hours <= conditions.overtime_threshold) {
        return false;
      }
    }

    // Employee IDs
    if (conditions.employee_ids && conditions.employee_ids.length > 0) {
      if (!conditions.employee_ids.includes(timeEntry.userId)) {
        return false;
      }
    }

    // Role conditions
    if (conditions.roles && conditions.roles.length > 0) {
      const hasRole = conditions.roles.some((role: string) =>
        context.user_roles.includes(role)
      );
      if (!hasRole) {
        return false;
      }
    }

    return true;
  }

  private applyActions(
    timeEntry: any,
    actions: any,
    ruleName: string
  ): Record<string, PayComponent> {
    const components: Record<string, PayComponent> = {};
    const hours = this.calculateEntryHours(timeEntry);

    // Pay multiplier
    if (actions.pay_multiplier) {
      const componentName = actions.component_name || ruleName.toLowerCase().replace(/\s+/g, '_');
      components[componentName] = {
        hours,
        multiplier: actions.pay_multiplier,
        type: 'hours',
        rule_name: ruleName,
      };
    }

    // Flat allowance
    if (actions.flat_allowance) {
      const allowanceName = actions.allowance_name || `${ruleName.toLowerCase().replace(/\s+/g, '_')}_allowance`;
      components[allowanceName] = {
        amount: actions.flat_allowance,
        type: 'allowance',
        rule_name: ruleName,
      };
    }

    // Shift differential
    if (actions.shift_differential) {
      const differentialName = actions.differential_name || `${ruleName.toLowerCase().replace(/\s+/g, '_')}_diff`;
      components[differentialName] = {
        hours,
        differential: actions.shift_differential,
        type: 'differential',
        rule_name: ruleName,
      };
    }

    return components;
  }

  private calculateEntryHours(timeEntry: any): number {
    if (!timeEntry.clockInTime || !timeEntry.clockOutTime) {
      return 0;
    }

    const clockIn = new Date(timeEntry.clockInTime);
    const clockOut = new Date(timeEntry.clockOutTime);
    const diffMs = clockOut.getTime() - clockIn.getTime();
    
    return diffMs / (1000 * 60 * 60); // Convert to hours
  }

  private calculateRegularHours(
    totalHours: number,
    payComponents: Record<string, PayComponent>
  ): number {
    let accountedHours = 0;
    
    for (const component of Object.values(payComponents)) {
      if (component.type === 'hours' && component.hours) {
        accountedHours += component.hours;
      }
    }

    return Math.max(0, totalHours - accountedHours);
  }

  private generateSummary(payComponents: Record<string, PayComponent>) {
    const summary = {
      regular_hours: 0,
      overtime_hours: 0,
      double_time_hours: 0,
      total_allowances: 0,
      shift_differentials: 0,
    };

    for (const component of Object.values(payComponents)) {
      const type = component.type || 'hours';
      const multiplier = component.multiplier || 1.0;
      const hours = component.hours || 0;
      const amount = component.amount || 0;

      if (type === 'regular' || multiplier === 1.0) {
        summary.regular_hours += hours;
      } else if (multiplier === 1.5) {
        summary.overtime_hours += hours;
      } else if (multiplier >= 2.0) {
        summary.double_time_hours += hours;
      }

      if (type === 'allowance') {
        summary.total_allowances += amount;
      }

      if (component.differential) {
        summary.shift_differentials += component.differential * hours;
      }
    }

    return summary;
  }

  async calculatePayroll(dto: CalculatePayrollDto, calculatedById: number, isSuperUser: boolean) {
    if (!isSuperUser) {
      throw new ForbiddenException('Only Super Users can calculate payroll');
    }

    const startDate = new Date(dto.pay_period_start);
    const endDate = new Date(dto.pay_period_end);

    // Build query for time entries
    const where: any = {
      clockInTime: Between(startDate, new Date(endDate.getTime() + 24 * 60 * 60 * 1000)),
      status: 'Closed',
    };

    if (dto.employee_ids && dto.employee_ids.length > 0) {
      where.userId = In(dto.employee_ids);
    }

    // Get all time entries and active pay rules
    const [timeEntries, payRules] = await Promise.all([
      this.timeEntryRepo.find({
        where,
        relations: ['user'],
        order: { clockInTime: 'ASC' },
      }),
      this.payRuleRepo.find({
        where: { isActive: true },
        order: { priority: 'ASC' },
      }),
    ]);

    if (timeEntries.length === 0) {
      throw new BadRequestException('No time entries found for the selected criteria');
    }

    // Group entries by employee
    const entriesByEmployee = new Map<number, any[]>();
    for (const entry of timeEntries) {
      const userId = entry.userId;
      if (!entriesByEmployee.has(userId)) {
        entriesByEmployee.set(userId, []);
      }
      entriesByEmployee.get(userId)!.push(entry);
    }

    // Calculate pay for each employee
    const employeeResults: Record<number, PayCalculationResult> = {};
    
    for (const [userId, userEntries] of entriesByEmployee) {
      const user = userEntries[0].user;
      
      // Get user roles from user_roles table
      const userRoles = await this.userRoleRepo.find({
        where: { userId: userId },
        relations: ['role'],
      });
      
      const context = {
        user_roles: userRoles.map((ur) => ur.role.name),
        total_entries: userEntries.length,
      };

      const payComponents: Record<string, PayComponent> = {};
      let totalHours = 0;

      // Process each time entry
      for (const entry of userEntries) {
        const entryHours = this.calculateEntryHours(entry);
        totalHours += entryHours;

        // Apply pay rules in priority order
        for (const rule of payRules) {
          const conditions = JSON.parse(rule.conditions as string);
          const actions = JSON.parse(rule.actions as string);

          if (this.matchesConditions(entry, conditions, context)) {
            const ruleComponents = this.applyActions(entry, actions, rule.name);
            
            // Merge components
            for (const [componentName, componentData] of Object.entries(ruleComponents)) {
              if (!payComponents[componentName]) {
                payComponents[componentName] = {
                  hours: 0,
                  amount: 0,
                  multiplier: componentData.multiplier,
                  differential: componentData.differential,
                  type: componentData.type,
                  rules_applied: [],
                };
              }

              if (componentData.hours) {
                payComponents[componentName].hours! += componentData.hours;
              }
              if (componentData.amount) {
                payComponents[componentName].amount! += componentData.amount;
              }
              if (componentData.rule_name) {
                payComponents[componentName].rules_applied!.push(componentData.rule_name);
              }
            }
          }
        }
      }

      // Add regular hours if no rules covered all hours
      const hasRegular = Object.values(payComponents).some(c => c.type === 'regular');
      if (!hasRegular) {
        const regularHours = this.calculateRegularHours(totalHours, payComponents);
        if (regularHours > 0) {
          payComponents.regular_hours = {
            hours: regularHours,
            multiplier: 1.0,
            type: 'regular',
            rules_applied: ['default'],
          };
        }
      }

      const summary = this.generateSummary(payComponents);

      employeeResults[userId] = {
        user_id: userId,
        username: user.username,
        total_hours: totalHours,
        pay_components: payComponents,
        summary,
      };
    }

    // Save results if requested
    const savedCalculations = [];
    if (dto.save_results) {
      for (const [userId, result] of Object.entries(employeeResults)) {
        const userEntries = entriesByEmployee.get(Number(userId))!;
        
        const calculation = this.payCalculationRepo.create({
          userId: Number(userId),
          timeEntryId: userEntries[0].id,
          payPeriodStart: startDate,
          payPeriodEnd: endDate,
          totalHours: result.total_hours,
          regularHours: result.summary.regular_hours,
          overtimeHours: result.summary.overtime_hours,
          doubleTimeHours: result.summary.double_time_hours,
          totalAllowances: result.summary.total_allowances,
          payComponents: JSON.stringify(result.pay_components),
          calculatedById: calculatedById,
          calculatedAt: new Date(),
        });

        const saved = await this.payCalculationRepo.save(calculation);
        savedCalculations.push(saved);
      }
    }

    // Aggregate results
    const totalSummary = {
      regular_hours: 0,
      overtime_hours: 0,
      double_time_hours: 0,
      total_allowances: 0,
      shift_differentials: 0,
    };

    for (const result of Object.values(employeeResults)) {
      totalSummary.regular_hours += result.summary.regular_hours;
      totalSummary.overtime_hours += result.summary.overtime_hours;
      totalSummary.double_time_hours += result.summary.double_time_hours;
      totalSummary.total_allowances += result.summary.total_allowances;
      totalSummary.shift_differentials += result.summary.shift_differentials;
    }

    return {
      employee_results: employeeResults,
      summary: totalSummary,
      employee_count: Object.keys(employeeResults).length,
      saved_calculations: dto.save_results ? savedCalculations : null,
    };
  }

  async getPayCalculations(
    page: number = 1,
    perPage: number = 20,
    employeeId?: number
  ) {
    const skip = (page - 1) * perPage;
    
    const where: any = {};
    if (employeeId) {
      where.userId = employeeId;
    }

    const [calculations, total] = await Promise.all([
      this.payCalculationRepo.find({
        where,
        order: { calculatedAt: 'DESC' },
        skip,
        take: perPage,
        relations: ['user', 'calculatedBy'],
      }),
      this.payCalculationRepo.count({ where }),
    ]);

    return {
      calculations,
      total,
      page,
      per_page: perPage,
      total_pages: Math.ceil(total / perPage),
    };
  }
}
