import { User } from './user.entity';
export declare class PayRule {
    id: number;
    name: string;
    description?: string;
    conditions: string;
    actions: string;
    priority: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    createdById: number;
    createdBy: User;
}
