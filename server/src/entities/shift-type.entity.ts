import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
import { Schedule } from './schedule.entity';

@Entity('shift_types')
export class ShiftType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 64, unique: true })
  name: string;

  @Column({ name: 'default_start_time', type: 'time' })
  defaultStartTime: Date;

  @Column({ name: 'default_end_time', type: 'time' })
  defaultEndTime: Date;

  @Column({ length: 255, nullable: true })
  description?: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @OneToMany(() => Schedule, (schedule) => schedule.shiftType)
  schedules: Schedule[];
}
