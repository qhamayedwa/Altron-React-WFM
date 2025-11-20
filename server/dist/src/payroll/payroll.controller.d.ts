import { PayrollService } from './payroll.service';
import { CreatePayCodeDto } from './dto/create-pay-code.dto';
import { UpdatePayCodeDto } from './dto/update-pay-code.dto';
import { CreatePayRuleDto } from './dto/create-pay-rule.dto';
import { UpdatePayRuleDto } from './dto/update-pay-rule.dto';
import { CalculatePayrollDto } from './dto/calculate-payroll.dto';
export declare class PayrollController {
    private readonly payrollService;
    constructor(payrollService: PayrollService);
    getPayCodes(page?: string, perPage?: string, codeType?: 'absence' | 'payroll', statusFilter?: 'active' | 'inactive'): Promise<{
        success: boolean;
        data: {
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
        };
    }>;
    getPayCodeById(id: number): Promise<{
        success: boolean;
        data: {
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
        };
    }>;
    createPayCode(dto: CreatePayCodeDto, req: any): Promise<{
        success: boolean;
        data: {
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
        };
        message: string;
    }>;
    updatePayCode(id: number, dto: UpdatePayCodeDto): Promise<{
        success: boolean;
        data: {
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
        };
        message: string;
    }>;
    deletePayCode(id: number): Promise<{
        success: boolean;
        message: string;
    }>;
    togglePayCodeStatus(id: number): Promise<{
        success: boolean;
        data: {
            is_active: boolean;
        };
        message: string;
    }>;
    getAbsenceCodes(): Promise<{
        success: boolean;
        data: {
            id: number;
            code: string;
            description: string;
            is_paid: any;
            requires_approval: any;
            max_hours_per_day: any;
            max_consecutive_days: any;
        }[];
    }>;
    getPayRules(page?: string, perPage?: string, statusFilter?: 'active' | 'inactive'): Promise<{
        success: boolean;
        data: {
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
        };
    }>;
    getPayRuleById(id: number): Promise<{
        success: boolean;
        data: {
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
        };
    }>;
    createPayRule(dto: CreatePayRuleDto, req: any): Promise<{
        success: boolean;
        data: {
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
        };
        message: string;
    }>;
    updatePayRule(id: number, dto: UpdatePayRuleDto): Promise<{
        success: boolean;
        data: {
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
        };
        message: string;
    }>;
    deletePayRule(id: number): Promise<{
        success: boolean;
        message: string;
    }>;
    togglePayRuleStatus(id: number): Promise<{
        success: boolean;
        data: {
            is_active: boolean;
        };
        message: string;
    }>;
    reorderPayRules(body: {
        rule_orders: Array<{
            id: number;
            priority: number;
        }>;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    calculatePayroll(dto: CalculatePayrollDto, req: any): Promise<{
        success: boolean;
        data: {
            employee_results: Record<number, import("./payroll.service").PayCalculationResult>;
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
        };
        message: string;
    }>;
    getPayCalculations(page?: string, perPage?: string, employeeId?: string): Promise<{
        success: boolean;
        data: {
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
        };
    }>;
}
