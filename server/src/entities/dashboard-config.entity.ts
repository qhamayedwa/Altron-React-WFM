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

@Entity('dashboard_configs')
export class DashboardConfig {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'config_name', length: 100, nullable: true })
  configName?: string;

  @Column({ name: 'config_data', type: 'text' })
  configData: string;

  @Column({ name: 'created_by' })
  createdBy: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.dashboardConfigs)
  @JoinColumn({ name: 'created_by' })
  createdByUser: User;
}
