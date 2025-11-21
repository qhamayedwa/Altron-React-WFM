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
import { Department } from './department.entity';
import { Job } from './job.entity';
import { TimeEntry } from './time-entry.entity';
import { LeaveApplication } from './leave-application.entity';
import { LeaveBalance } from './leave-balance.entity';
import { Schedule } from './schedule.entity';
import { Notification } from './notification.entity';
import { NotificationPreference } from './notification-preference.entity';
import { DashboardConfig } from './dashboard-config.entity';
import { PayCalculation } from './pay-calculation.entity';
import { PayCode } from './pay-code.entity';
import { PayRule } from './pay-rule.entity';
import { Post } from './post.entity';
import { PulseSurvey } from './pulse-survey.entity';
import { PulseSurveyResponse } from './pulse-survey-response.entity';
import { UserRole } from './user-role.entity';
import { WorkflowConfig } from './workflow-config.entity';
import { WorkflowExecution } from './workflow-execution.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 64, unique: true })
  username: string;

  @Column({ length: 120, unique: true })
  email: string;

  @Column({ name: 'password_hash', length: 256 })
  passwordHash: string;

  @Column({ name: 'first_name', length: 50, nullable: true })
  firstName?: string;

  @Column({ name: 'last_name', length: 50, nullable: true })
  lastName?: string;

  @Column({ length: 20, nullable: true })
  phone?: string;

  @Column({ name: 'department_id', nullable: true })
  departmentId?: number;

  @Column({ name: 'job_id', nullable: true })
  jobId?: number;

  @Column({ name: 'manager_id', nullable: true })
  managerId?: number;

  @Column({ name: 'employee_number', length: 20, nullable: true })
  employeeNumber?: string;

  @Column({ type: 'date', name: 'hire_date', nullable: true })
  hireDate?: Date;

  @Column({ type: 'date', name: 'termination_date', nullable: true })
  terminationDate?: Date;

  @Column({ name: 'employment_status', length: 20, nullable: true })
  employmentStatus?: string;

  @Column({ name: 'employment_type', length: 20, nullable: true })
  employmentType?: string;

  @Column({ name: 'work_schedule', length: 20, nullable: true })
  workSchedule?: string;

  @Column({ type: 'float', name: 'standard_hours_per_week', nullable: true })
  standardHoursPerWeek?: number;

  @Column({ type: 'float', name: 'hourly_rate', nullable: true })
  hourlyRate?: number;

  @Column({ type: 'float', name: 'annual_salary', nullable: true })
  annualSalary?: number;

  @Column({ name: 'pay_frequency', length: 20, nullable: true })
  payFrequency?: string;

  @Column({ name: 'bank_name', length: 100, nullable: true })
  bankName?: string;

  @Column({ name: 'bank_account_number', length: 50, nullable: true })
  bankAccountNumber?: string;

  @Column({ name: 'bank_branch_code', length: 20, nullable: true })
  bankBranchCode?: string;

  @Column({ name: 'tax_id', length: 50, nullable: true })
  taxId?: string;

  @Column({ type: 'date', name: 'date_of_birth', nullable: true })
  dateOfBirth?: Date;

  @Column({ length: 10, nullable: true })
  gender?: string;

  @Column({ name: 'nationality', length: 50, nullable: true })
  nationality?: string;

  @Column({ name: 'id_number', length: 20, nullable: true })
  idNumber?: string;

  @Column({ name: 'passport_number', length: 20, nullable: true })
  passportNumber?: string;

  @Column({ name: 'address_line1', length: 100, nullable: true })
  addressLine1?: string;

  @Column({ name: 'address_line2', length: 100, nullable: true })
  addressLine2?: string;

  @Column({ length: 50, nullable: true })
  city?: string;

  @Column({ name: 'state_province', length: 50, nullable: true })
  stateProvince?: string;

  @Column({ name: 'postal_code', length: 20, nullable: true })
  postalCode?: string;

  @Column({ length: 50, nullable: true })
  country?: string;

  @Column({ name: 'emergency_contact_name', length: 100, nullable: true })
  emergencyContactName?: string;

  @Column({ name: 'emergency_contact_phone', length: 20, nullable: true })
  emergencyContactPhone?: string;

  @Column({ name: 'emergency_contact_relationship', length: 50, nullable: true })
  emergencyContactRelationship?: string;

  @Column({ name: 'profile_picture_url', length: 255, nullable: true })
  profilePictureUrl?: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'last_login', type: 'timestamp', nullable: true })
  lastLogin?: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Department, (department) => department.users, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'department_id' })
  department?: Department;

  @ManyToOne(() => Job, (job) => job.users, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'job_id' })
  job?: Job;

  @ManyToOne(() => User, (user) => user.subordinates, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'manager_id' })
  manager?: User;

  @OneToMany(() => User, (user) => user.manager)
  subordinates: User[];

  @OneToMany(() => Department, (department) => department.manager)
  managedDepartments: Department[];

  @OneToMany(() => Department, (department) => department.deputyManager)
  deputyManagedDepartments: Department[];

  @OneToMany(() => TimeEntry, (timeEntry) => timeEntry.user)
  timeEntries: TimeEntry[];

  @OneToMany(() => LeaveApplication, (leaveApp) => leaveApp.user)
  leaveApplications: LeaveApplication[];

  @OneToMany(() => LeaveApplication, (leaveApp) => leaveApp.managerApproved)
  approvedLeaveApplications: LeaveApplication[];

  @OneToMany(() => LeaveBalance, (balance) => balance.user)
  leaveBalances: LeaveBalance[];

  @OneToMany(() => Schedule, (schedule) => schedule.user)
  schedules: Schedule[];

  @OneToMany(() => Notification, (notification) => notification.user)
  notifications: Notification[];

  @OneToMany(() => DashboardConfig, (config) => config.createdByUser)
  dashboardConfigs: DashboardConfig[];

  @OneToMany(() => PayCalculation, (calc) => calc.user)
  payCalculations: PayCalculation[];

  @OneToMany(() => PulseSurveyResponse, (response) => response.user)
  pulseSurveyResponses: PulseSurveyResponse[];

  @OneToMany(() => UserRole, (userRole) => userRole.user)
  userRoles: UserRole[];

  @OneToMany(() => Schedule, (schedule) => schedule.assignedByManager)
  assignedSchedules: Schedule[];

  @OneToMany(() => TimeEntry, (timeEntry) => timeEntry.approvedByManager)
  approvedTimeEntries: TimeEntry[];

  @OneToMany(() => TimeEntry, (timeEntry) => timeEntry.absenceApprovedBy)
  absenceApprovedTimeEntries: TimeEntry[];

  @OneToMany(() => PayCalculation, (calc) => calc.calculatedBy)
  calculatedPayCalculations: PayCalculation[];

  @OneToMany(() => Post, (post) => post.user)
  posts: Post[];

  @OneToMany(() => PulseSurvey, (survey) => survey.createdBy)
  createdPulseSurveys: PulseSurvey[];

  @OneToMany(() => NotificationPreference, (pref) => pref.user)
  notificationPreferences: NotificationPreference[];

  @OneToMany(() => PayCode, (payCode) => payCode.createdBy)
  payCodes: PayCode[];

  @OneToMany(() => PayRule, (payRule) => payRule.createdBy)
  payRules: PayRule[];

  @OneToMany(() => WorkflowConfig, (config) => config.user)
  workflowConfigs: WorkflowConfig[];

  @OneToMany(() => WorkflowExecution, (execution) => execution.triggeredByUser)
  workflowExecutions: WorkflowExecution[];
}
