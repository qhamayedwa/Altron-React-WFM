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

@Entity('leave_applications')
export class LeaveApplication {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'leave_type_id' })
  leaveTypeId: number;

  @Column({ name: 'start_date', type: 'date' })
  startDate: Date;

  @Column({ name: 'end_date', type: 'date' })
  endDate: Date;

  @Column({ type: 'text', nullable: true })
  reason?: string;

  @Column({ length: 20 })
  status: string;

  @Column({ name: 'is_hourly', default: false })
  isHourly: boolean;

  @Column({ name: 'hours_requested', type: 'float', nullable: true })
  hoursRequested?: number;

  @Column({ name: 'manager_approved_id', nullable: true })
  managerApprovedId?: number;

  @Column({ name: 'manager_comments', type: 'text', nullable: true })
  managerComments?: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @Column({ name: 'approved_at', type: 'timestamp', nullable: true })
  approvedAt?: Date;

  @ManyToOne(() => User, (user) => user.leaveApplications)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => LeaveType, (leaveType) => leaveType.leaveApplications)
  @JoinColumn({ name: 'leave_type_id' })
  leaveType: LeaveType;

  @ManyToOne(() => User, (user) => user.approvedLeaveApplications, { nullable: true })
  @JoinColumn({ name: 'manager_approved_id' })
  managerApproved?: User;
}
