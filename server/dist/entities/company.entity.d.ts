import { Region } from './region.entity';
export declare class Company {
    id: number;
    name: string;
    code: string;
    legalName?: string;
    registrationNumber?: string;
    taxNumber?: string;
    email?: string;
    phone?: string;
    website?: string;
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    stateProvince?: string;
    postalCode?: string;
    country?: string;
    timezone?: string;
    currency?: string;
    fiscalYearStart?: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    regions: Region[];
}
