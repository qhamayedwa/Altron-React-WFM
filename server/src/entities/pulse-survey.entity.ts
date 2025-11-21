import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { PulseSurveyResponse } from './pulse-survey-response.entity';

@Entity('pulse_surveys')
export class PulseSurvey {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 200 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'created_by_id' })
  createdById: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @Column({ name: 'ends_at', type: 'timestamp' })
  endsAt: Date;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'is_anonymous', default: false })
  isAnonymous: boolean;

  @Column({ name: 'target_department', length: 64, nullable: true })
  targetDepartment?: string;

  @ManyToOne(() => User, (user) => user.createdPulseSurveys)
  @JoinColumn({ name: 'created_by_id' })
  createdBy: User;

  @OneToMany(() => PulseSurveyResponse, (response) => response.survey)
  pulseSurveyResponses: PulseSurveyResponse[];
}
