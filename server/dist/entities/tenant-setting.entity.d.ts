import { Tenant } from './tenant.entity';
export declare class TenantSetting {
    id: number;
    tenantId: number;
    companyLogoUrl?: string;
    primaryColor?: string;
    secondaryColor?: string;
    enableGeolocation: boolean;
    enableOvertimeAlerts: boolean;
    enableLeaveWorkflow: boolean;
    enablePayrollIntegration: boolean;
    enableAiScheduling: boolean;
    defaultPayFrequency?: string;
    overtimeThreshold?: number;
    weekendOvertimeRate?: number;
    holidayOvertimeRate?: number;
    defaultAnnualLeaveDays?: number;
    defaultSickLeaveDays?: number;
    leaveApprovalRequired: boolean;
    emailNotifications: boolean;
    smsNotifications: boolean;
    createdAt: Date;
    updatedAt: Date;
    tenant: Tenant;
}
