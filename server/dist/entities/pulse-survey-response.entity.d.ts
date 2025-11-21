import { User } from './user.entity';
import { PulseSurvey } from './pulse-survey.entity';
export declare class PulseSurveyResponse {
    id: number;
    surveyId: number;
    userId: number;
    responses: string;
    submittedAt?: Date;
    survey: PulseSurvey;
    user: User;
}
