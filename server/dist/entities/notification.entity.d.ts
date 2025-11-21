import { User } from './user.entity';
import { NotificationType } from './notification-type.entity';
export declare class Notification {
    id: number;
    userId: number;
    typeId: number;
    title: string;
    message: string;
    actionUrl?: string;
    actionText?: string;
    isRead: boolean;
    readAt?: Date;
    priority?: string;
    category?: string;
    relatedEntityType?: string;
    relatedEntityId?: number;
    createdAt: Date;
    expiresAt?: Date;
    user: User;
    notificationType: NotificationType;
}
