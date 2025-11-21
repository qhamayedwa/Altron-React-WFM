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
import { NotificationType } from './notification-type.entity';

@Entity('notification_preferences')
export class NotificationPreference {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'type_id' })
  typeId: number;

  @Column({ name: 'web_enabled', default: true })
  webEnabled: boolean;

  @Column({ name: 'email_enabled', default: false })
  emailEnabled: boolean;

  @Column({ name: 'sms_enabled', default: false })
  smsEnabled: boolean;

  @Column({ default: true })
  immediate: boolean;

  @Column({ name: 'daily_digest', default: false })
  dailyDigest: boolean;

  @Column({ name: 'weekly_digest', default: false })
  weeklyDigest: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.notificationPreferences)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => NotificationType, (type) => type.notificationPreferences)
  @JoinColumn({ name: 'type_id' })
  notificationType: NotificationType;
}
