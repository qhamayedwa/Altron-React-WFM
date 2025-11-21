import { Company } from './company.entity';
import { Site } from './site.entity';
export declare class Region {
    id: number;
    companyId: number;
    name: string;
    code: string;
    description?: string;
    managerName?: string;
    email?: string;
    phone?: string;
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    stateProvince?: string;
    postalCode?: string;
    timezone?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    company: Company;
    sites: Site[];
}
