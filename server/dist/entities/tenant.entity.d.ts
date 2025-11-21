import { TenantSetting } from './tenant-setting.entity';
export declare class Tenant {
    id: number;
    name: string;
    subdomain: string;
    domain?: string;
    timezone?: string;
    currency?: string;
    dateFormat?: string;
    timeFormat?: string;
    subscriptionPlan?: string;
    maxUsers?: number;
    isActive: boolean;
    adminEmail: string;
    phone?: string;
    address?: string;
    createdAt: Date;
    updatedAt: Date;
    tenantSettings: TenantSetting[];
}
