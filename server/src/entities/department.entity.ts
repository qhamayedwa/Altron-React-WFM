import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Site } from './site.entity';
import { User } from './user.entity';
import { Job } from './job.entity';

@Entity('departments')
export class Department {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'site_id' })
  siteId: number;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 10 })
  code: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'cost_center', length: 20, nullable: true })
  costCenter?: string;

  @Column({ name: 'budget_code', length: 20, nullable: true })
  budgetCode?: string;

  @Column({ name: 'manager_id', nullable: true })
  managerId?: number;

  @Column({ name: 'deputy_manager_id', nullable: true })
  deputyManagerId?: number;

  @Column({ length: 120, nullable: true })
  email?: string;

  @Column({ length: 20, nullable: true })
  phone?: string;

  @Column({ length: 10, nullable: true })
  extension?: string;

  @Column({ name: 'standard_hours_per_day', type: 'float', nullable: true })
  standardHoursPerDay?: number;

  @Column({ name: 'standard_hours_per_week', type: 'float', nullable: true })
  standardHoursPerWeek?: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @ManyToOne(() => Site, (site) => site.departments)
  @JoinColumn({ name: 'site_id' })
  site: Site;

  @ManyToOne(() => User, (user) => user.managedDepartments, { nullable: true })
  @JoinColumn({ name: 'manager_id' })
  manager?: User;

  @ManyToOne(() => User, (user) => user.deputyManagedDepartments, { nullable: true })
  @JoinColumn({ name: 'deputy_manager_id' })
  deputyManager?: User;

  @OneToMany(() => Job, (job) => job.department)
  jobs: Job[];

  @OneToMany(() => User, (user) => user.department)
  users: User[];
}
