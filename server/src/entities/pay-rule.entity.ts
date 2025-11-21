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

@Entity('pay_rules')
export class PayRule {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 128, unique: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'text' })
  conditions: string;

  @Column({ type: 'text' })
  actions: string;

  @Column({ type: 'int' })
  priority: number;

  @Column({ name: 'is_active' })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @Column({ name: 'created_by_id' })
  createdById: number;

  @ManyToOne(() => User, (user) => user.payRules)
  @JoinColumn({ name: 'created_by_id' })
  createdBy: User;
}
