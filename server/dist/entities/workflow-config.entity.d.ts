import { User } from './user.entity';
export declare class WorkflowConfig {
    id: number;
    configName: string;
    configData: string;
    userId: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    user: User;
}
