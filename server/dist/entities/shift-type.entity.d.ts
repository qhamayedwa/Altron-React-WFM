import { Schedule } from './schedule.entity';
export declare class ShiftType {
    id: number;
    name: string;
    defaultStartTime: Date;
    defaultEndTime: Date;
    description?: string;
    isActive: boolean;
    createdAt: Date;
    schedules: Schedule[];
}
