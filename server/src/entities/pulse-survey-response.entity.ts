import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { PulseSurvey } from './pulse-survey.entity';

@Entity('pulse_survey_responses')
export class PulseSurveyResponse {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'survey_id' })
  surveyId: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ type: 'text' })
  responses: string;

  @Column({ name: 'submitted_at', type: 'timestamp', nullable: true })
  submittedAt?: Date;

  @ManyToOne(() => PulseSurvey, (survey) => survey.pulseSurveyResponses)
  @JoinColumn({ name: 'survey_id' })
  survey: PulseSurvey;

  @ManyToOne(() => User, (user) => user.pulseSurveyResponses)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
