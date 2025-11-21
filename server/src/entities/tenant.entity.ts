import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TenantSetting } from './tenant-setting.entity';

@Entity('tenants')
export class Tenant {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 50, unique: true })
  subdomain: string;

  @Column({ length: 100, nullable: true })
  domain?: string;

  @Column({ length: 50, nullable: true })
  timezone?: string;

  @Column({ length: 3, nullable: true })
  currency?: string;

  @Column({ name: 'date_format', length: 20, nullable: true })
  dateFormat?: string;

  @Column({ name: 'time_format', length: 20, nullable: true })
  timeFormat?: string;

  @Column({ name: 'subscription_plan', length: 50, nullable: true })
  subscriptionPlan?: string;

  @Column({ name: 'max_users', type: 'int', nullable: true })
  maxUsers?: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'admin_email', length: 120 })
  adminEmail: string;

  @Column({ length: 20, nullable: true })
  phone?: string;

  @Column({ type: 'text', nullable: true })
  address?: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @OneToMany(() => TenantSetting, (setting) => setting.tenant)
  tenantSettings: TenantSetting[];
}
