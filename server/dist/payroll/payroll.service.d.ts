import { Repository, DataSource } from 'typeorm';
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
export declare class PayrollService {
    private payCalculationRepo;
    private payCodeRepo;
    private payRuleRepo;
    private timeEntryRepo;
    private userRepo;
    private userRoleRepo;
    private dataSource;
    constructor(payCalculationRepo: Repository<PayCalculation>, payCodeRepo: Repository<PayCode>, payRuleRepo: Repository<PayRule>, timeEntryRepo: Repository<TimeEntry>, userRepo: Repository<User>, userRoleRepo: Repository<UserRole>, dataSource: DataSource);
    getPayCodes(page?: number, perPage?: number, codeType?: 'absence' | 'payroll', statusFilter?: 'active' | 'inactive'): Promise<{
        pay_codes: PayCode[];
        total: number;
        page: number;
        per_page: number;
        total_pages: number;
    }>;
    getPayCodeById(id: number): Promise<{
        usage_count: number;
        id: number;
        code: string;
        description: string;
        isAbsenceCode: boolean;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        createdById: number;
        configuration?: string;
        createdBy: User;
        timeEntries: TimeEntry[];
        absenceTimeEntries: TimeEntry[];
    }>;
    createPayCode(dto: CreatePayCodeDto, createdById: number): Promise<PayCode>;
    updatePayCode(id: number, dto: UpdatePayCodeDto): Promise<PayCode | null>;
    deletePayCode(id: number): Promise<{
        message: string;
    }>;
    togglePayCodeStatus(id: number): Promise<{
        is_active: boolean;
        message: string;
    }>;
    getAbsenceCodes(): Promise<{
        id: number;
        code: string;
        description: string;
        is_paid: any;
        requires_approval: any;
        max_hours_per_day: any;
        max_consecutive_days: any;
    }[]>;
    getPayRules(page?: number, perPage?: number, statusFilter?: 'active' | 'inactive'): Promise<{
        pay_rules: PayRule[];
        total: number;
        page: number;
        per_page: number;
        total_pages: number;
    }>;
    getPayRuleById(id: number): Promise<PayRule>;
    createPayRule(dto: CreatePayRuleDto, createdById: number): Promise<PayRule | null>;
    updatePayRule(id: number, dto: UpdatePayRuleDto): Promise<PayRule | null>;
    deletePayRule(id: number): Promise<{
        message: string;
    }>;
    togglePayRuleStatus(id: number): Promise<{
        is_active: boolean;
        message: string;
    }>;
    reorderPayRules(ruleOrders: Array<{
        id: number;
        priority: number;
    }>): Promise<{
        message: string;
    }>;
    private matchesConditions;
    private applyActions;
    private calculateEntryHours;
    private calculateRegularHours;
    private generateSummary;
    calculatePayroll(dto: CalculatePayrollDto, calculatedById: number, isSuperUser: boolean): Promise<{
        employee_results: Record<number, PayCalculationResult>;
        summary: {
            regular_hours: number;
            overtime_hours: number;
            double_time_hours: number;
            total_allowances: number;
            shift_differentials: number;
        };
        employee_count: number;
        saved_calculations: PayCalculation[] | null;
    }>;
    getPayCalculations(page?: number, perPage?: number, employeeId?: number): Promise<{
        calculations: PayCalculation[];
        total: number;
        page: number;
        per_page: number;
        total_pages: number;
    }>;
}
