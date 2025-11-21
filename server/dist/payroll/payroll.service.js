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
exports.PayrollService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const pay_calculation_entity_1 = require("../entities/pay-calculation.entity");
const pay_code_entity_1 = require("../entities/pay-code.entity");
const pay_rule_entity_1 = require("../entities/pay-rule.entity");
const time_entry_entity_1 = require("../entities/time-entry.entity");
const user_entity_1 = require("../entities/user.entity");
const user_role_entity_1 = require("../entities/user-role.entity");
let PayrollService = class PayrollService {
    payCalculationRepo;
    payCodeRepo;
    payRuleRepo;
    timeEntryRepo;
    userRepo;
    userRoleRepo;
    dataSource;
    constructor(payCalculationRepo, payCodeRepo, payRuleRepo, timeEntryRepo, userRepo, userRoleRepo, dataSource) {
        this.payCalculationRepo = payCalculationRepo;
        this.payCodeRepo = payCodeRepo;
        this.payRuleRepo = payRuleRepo;
        this.timeEntryRepo = timeEntryRepo;
        this.userRepo = userRepo;
        this.userRoleRepo = userRoleRepo;
        this.dataSource = dataSource;
    }
    async getPayCodes(page = 1, perPage = 20, codeType, statusFilter) {
        const skip = (page - 1) * perPage;
        const where = {};
        if (codeType === 'absence') {
            where.isAbsenceCode = true;
        }
        else if (codeType === 'payroll') {
            where.isAbsenceCode = false;
        }
        if (statusFilter === 'active') {
            where.isActive = true;
        }
        else if (statusFilter === 'inactive') {
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
    async getPayCodeById(id) {
        const payCode = await this.payCodeRepo.findOne({
            where: { id },
            relations: ['createdBy'],
        });
        if (!payCode) {
            throw new common_1.NotFoundException(`Pay code with ID ${id} not found`);
        }
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
    async createPayCode(dto, createdById) {
        const existing = await this.payCodeRepo.findOne({
            where: { code: dto.code.toUpperCase() },
        });
        if (existing) {
            throw new common_1.BadRequestException(`Pay code "${dto.code}" already exists`);
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
        return result;
    }
    async updatePayCode(id, dto) {
        const payCode = await this.payCodeRepo.findOne({ where: { id } });
        if (!payCode) {
            throw new common_1.NotFoundException(`Pay code with ID ${id} not found`);
        }
        const updateData = {};
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
    async deletePayCode(id) {
        const entriesUsingCode = await this.timeEntryRepo.count({
            where: [
                { absencePayCodeId: id },
                { payCodeId: id },
            ],
        });
        if (entriesUsingCode > 0) {
            throw new common_1.BadRequestException(`Cannot delete pay code - it is used in ${entriesUsingCode} time entries. Consider deactivating instead.`);
        }
        await this.payCodeRepo.delete(id);
        return { message: 'Pay code deleted successfully' };
    }
    async togglePayCodeStatus(id) {
        const payCode = await this.payCodeRepo.findOne({ where: { id } });
        if (!payCode) {
            throw new common_1.NotFoundException(`Pay code with ID ${id} not found`);
        }
        await this.payCodeRepo.update(id, {
            isActive: !payCode.isActive,
        });
        const updated = await this.payCodeRepo.findOne({ where: { id } });
        return {
            is_active: updated.isActive,
            message: `Pay code "${updated.code}" ${updated.isActive ? 'activated' : 'deactivated'}`,
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
            const config = code.configuration ? JSON.parse(code.configuration) : {};
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
    async getPayRules(page = 1, perPage = 20, statusFilter) {
        const skip = (page - 1) * perPage;
        const where = {};
        if (statusFilter === 'active') {
            where.isActive = true;
        }
        else if (statusFilter === 'inactive') {
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
    async getPayRuleById(id) {
        const payRule = await this.payRuleRepo.findOne({
            where: { id },
            relations: ['createdBy'],
        });
        if (!payRule) {
            throw new common_1.NotFoundException(`Pay rule with ID ${id} not found`);
        }
        return payRule;
    }
    async createPayRule(dto, createdById) {
        const existing = await this.payRuleRepo.findOne({
            where: { name: dto.name },
        });
        if (existing) {
            throw new common_1.BadRequestException(`Pay rule "${dto.name}" already exists`);
        }
        if (!dto.conditions || Object.keys(dto.conditions).length === 0) {
            throw new common_1.BadRequestException('At least one condition must be specified');
        }
        if (!dto.actions || Object.keys(dto.actions).length === 0) {
            throw new common_1.BadRequestException('At least one action must be specified');
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
    async updatePayRule(id, dto) {
        const payRule = await this.payRuleRepo.findOne({ where: { id } });
        if (!payRule) {
            throw new common_1.NotFoundException(`Pay rule with ID ${id} not found`);
        }
        if (dto.conditions && Object.keys(dto.conditions).length === 0) {
            throw new common_1.BadRequestException('At least one condition must be specified');
        }
        if (dto.actions && Object.keys(dto.actions).length === 0) {
            throw new common_1.BadRequestException('At least one action must be specified');
        }
        const updateData = {};
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
    async deletePayRule(id) {
        const payRule = await this.payRuleRepo.findOne({ where: { id } });
        if (!payRule) {
            throw new common_1.NotFoundException(`Pay rule with ID ${id} not found`);
        }
        const calculationsCount = await this.payCalculationRepo.count({
            where: {
                payComponents: (0, typeorm_2.Like)(`%${payRule.name}%`),
            },
        });
        if (calculationsCount > 0) {
            throw new common_1.BadRequestException(`Cannot delete rule "${payRule.name}" - it has been used in ${calculationsCount} pay calculations. Consider deactivating instead.`);
        }
        await this.payRuleRepo.delete(id);
        return { message: 'Pay rule deleted successfully' };
    }
    async togglePayRuleStatus(id) {
        const payRule = await this.payRuleRepo.findOne({ where: { id } });
        if (!payRule) {
            throw new common_1.NotFoundException(`Pay rule with ID ${id} not found`);
        }
        await this.payRuleRepo.update(id, {
            isActive: !payRule.isActive,
        });
        const updated = await this.payRuleRepo.findOne({ where: { id } });
        return {
            is_active: updated.isActive,
            message: `Rule "${updated.name}" ${updated.isActive ? 'activated' : 'deactivated'}`,
        };
    }
    async reorderPayRules(ruleOrders) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            for (const order of ruleOrders) {
                await queryRunner.manager.update(pay_rule_entity_1.PayRule, order.id, {
                    priority: order.priority,
                });
            }
            await queryRunner.commitTransaction();
        }
        catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        }
        finally {
            await queryRunner.release();
        }
        return { message: 'Rule priorities updated successfully' };
    }
    matchesConditions(timeEntry, conditions, context) {
        if (conditions.day_of_week) {
            const dayOfWeek = new Date(timeEntry.clockInTime).getDay();
            if (!conditions.day_of_week.includes(dayOfWeek)) {
                return false;
            }
        }
        if (conditions.time_range) {
            const hour = new Date(timeEntry.clockInTime).getHours();
            const { start, end } = conditions.time_range;
            if (start > end) {
                if (!(hour >= start || hour < end)) {
                    return false;
                }
            }
            else {
                if (!(hour >= start && hour < end)) {
                    return false;
                }
            }
        }
        if (conditions.overtime_threshold !== undefined) {
            const hours = this.calculateEntryHours(timeEntry);
            if (hours <= conditions.overtime_threshold) {
                return false;
            }
        }
        if (conditions.employee_ids && conditions.employee_ids.length > 0) {
            if (!conditions.employee_ids.includes(timeEntry.userId)) {
                return false;
            }
        }
        if (conditions.roles && conditions.roles.length > 0) {
            const hasRole = conditions.roles.some((role) => context.user_roles.includes(role));
            if (!hasRole) {
                return false;
            }
        }
        return true;
    }
    applyActions(timeEntry, actions, ruleName) {
        const components = {};
        const hours = this.calculateEntryHours(timeEntry);
        if (actions.pay_multiplier) {
            const componentName = actions.component_name || ruleName.toLowerCase().replace(/\s+/g, '_');
            components[componentName] = {
                hours,
                multiplier: actions.pay_multiplier,
                type: 'hours',
                rule_name: ruleName,
            };
        }
        if (actions.flat_allowance) {
            const allowanceName = actions.allowance_name || `${ruleName.toLowerCase().replace(/\s+/g, '_')}_allowance`;
            components[allowanceName] = {
                amount: actions.flat_allowance,
                type: 'allowance',
                rule_name: ruleName,
            };
        }
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
    calculateEntryHours(timeEntry) {
        if (!timeEntry.clockInTime || !timeEntry.clockOutTime) {
            return 0;
        }
        const clockIn = new Date(timeEntry.clockInTime);
        const clockOut = new Date(timeEntry.clockOutTime);
        const diffMs = clockOut.getTime() - clockIn.getTime();
        return diffMs / (1000 * 60 * 60);
    }
    calculateRegularHours(totalHours, payComponents) {
        let accountedHours = 0;
        for (const component of Object.values(payComponents)) {
            if (component.type === 'hours' && component.hours) {
                accountedHours += component.hours;
            }
        }
        return Math.max(0, totalHours - accountedHours);
    }
    generateSummary(payComponents) {
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
            }
            else if (multiplier === 1.5) {
                summary.overtime_hours += hours;
            }
            else if (multiplier >= 2.0) {
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
    async calculatePayroll(dto, calculatedById, isSuperUser) {
        if (!isSuperUser) {
            throw new common_1.ForbiddenException('Only Super Users can calculate payroll');
        }
        const startDate = new Date(dto.pay_period_start);
        const endDate = new Date(dto.pay_period_end);
        const where = {
            clockInTime: (0, typeorm_2.Between)(startDate, new Date(endDate.getTime() + 24 * 60 * 60 * 1000)),
            status: 'Closed',
        };
        if (dto.employee_ids && dto.employee_ids.length > 0) {
            where.userId = (0, typeorm_2.In)(dto.employee_ids);
        }
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
            throw new common_1.BadRequestException('No time entries found for the selected criteria');
        }
        const entriesByEmployee = new Map();
        for (const entry of timeEntries) {
            const userId = entry.userId;
            if (!entriesByEmployee.has(userId)) {
                entriesByEmployee.set(userId, []);
            }
            entriesByEmployee.get(userId).push(entry);
        }
        const employeeResults = {};
        for (const [userId, userEntries] of entriesByEmployee) {
            const user = userEntries[0].user;
            const userRoles = await this.userRoleRepo.find({
                where: { userId: userId },
                relations: ['role'],
            });
            const context = {
                user_roles: userRoles.map((ur) => ur.role.name),
                total_entries: userEntries.length,
            };
            const payComponents = {};
            let totalHours = 0;
            for (const entry of userEntries) {
                const entryHours = this.calculateEntryHours(entry);
                totalHours += entryHours;
                for (const rule of payRules) {
                    const conditions = JSON.parse(rule.conditions);
                    const actions = JSON.parse(rule.actions);
                    if (this.matchesConditions(entry, conditions, context)) {
                        const ruleComponents = this.applyActions(entry, actions, rule.name);
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
                                payComponents[componentName].hours += componentData.hours;
                            }
                            if (componentData.amount) {
                                payComponents[componentName].amount += componentData.amount;
                            }
                            if (componentData.rule_name) {
                                payComponents[componentName].rules_applied.push(componentData.rule_name);
                            }
                        }
                    }
                }
            }
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
        const savedCalculations = [];
        if (dto.save_results) {
            for (const [userId, result] of Object.entries(employeeResults)) {
                const userEntries = entriesByEmployee.get(Number(userId));
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
    async getPayCalculations(page = 1, perPage = 20, employeeId) {
        const skip = (page - 1) * perPage;
        const where = {};
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
};
exports.PayrollService = PayrollService;
exports.PayrollService = PayrollService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(pay_calculation_entity_1.PayCalculation)),
    __param(1, (0, typeorm_1.InjectRepository)(pay_code_entity_1.PayCode)),
    __param(2, (0, typeorm_1.InjectRepository)(pay_rule_entity_1.PayRule)),
    __param(3, (0, typeorm_1.InjectRepository)(time_entry_entity_1.TimeEntry)),
    __param(4, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(5, (0, typeorm_1.InjectRepository)(user_role_entity_1.UserRole)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource])
], PayrollService);
//# sourceMappingURL=payroll.service.js.map