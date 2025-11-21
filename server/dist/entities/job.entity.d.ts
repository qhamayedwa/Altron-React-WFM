import { Department } from './department.entity';
import { User } from './user.entity';
export declare class Job {
    id: number;
    title: string;
    code: string;
    description?: string;
    departmentId?: number;
    level?: string;
    employmentType?: string;
    minSalary?: number;
    maxSalary?: number;
    requiredSkills?: string;
    requiredExperienceYears?: number;
    educationRequirements?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    department?: Department;
    users: User[];
}
