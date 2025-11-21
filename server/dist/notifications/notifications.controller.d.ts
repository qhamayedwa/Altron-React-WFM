import { NotificationsService } from './notifications.service';
import { CreateNotificationDto, UpdateNotificationPreferenceDto, NotificationCategory } from './dto';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    createNotification(dto: CreateNotificationDto): Promise<{
        success: boolean;
        notification: import("../entities/notification.entity").Notification[];
    }>;
    getMyNotifications(req: any, limit?: string, unreadOnly?: string, category?: NotificationCategory): Promise<{
        success: boolean;
        notifications: import("../entities/notification.entity").Notification[];
    }>;
    getUnreadCount(req: any): Promise<{
        success: boolean;
        count: number;
    }>;
    getRecentNotifications(req: any, limit?: string): Promise<{
        success: boolean;
        notifications: import("../entities/notification.entity").Notification[];
    }>;
    markAsRead(id: number, req: any): Promise<{
        success: boolean;
        notification: import("../entities/notification.entity").Notification | null;
    }>;
    markAllAsRead(req: any): Promise<{
        success: boolean;
        count: number;
    }>;
    getNotificationTypes(): Promise<{
        success: boolean;
        types: import("../entities/notification-type.entity").NotificationType[];
    }>;
    getUserPreferences(req: any): Promise<{
        success: boolean;
        preferences: import("../entities/notification-preference.entity").NotificationPreference[];
    }>;
    updatePreference(typeId: number, req: any, dto: UpdateNotificationPreferenceDto): Promise<{
        success: boolean;
        preference: import("../entities/notification-preference.entity").NotificationPreference | import("../entities/notification-preference.entity").NotificationPreference[] | null;
    }>;
    cleanupExpired(): Promise<{
        success: boolean;
        count: number;
    }>;
    createLeaveApprovalNotification(id: number): Promise<{
        success: boolean;
    } | null>;
    createLeaveStatusNotification(id: number, status: string): Promise<{
        success: boolean;
    } | null>;
}
