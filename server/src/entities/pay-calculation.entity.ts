import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { TimeEntry } from './time-entry.entity';

@Entity('pay_calculations')
export class PayCalculation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'time_entry_id' })
  timeEntryId: number;

  @Column({ name: 'pay_period_start', type: 'date' })
  payPeriodStart: Date;

  @Column({ name: 'pay_period_end', type: 'date' })
  payPeriodEnd: Date;

  @Column({ name: 'pay_components', type: 'text' })
  payComponents: string;

  @Column({ name: 'total_hours', type: 'float', nullable: true })
  totalHours?: number;

  @Column({ name: 'regular_hours', type: 'float', nullable: true })
  regularHours?: number;

  @Column({ name: 'overtime_hours', type: 'float', nullable: true })
  overtimeHours?: number;

  @Column({ name: 'double_time_hours', type: 'float', nullable: true })
  doubleTimeHours?: number;

  @Column({ name: 'total_allowances', type: 'float', nullable: true })
  totalAllowances?: number;

  @Column({ name: 'calculated_at', type: 'timestamp', nullable: true })
  calculatedAt?: Date;

  @Column({ name: 'calculated_by_id' })
  calculatedById: number;

  @ManyToOne(() => User, (user) => user.payCalculations)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => TimeEntry, (timeEntry) => timeEntry.payCalculations)
  @JoinColumn({ name: 'time_entry_id' })
  timeEntry: TimeEntry;

  @ManyToOne(() => User, (user) => user.calculatedPayCalculations)
  @JoinColumn({ name: 'calculated_by_id' })
  calculatedBy: User;
}
