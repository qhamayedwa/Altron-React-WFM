import { NotificationsService } from './notifications.service';
import { CreateNotificationDto, UpdateNotificationPreferenceDto, NotificationCategory } from './dto';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    createNotification(dto: CreateNotificationDto): Promise<{
        success: boolean;
        notification: {
            id: number;
            created_at: Date | null;
            user_id: number;
            message: string;
            priority: string | null;
            title: string;
            action_url: string | null;
            action_text: string | null;
            category: string | null;
            related_entity_type: string | null;
            related_entity_id: number | null;
            type_id: number;
            is_read: boolean | null;
            read_at: Date | null;
            expires_at: Date | null;
        };
    }>;
    getMyNotifications(req: any, limit?: string, unreadOnly?: string, category?: NotificationCategory): Promise<{
        success: boolean;
        notifications: ({
            notification_types: {
                id: number;
                created_at: Date | null;
                is_active: boolean | null;
                name: string;
                description: string | null;
                priority: string | null;
                display_name: string;
                icon: string | null;
                color: string | null;
                auto_clear_hours: number | null;
            };
            users: {
                id: number;
                username: string;
                first_name: string | null;
                last_name: string | null;
            };
        } & {
            id: number;
            created_at: Date | null;
            user_id: number;
            message: string;
            priority: string | null;
            title: string;
            action_url: string | null;
            action_text: string | null;
            category: string | null;
            related_entity_type: string | null;
            related_entity_id: number | null;
            type_id: number;
            is_read: boolean | null;
            read_at: Date | null;
            expires_at: Date | null;
        })[];
    }>;
    getUnreadCount(req: any): Promise<{
        success: boolean;
        count: number;
    }>;
    getRecentNotifications(req: any, limit?: string): Promise<{
        success: boolean;
        notifications: ({
            notification_types: {
                id: number;
                created_at: Date | null;
                is_active: boolean | null;
                name: string;
                description: string | null;
                priority: string | null;
                display_name: string;
                icon: string | null;
                color: string | null;
                auto_clear_hours: number | null;
            };
            users: {
                id: number;
                username: string;
                first_name: string | null;
                last_name: string | null;
            };
        } & {
            id: number;
            created_at: Date | null;
            user_id: number;
            message: string;
            priority: string | null;
            title: string;
            action_url: string | null;
            action_text: string | null;
            category: string | null;
            related_entity_type: string | null;
            related_entity_id: number | null;
            type_id: number;
            is_read: boolean | null;
            read_at: Date | null;
            expires_at: Date | null;
        })[];
    }>;
    markAsRead(id: number, req: any): Promise<{
        success: boolean;
        notification: {
            id: number;
            created_at: Date | null;
            user_id: number;
            message: string;
            priority: string | null;
            title: string;
            action_url: string | null;
            action_text: string | null;
            category: string | null;
            related_entity_type: string | null;
            related_entity_id: number | null;
            type_id: number;
            is_read: boolean | null;
            read_at: Date | null;
            expires_at: Date | null;
        };
    }>;
    markAllAsRead(req: any): Promise<{
        success: boolean;
        count: number;
    }>;
    getNotificationTypes(): Promise<{
        success: boolean;
        types: {
            id: number;
            created_at: Date | null;
            is_active: boolean | null;
            name: string;
            description: string | null;
            priority: string | null;
            display_name: string;
            icon: string | null;
            color: string | null;
            auto_clear_hours: number | null;
        }[];
    }>;
    getUserPreferences(req: any): Promise<{
        success: boolean;
        preferences: ({
            notification_types: {
                id: number;
                created_at: Date | null;
                is_active: boolean | null;
                name: string;
                description: string | null;
                priority: string | null;
                display_name: string;
                icon: string | null;
                color: string | null;
                auto_clear_hours: number | null;
            };
        } & {
            id: number;
            created_at: Date | null;
            user_id: number;
            updated_at: Date | null;
            type_id: number;
            web_enabled: boolean | null;
            email_enabled: boolean | null;
            immediate: boolean | null;
            daily_digest: boolean | null;
            sms_enabled: boolean | null;
            weekly_digest: boolean | null;
        })[];
    }>;
    updatePreference(typeId: number, req: any, dto: UpdateNotificationPreferenceDto): Promise<{
        success: boolean;
        preference: {
            id: number;
            created_at: Date | null;
            user_id: number;
            updated_at: Date | null;
            type_id: number;
            web_enabled: boolean | null;
            email_enabled: boolean | null;
            immediate: boolean | null;
            daily_digest: boolean | null;
            sms_enabled: boolean | null;
            weekly_digest: boolean | null;
        };
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
