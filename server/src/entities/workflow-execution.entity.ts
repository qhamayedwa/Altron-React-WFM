import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('workflow_executions')
export class WorkflowExecution {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'workflow_name', length: 50 })
  workflowName: string;

  @Column({ name: 'workflow_type', length: 30 })
  workflowType: string;

  @Column({ name: 'started_at', type: 'timestamp', nullable: true })
  startedAt?: Date;

  @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
  completedAt?: Date;

  @Column({ length: 20, nullable: true })
  status?: string;

  @Column({ name: 'records_processed', type: 'int', nullable: true })
  recordsProcessed?: number;

  @Column({ name: 'records_successful', type: 'int', nullable: true })
  recordsSuccessful?: number;

  @Column({ name: 'records_failed', type: 'int', nullable: true })
  recordsFailed?: number;

  @Column({ name: 'triggered_by_user_id', nullable: true })
  triggeredByUserId?: number;

  @Column({ name: 'execution_mode', length: 20, nullable: true })
  executionMode?: string;

  @Column({ name: 'execution_log', type: 'text', nullable: true })
  executionLog?: string;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage?: string;

  @ManyToOne(() => User, (user) => user.workflowExecutions, { nullable: true })
  @JoinColumn({ name: 'triggered_by_user_id' })
  triggeredByUser?: User;
}
