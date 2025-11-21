import { User } from './user.entity';
export declare class WorkflowExecution {
    id: number;
    workflowName: string;
    workflowType: string;
    startedAt?: Date;
    completedAt?: Date;
    status?: string;
    recordsProcessed?: number;
    recordsSuccessful?: number;
    recordsFailed?: number;
    triggeredByUserId?: number;
    executionMode?: string;
    executionLog?: string;
    errorMessage?: string;
    triggeredByUser?: User;
}
