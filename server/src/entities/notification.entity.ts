import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { NotificationType } from './notification-type.entity';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'type_id' })
  typeId: number;

  @Column({ length: 200 })
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ name: 'action_url', length: 500, nullable: true })
  actionUrl?: string;

  @Column({ name: 'action_text', length: 50, nullable: true })
  actionText?: string;

  @Column({ name: 'is_read', default: false })
  isRead: boolean;

  @Column({ name: 'read_at', type: 'timestamp', nullable: true })
  readAt?: Date;

  @Column({ length: 10, nullable: true })
  priority?: string;

  @Column({ length: 50, nullable: true })
  category?: string;

  @Column({ name: 'related_entity_type', length: 50, nullable: true })
  relatedEntityType?: string;

  @Column({ name: 'related_entity_id', type: 'int', nullable: true })
  relatedEntityId?: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @Column({ name: 'expires_at', type: 'timestamp', nullable: true })
  expiresAt?: Date;

  @ManyToOne(() => User, (user) => user.notifications)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => NotificationType, (type) => type.notifications)
  @JoinColumn({ name: 'type_id' })
  notificationType: NotificationType;
}
