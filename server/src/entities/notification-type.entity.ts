import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
import { Notification } from './notification.entity';
import { NotificationPreference } from './notification-preference.entity';

@Entity('notification_types')
export class NotificationType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, unique: true })
  name: string;

  @Column({ name: 'display_name', length: 100 })
  displayName: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ length: 50, nullable: true })
  icon?: string;

  @Column({ length: 20, nullable: true })
  color?: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ length: 10, nullable: true })
  priority?: string;

  @Column({ name: 'auto_clear_hours', type: 'int', nullable: true })
  autoClearHours?: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @OneToMany(() => Notification, (notification) => notification.notificationType)
  notifications: Notification[];

  @OneToMany(() => NotificationPreference, (preference) => preference.notificationType)
  notificationPreferences: NotificationPreference[];
}
