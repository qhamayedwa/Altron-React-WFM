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
import { LeaveType } from './leave-type.entity';

@Entity('leave_balances')
export class LeaveBalance {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'leave_type_id' })
  leaveTypeId: number;

  @Column({ type: 'float' })
  balance: number;

  @Column({ name: 'accrued_this_year', type: 'float', nullable: true })
  accruedThisYear?: number;

  @Column({ name: 'used_this_year', type: 'float', nullable: true })
  usedThisYear?: number;

  @Column({ name: 'last_accrual_date', type: 'date', nullable: true })
  lastAccrualDate?: Date;

  @Column({ type: 'int' })
  year: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.leaveBalances)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => LeaveType, (leaveType) => leaveType.leaveBalances)
  @JoinColumn({ name: 'leave_type_id' })
  leaveType: LeaveType;
}
