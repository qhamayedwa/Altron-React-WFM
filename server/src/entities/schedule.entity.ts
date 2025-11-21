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
import { ShiftType } from './shift-type.entity';

@Entity('schedules')
export class Schedule {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'shift_type_id', nullable: true })
  shiftTypeId?: number;

  @Column({ name: 'start_time', type: 'timestamp' })
  startTime: Date;

  @Column({ name: 'end_time', type: 'timestamp' })
  endTime: Date;

  @Column({ name: 'assigned_by_manager_id' })
  assignedByManagerId: number;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ name: 'pay_rule_link_id', type: 'int', nullable: true })
  payRuleLinkId?: number;

  @Column({ length: 20 })
  status: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @Column({ name: 'batch_id', length: 50, nullable: true })
  batchId?: string;

  @ManyToOne(() => User, (user) => user.schedules)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => ShiftType, (shiftType) => shiftType.schedules, { nullable: true })
  @JoinColumn({ name: 'shift_type_id' })
  shiftType?: ShiftType;

  @ManyToOne(() => User, (user) => user.assignedSchedules)
  @JoinColumn({ name: 'assigned_by_manager_id' })
  assignedByManager: User;
}
