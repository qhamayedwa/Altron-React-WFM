import { User } from './user.entity';
export declare class DashboardConfig {
    id: number;
    configName?: string;
    configData: string;
    createdBy: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    createdByUser: User;
}
