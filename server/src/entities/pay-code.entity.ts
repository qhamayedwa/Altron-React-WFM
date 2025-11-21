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
import { TimeEntry } from './time-entry.entity';

@Entity('pay_codes')
export class PayCode {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 32, unique: true })
  code: string;

  @Column({ length: 255 })
  description: string;

  @Column({ name: 'is_absence_code' })
  isAbsenceCode: boolean;

  @Column({ name: 'is_active' })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @Column({ name: 'created_by_id' })
  createdById: number;

  @Column({ type: 'text', nullable: true })
  configuration?: string;

  @ManyToOne(() => User, (user) => user.payRules)
  @JoinColumn({ name: 'created_by_id' })
  createdBy: User;

  @OneToMany(() => TimeEntry, (timeEntry) => timeEntry.payCode)
  timeEntries: TimeEntry[];

  @OneToMany(() => TimeEntry, (timeEntry) => timeEntry.absencePayCode)
  absenceTimeEntries: TimeEntry[];
}
