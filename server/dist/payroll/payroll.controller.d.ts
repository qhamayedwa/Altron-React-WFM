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
            pay_codes: import("../entities/pay-code.entity").PayCode[];
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
            id: number;
            code: string;
            description: string;
            isAbsenceCode: boolean;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            createdById: number;
            configuration?: string;
            createdBy: import("../entities/user.entity").User;
            timeEntries: import("../entities/time-entry.entity").TimeEntry[];
            absenceTimeEntries: import("../entities/time-entry.entity").TimeEntry[];
        };
    }>;
    createPayCode(dto: CreatePayCodeDto, req: any): Promise<{
        success: boolean;
        data: import("../entities/pay-code.entity").PayCode;
        message: string;
    }>;
    updatePayCode(id: number, dto: UpdatePayCodeDto): Promise<{
        success: boolean;
        data: import("../entities/pay-code.entity").PayCode | null;
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
            pay_rules: import("../entities/pay-rule.entity").PayRule[];
            total: number;
            page: number;
            per_page: number;
            total_pages: number;
        };
    }>;
    getPayRuleById(id: number): Promise<{
        success: boolean;
        data: import("../entities/pay-rule.entity").PayRule;
    }>;
    createPayRule(dto: CreatePayRuleDto, req: any): Promise<{
        success: boolean;
        data: import("../entities/pay-rule.entity").PayRule | null;
        message: string;
    }>;
    updatePayRule(id: number, dto: UpdatePayRuleDto): Promise<{
        success: boolean;
        data: import("../entities/pay-rule.entity").PayRule | null;
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
            saved_calculations: import("../entities/pay-calculation.entity").PayCalculation[] | null;
        };
        message: string;
    }>;
    getPayCalculations(page?: string, perPage?: string, employeeId?: string): Promise<{
        success: boolean;
        data: {
            calculations: import("../entities/pay-calculation.entity").PayCalculation[];
            total: number;
            page: number;
            per_page: number;
            total_pages: number;
        };
    }>;
}
