import { Site } from './site.entity';
import { User } from './user.entity';
import { Job } from './job.entity';
export declare class Department {
    id: number;
    siteId: number;
    name: string;
    code: string;
    description?: string;
    costCenter?: string;
    budgetCode?: string;
    managerId?: number;
    deputyManagerId?: number;
    email?: string;
    phone?: string;
    extension?: string;
    standardHoursPerDay?: number;
    standardHoursPerWeek?: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    site: Site;
    manager?: User;
    deputyManager?: User;
    jobs: Job[];
    users: User[];
}
