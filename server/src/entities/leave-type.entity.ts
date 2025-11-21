import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
import { LeaveApplication } from './leave-application.entity';
import { LeaveBalance } from './leave-balance.entity';

@Entity('leave_types')
export class LeaveType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 64, unique: true })
  name: string;

  @Column({ name: 'default_accrual_rate', type: 'float', nullable: true })
  defaultAccrualRate?: number;

  @Column({ length: 255, nullable: true })
  description?: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'requires_approval', default: true })
  requiresApproval: boolean;

  @Column({ name: 'max_consecutive_days', type: 'int', nullable: true })
  maxConsecutiveDays?: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @OneToMany(() => LeaveApplication, (application) => application.leaveType)
  leaveApplications: LeaveApplication[];

  @OneToMany(() => LeaveBalance, (balance) => balance.leaveType)
  leaveBalances: LeaveBalance[];
}
