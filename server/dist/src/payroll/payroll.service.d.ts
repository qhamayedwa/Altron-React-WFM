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
export declare class PayrollService {
    private prisma;
    constructor(prisma: PrismaService);
    getPayCodes(page?: number, perPage?: number, codeType?: 'absence' | 'payroll', statusFilter?: 'active' | 'inactive'): Promise<{
        pay_codes: ({
            users: {
                id: number;
                username: string;
                first_name: string | null;
                last_name: string | null;
            };
        } & {
            id: number;
            created_at: Date | null;
            is_active: boolean;
            code: string;
            description: string;
            updated_at: Date | null;
            is_absence_code: boolean;
            configuration: string | null;
            created_by_id: number;
        })[];
        total: number;
        page: number;
        per_page: number;
        total_pages: number;
    }>;
    getPayCodeById(id: number): Promise<{
        usage_count: number;
        users: {
            id: number;
            username: string;
            first_name: string | null;
            last_name: string | null;
        };
        id: number;
        created_at: Date | null;
        is_active: boolean;
        code: string;
        description: string;
        updated_at: Date | null;
        is_absence_code: boolean;
        configuration: string | null;
        created_by_id: number;
    }>;
    createPayCode(dto: CreatePayCodeDto, createdById: number): Promise<{
        users: {
            id: number;
            username: string;
            first_name: string | null;
            last_name: string | null;
        };
    } & {
        id: number;
        created_at: Date | null;
        is_active: boolean;
        code: string;
        description: string;
        updated_at: Date | null;
        is_absence_code: boolean;
        configuration: string | null;
        created_by_id: number;
    }>;
    updatePayCode(id: number, dto: UpdatePayCodeDto): Promise<{
        users: {
            id: number;
            username: string;
            first_name: string | null;
            last_name: string | null;
        };
    } & {
        id: number;
        created_at: Date | null;
        is_active: boolean;
        code: string;
        description: string;
        updated_at: Date | null;
        is_absence_code: boolean;
        configuration: string | null;
        created_by_id: number;
    }>;
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
        pay_rules: ({
            users: {
                id: number;
                username: string;
                first_name: string | null;
                last_name: string | null;
            };
        } & {
            id: number;
            created_at: Date | null;
            is_active: boolean;
            name: string;
            description: string | null;
            updated_at: Date | null;
            priority: number;
            conditions: string;
            actions: string;
            created_by_id: number;
        })[];
        total: number;
        page: number;
        per_page: number;
        total_pages: number;
    }>;
    getPayRuleById(id: number): Promise<{
        users: {
            id: number;
            username: string;
            first_name: string | null;
            last_name: string | null;
        };
    } & {
        id: number;
        created_at: Date | null;
        is_active: boolean;
        name: string;
        description: string | null;
        updated_at: Date | null;
        priority: number;
        conditions: string;
        actions: string;
        created_by_id: number;
    }>;
    createPayRule(dto: CreatePayRuleDto, createdById: number): Promise<{
        users: {
            id: number;
            username: string;
            first_name: string | null;
            last_name: string | null;
        };
    } & {
        id: number;
        created_at: Date | null;
        is_active: boolean;
        name: string;
        description: string | null;
        updated_at: Date | null;
        priority: number;
        conditions: string;
        actions: string;
        created_by_id: number;
    }>;
    updatePayRule(id: number, dto: UpdatePayRuleDto): Promise<{
        users: {
            id: number;
            username: string;
            first_name: string | null;
            last_name: string | null;
        };
    } & {
        id: number;
        created_at: Date | null;
        is_active: boolean;
        name: string;
        description: string | null;
        updated_at: Date | null;
        priority: number;
        conditions: string;
        actions: string;
        created_by_id: number;
    }>;
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
        saved_calculations: {
            id: number;
            user_id: number;
            pay_period_start: Date;
            pay_period_end: Date;
            regular_hours: number | null;
            pay_components: string;
            total_hours: number | null;
            overtime_hours: number | null;
            double_time_hours: number | null;
            total_allowances: number | null;
            calculated_at: Date | null;
            time_entry_id: number;
            calculated_by_id: number;
        }[] | null;
    }>;
    getPayCalculations(page?: number, perPage?: number, employeeId?: number): Promise<{
        calculations: ({
            users_pay_calculations_calculated_by_idTousers: {
                id: number;
                username: string;
            };
            users_pay_calculations_user_idTousers: {
                id: number;
                username: string;
                first_name: string | null;
                last_name: string | null;
            };
        } & {
            id: number;
            user_id: number;
            pay_period_start: Date;
            pay_period_end: Date;
            regular_hours: number | null;
            pay_components: string;
            total_hours: number | null;
            overtime_hours: number | null;
            double_time_hours: number | null;
            total_allowances: number | null;
            calculated_at: Date | null;
            time_entry_id: number;
            calculated_by_id: number;
        })[];
        total: number;
        page: number;
        per_page: number;
        total_pages: number;
    }>;
}
