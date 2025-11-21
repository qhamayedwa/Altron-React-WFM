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
import { Department } from './department.entity';
import { User } from './user.entity';

@Entity('jobs')
export class Job {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  title: string;

  @Column({ length: 20, unique: true })
  code: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'department_id', nullable: true })
  departmentId?: number;

  @Column({ length: 50, nullable: true })
  level?: string;

  @Column({ name: 'employment_type', length: 50, nullable: true })
  employmentType?: string;

  @Column({ name: 'min_salary', type: 'float', nullable: true })
  minSalary?: number;

  @Column({ name: 'max_salary', type: 'float', nullable: true })
  maxSalary?: number;

  @Column({ name: 'required_skills', type: 'text', nullable: true })
  requiredSkills?: string;

  @Column({ name: 'required_experience_years', type: 'int', nullable: true })
  requiredExperienceYears?: number;

  @Column({ name: 'education_requirements', type: 'text', nullable: true })
  educationRequirements?: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @ManyToOne(() => Department, (department) => department.jobs, { nullable: true })
  @JoinColumn({ name: 'department_id' })
  department?: Department;

  @OneToMany(() => User, (user) => user.job)
  users: User[];
}
