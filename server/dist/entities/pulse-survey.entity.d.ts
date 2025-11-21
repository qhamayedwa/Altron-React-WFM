import { User } from './user.entity';
import { PulseSurveyResponse } from './pulse-survey-response.entity';
export declare class PulseSurvey {
    id: number;
    title: string;
    description?: string;
    createdById: number;
    createdAt: Date;
    endsAt: Date;
    isActive: boolean;
    isAnonymous: boolean;
    targetDepartment?: string;
    createdBy: User;
    pulseSurveyResponses: PulseSurveyResponse[];
}
