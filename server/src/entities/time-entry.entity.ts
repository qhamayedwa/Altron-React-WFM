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
import { User } from './user.entity';
import { PayCode } from './pay-code.entity';
import { PayCalculation } from './pay-calculation.entity';

@Entity('time_entries')
export class TimeEntry {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'clock_in_time', type: 'timestamp' })
  clockInTime: Date;

  @Column({ name: 'clock_out_time', type: 'timestamp', nullable: true })
  clockOutTime?: Date;

  @Column({ length: 20 })
  status: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ name: 'approved_by_manager_id', nullable: true })
  approvedByManagerId?: number;

  @Column({ name: 'is_overtime_approved', default: false })
  isOvertimeApproved: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @Column({ name: 'clock_in_latitude', type: 'float', nullable: true })
  clockInLatitude?: number;

  @Column({ name: 'clock_in_longitude', type: 'float', nullable: true })
  clockInLongitude?: number;

  @Column({ name: 'clock_out_latitude', type: 'float', nullable: true })
  clockOutLatitude?: number;

  @Column({ name: 'clock_out_longitude', type: 'float', nullable: true })
  clockOutLongitude?: number;

  @Column({ name: 'break_start_time', type: 'timestamp', nullable: true })
  breakStartTime?: Date;

  @Column({ name: 'break_end_time', type: 'timestamp', nullable: true })
  breakEndTime?: Date;

  @Column({ name: 'total_break_minutes', type: 'int', nullable: true })
  totalBreakMinutes?: number;

  @Column({ name: 'absence_pay_code_id', nullable: true })
  absencePayCodeId?: number;

  @Column({ name: 'absence_reason', type: 'text', nullable: true })
  absenceReason?: string;

  @Column({ name: 'absence_approved_by_id', nullable: true })
  absenceApprovedById?: number;

  @Column({ name: 'absence_approved_at', type: 'timestamp', nullable: true })
  absenceApprovedAt?: Date;

  @Column({ name: 'pay_code_id', nullable: true })
  payCodeId?: number;

  @ManyToOne(() => User, (user) => user.timeEntries)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => User, (user) => user.approvedTimeEntries, { nullable: true })
  @JoinColumn({ name: 'approved_by_manager_id' })
  approvedByManager?: User;

  @ManyToOne(() => User, (user) => user.absenceApprovedTimeEntries, { nullable: true })
  @JoinColumn({ name: 'absence_approved_by_id' })
  absenceApprovedBy?: User;

  @ManyToOne(() => PayCode, (payCode) => payCode.timeEntries, { nullable: true })
  @JoinColumn({ name: 'pay_code_id' })
  payCode?: PayCode;

  @ManyToOne(() => PayCode, (payCode) => payCode.absenceTimeEntries, { nullable: true })
  @JoinColumn({ name: 'absence_pay_code_id' })
  absencePayCode?: PayCode;

  @OneToMany(() => PayCalculation, (calculation) => calculation.timeEntry)
  payCalculations: PayCalculation[];
}
