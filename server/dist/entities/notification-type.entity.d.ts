import { Notification } from './notification.entity';
import { NotificationPreference } from './notification-preference.entity';
export declare class NotificationType {
    id: number;
    name: string;
    displayName: string;
    description?: string;
    icon?: string;
    color?: string;
    isActive: boolean;
    priority?: string;
    autoClearHours?: number;
    createdAt: Date;
    notifications: Notification[];
    notificationPreferences: NotificationPreference[];
}
