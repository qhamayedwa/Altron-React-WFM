import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('workflow_configs')
export class WorkflowConfig {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'config_name', length: 100 })
  configName: string;

  @Column({ name: 'config_data', type: 'text' })
  configData: string;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.workflowConfigs)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
