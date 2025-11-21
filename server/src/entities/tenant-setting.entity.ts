import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Tenant } from './tenant.entity';

@Entity('tenant_settings')
export class TenantSetting {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'tenant_id' })
  tenantId: number;

  @Column({ name: 'company_logo_url', length: 255, nullable: true })
  companyLogoUrl?: string;

  @Column({ name: 'primary_color', length: 7, nullable: true })
  primaryColor?: string;

  @Column({ name: 'secondary_color', length: 7, nullable: true })
  secondaryColor?: string;

  @Column({ name: 'enable_geolocation', default: false })
  enableGeolocation: boolean;

  @Column({ name: 'enable_overtime_alerts', default: false })
  enableOvertimeAlerts: boolean;

  @Column({ name: 'enable_leave_workflow', default: true })
  enableLeaveWorkflow: boolean;

  @Column({ name: 'enable_payroll_integration', default: false })
  enablePayrollIntegration: boolean;

  @Column({ name: 'enable_ai_scheduling', default: false })
  enableAiScheduling: boolean;

  @Column({ name: 'default_pay_frequency', length: 20, nullable: true })
  defaultPayFrequency?: string;

  @Column({ name: 'overtime_threshold', type: 'int', nullable: true })
  overtimeThreshold?: number;

  @Column({ name: 'weekend_overtime_rate', type: 'float', nullable: true })
  weekendOvertimeRate?: number;

  @Column({ name: 'holiday_overtime_rate', type: 'float', nullable: true })
  holidayOvertimeRate?: number;

  @Column({ name: 'default_annual_leave_days', type: 'int', nullable: true })
  defaultAnnualLeaveDays?: number;

  @Column({ name: 'default_sick_leave_days', type: 'int', nullable: true })
  defaultSickLeaveDays?: number;

  @Column({ name: 'leave_approval_required', default: true })
  leaveApprovalRequired: boolean;

  @Column({ name: 'email_notifications', default: true })
  emailNotifications: boolean;

  @Column({ name: 'sms_notifications', default: false })
  smsNotifications: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @ManyToOne(() => Tenant, (tenant) => tenant.tenantSettings)
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;
}
