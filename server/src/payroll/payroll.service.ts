import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
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
  constructor(private prisma: PrismaService) {}

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
      where.is_absence_code = true;
    } else if (codeType === 'payroll') {
      where.is_absence_code = false;
    }
    
    if (statusFilter === 'active') {
      where.is_active = true;
    } else if (statusFilter === 'inactive') {
      where.is_active = false;
    }

    const [payCodes, total] = await Promise.all([
      this.prisma.pay_codes.findMany({
        where,
        orderBy: { code: 'asc' },
        skip,
        take: perPage,
        include: {
          users: {
            select: {
              id: true,
              username: true,
              first_name: true,
              last_name: true,
            },
          },
        },
      }),
      this.prisma.pay_codes.count({ where }),
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
    const payCode = await this.prisma.pay_codes.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            id: true,
            username: true,
            first_name: true,
            last_name: true,
          },
        },
      },
    });

    if (!payCode) {
      throw new NotFoundException(`Pay code with ID ${id} not found`);
    }

    // Get usage statistics
    const timeEntriesCount = await this.prisma.time_entries.count({
      where: {
        OR: [
          { absence_pay_code_id: id },
          { pay_code_id: id },
        ],
      },
    });

    return {
      ...payCode,
      usage_count: timeEntriesCount,
    };
  }

  async createPayCode(dto: CreatePayCodeDto, createdById: number) {
    // Check if code already exists
    const existing = await this.prisma.pay_codes.findUnique({
      where: { code: dto.code.toUpperCase() },
    });

    if (existing) {
      throw new BadRequestException(`Pay code "${dto.code}" already exists`);
    }

    const payCode = await this.prisma.pay_codes.create({
      data: {
        code: dto.code.toUpperCase(),
        description: dto.description,
        is_absence_code: dto.is_absence_code,
        configuration: dto.configuration ? JSON.stringify(dto.configuration) : null,
        created_by_id: createdById,
        is_active: true,
      },
      include: {
        users: {
          select: {
            id: true,
            username: true,
            first_name: true,
            last_name: true,
          },
        },
      },
    });

    return payCode;
  }

  async updatePayCode(id: number, dto: UpdatePayCodeDto) {
    const payCode = await this.prisma.pay_codes.findUnique({ where: { id } });
    
    if (!payCode) {
      throw new NotFoundException(`Pay code with ID ${id} not found`);
    }

    const updated = await this.prisma.pay_codes.update({
      where: { id },
      data: {
        description: dto.description,
        is_active: dto.is_active,
        configuration: dto.configuration ? JSON.stringify(dto.configuration) : undefined,
        updated_at: new Date(),
      },
      include: {
        users: {
          select: {
            id: true,
            username: true,
            first_name: true,
            last_name: true,
          },
        },
      },
    });

    return updated;
  }

  async deletePayCode(id: number) {
    // Check if code is used in any time entries
    const entriesUsingCode = await this.prisma.time_entries.count({
      where: {
        OR: [
          { absence_pay_code_id: id },
          { pay_code_id: id },
        ],
      },
    });

    if (entriesUsingCode > 0) {
      throw new BadRequestException(
        `Cannot delete pay code - it is used in ${entriesUsingCode} time entries. Consider deactivating instead.`
      );
    }

    await this.prisma.pay_codes.delete({ where: { id } });
    return { message: 'Pay code deleted successfully' };
  }

  async togglePayCodeStatus(id: number) {
    const payCode = await this.prisma.pay_codes.findUnique({ where: { id } });
    
    if (!payCode) {
      throw new NotFoundException(`Pay code with ID ${id} not found`);
    }

    const updated = await this.prisma.pay_codes.update({
      where: { id },
      data: {
        is_active: !payCode.is_active,
        updated_at: new Date(),
      },
    });

    return {
      is_active: updated.is_active,
      message: `Pay code "${updated.code}" ${updated.is_active ? 'activated' : 'deactivated'}`,
    };
  }

  async getAbsenceCodes() {
    const codes = await this.prisma.pay_codes.findMany({
      where: {
        is_absence_code: true,
        is_active: true,
      },
      orderBy: { code: 'asc' },
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
      where.is_active = true;
    } else if (statusFilter === 'inactive') {
      where.is_active = false;
    }

    const [payRules, total] = await Promise.all([
      this.prisma.pay_rules.findMany({
        where,
        orderBy: [{ priority: 'asc' }, { created_at: 'desc' }],
        skip,
        take: perPage,
        include: {
          users: {
            select: {
              id: true,
              username: true,
              first_name: true,
              last_name: true,
            },
          },
        },
      }),
      this.prisma.pay_rules.count({ where }),
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
    const payRule = await this.prisma.pay_rules.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            id: true,
            username: true,
            first_name: true,
            last_name: true,
          },
        },
      },
    });

    if (!payRule) {
      throw new NotFoundException(`Pay rule with ID ${id} not found`);
    }

    return payRule;
  }

  async createPayRule(dto: CreatePayRuleDto, createdById: number) {
    // Check if rule name already exists
    const existing = await this.prisma.pay_rules.findUnique({
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

    const payRule = await this.prisma.pay_rules.create({
      data: {
        name: dto.name,
        description: dto.description || '',
        priority: dto.priority,
        conditions: JSON.stringify(dto.conditions),
        actions: JSON.stringify(dto.actions),
        created_by_id: createdById,
        is_active: true,
      },
      include: {
        users: {
          select: {
            id: true,
            username: true,
            first_name: true,
            last_name: true,
          },
        },
      },
    });

    return payRule;
  }

  async updatePayRule(id: number, dto: UpdatePayRuleDto) {
    const payRule = await this.prisma.pay_rules.findUnique({ where: { id } });
    
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

    const updated = await this.prisma.pay_rules.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        priority: dto.priority,
        is_active: dto.is_active,
        conditions: dto.conditions ? JSON.stringify(dto.conditions) : undefined,
        actions: dto.actions ? JSON.stringify(dto.actions) : undefined,
        updated_at: new Date(),
      },
      include: {
        users: {
          select: {
            id: true,
            username: true,
            first_name: true,
            last_name: true,
          },
        },
      },
    });

    return updated;
  }

  async deletePayRule(id: number) {
    const payRule = await this.prisma.pay_rules.findUnique({ where: { id } });
    
    if (!payRule) {
      throw new NotFoundException(`Pay rule with ID ${id} not found`);
    }

    // Check if rule is used in any calculations (search in pay_components JSON)
    const calculationsCount = await this.prisma.pay_calculations.count({
      where: {
        pay_components: {
          contains: payRule.name,
        },
      },
    });

    if (calculationsCount > 0) {
      throw new BadRequestException(
        `Cannot delete rule "${payRule.name}" - it has been used in ${calculationsCount} pay calculations. Consider deactivating instead.`
      );
    }

    await this.prisma.pay_rules.delete({ where: { id } });
    return { message: 'Pay rule deleted successfully' };
  }

  async togglePayRuleStatus(id: number) {
    const payRule = await this.prisma.pay_rules.findUnique({ where: { id } });
    
    if (!payRule) {
      throw new NotFoundException(`Pay rule with ID ${id} not found`);
    }

    const updated = await this.prisma.pay_rules.update({
      where: { id },
      data: {
        is_active: !payRule.is_active,
        updated_at: new Date(),
      },
    });

    return {
      is_active: updated.is_active,
      message: `Rule "${updated.name}" ${updated.is_active ? 'activated' : 'deactivated'}`,
    };
  }

  async reorderPayRules(ruleOrders: Array<{ id: number; priority: number }>) {
    // Update priorities in transaction
    await this.prisma.$transaction(
      ruleOrders.map((order) =>
        this.prisma.pay_rules.update({
          where: { id: order.id },
          data: {
            priority: order.priority,
            updated_at: new Date(),
          },
        })
      )
    );

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
      const dayOfWeek = new Date(timeEntry.clock_in_time).getDay();
      if (!conditions.day_of_week.includes(dayOfWeek)) {
        return false;
      }
    }

    // Time range condition
    if (conditions.time_range) {
      const hour = new Date(timeEntry.clock_in_time).getHours();
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
      if (!conditions.employee_ids.includes(timeEntry.user_id)) {
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
    if (!timeEntry.clock_in_time || !timeEntry.clock_out_time) {
      return 0;
    }

    const clockIn = new Date(timeEntry.clock_in_time);
    const clockOut = new Date(timeEntry.clock_out_time);
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
      clock_in_time: {
        gte: startDate,
        lte: new Date(endDate.getTime() + 24 * 60 * 60 * 1000), // Include end date
      },
      status: 'Closed',
    };

    if (dto.employee_ids && dto.employee_ids.length > 0) {
      where.user_id = { in: dto.employee_ids };
    }

    // Get all time entries and active pay rules
    const [timeEntries, payRules] = await Promise.all([
      this.prisma.time_entries.findMany({
        where,
        include: {
          users_time_entries_user_idTousers: {
            select: {
              id: true,
              username: true,
              first_name: true,
              last_name: true,
            },
          },
        },
        orderBy: { clock_in_time: 'asc' },
      }),
      this.prisma.pay_rules.findMany({
        where: { is_active: true },
        orderBy: { priority: 'asc' },
      }),
    ]);

    if (timeEntries.length === 0) {
      throw new BadRequestException('No time entries found for the selected criteria');
    }

    // Group entries by employee
    const entriesByEmployee = new Map<number, any[]>();
    for (const entry of timeEntries) {
      const userId = entry.user_id;
      if (!entriesByEmployee.has(userId)) {
        entriesByEmployee.set(userId, []);
      }
      entriesByEmployee.get(userId)!.push(entry);
    }

    // Calculate pay for each employee
    const employeeResults: Record<number, PayCalculationResult> = {};
    
    for (const [userId, userEntries] of entriesByEmployee) {
      const user = userEntries[0].users_time_entries_user_idTousers;
      
      // Get user roles from user_roles table
      const userRoles = await this.prisma.user_roles.findMany({
        where: { user_id: userId },
        include: {
          roles: {
            select: {
              name: true,
            },
          },
        },
      });
      
      const context = {
        user_roles: userRoles.map((ur) => ur.roles.name),
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
        
        const calculation = await this.prisma.pay_calculations.create({
          data: {
            user_id: Number(userId),
            time_entry_id: userEntries[0].id,
            pay_period_start: startDate,
            pay_period_end: endDate,
            total_hours: result.total_hours,
            regular_hours: result.summary.regular_hours,
            overtime_hours: result.summary.overtime_hours,
            double_time_hours: result.summary.double_time_hours,
            total_allowances: result.summary.total_allowances,
            pay_components: JSON.stringify(result.pay_components),
            calculated_by_id: calculatedById,
            calculated_at: new Date(),
          },
        });

        savedCalculations.push(calculation);
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
      where.user_id = employeeId;
    }

    const [calculations, total] = await Promise.all([
      this.prisma.pay_calculations.findMany({
        where,
        orderBy: { calculated_at: 'desc' },
        skip,
        take: perPage,
        include: {
          users_pay_calculations_user_idTousers: {
            select: {
              id: true,
              username: true,
              first_name: true,
              last_name: true,
            },
          },
          users_pay_calculations_calculated_by_idTousers: {
            select: {
              id: true,
              username: true,
            },
          },
        },
      }),
      this.prisma.pay_calculations.count({ where }),
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
