import { User } from './user.entity';
import { NotificationType } from './notification-type.entity';
export declare class NotificationPreference {
    id: number;
    userId: number;
    typeId: number;
    webEnabled: boolean;
    emailEnabled: boolean;
    smsEnabled: boolean;
    immediate: boolean;
    dailyDigest: boolean;
    weeklyDigest: boolean;
    createdAt: Date;
    updatedAt: Date;
    user: User;
    notificationType: NotificationType;
}
