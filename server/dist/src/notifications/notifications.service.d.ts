import { PrismaService } from '../prisma/prisma.service';
import { CreateNotificationDto, NotificationCategory } from './dto';
export declare class NotificationsService {
    private prisma;
    constructor(prisma: PrismaService);
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
    createLeaveApprovalNotification(leaveApplicationId: number): Promise<{
        success: boolean;
    } | null>;
    createLeaveStatusNotification(leaveApplicationId: number, status: string): Promise<{
        success: boolean;
    } | null>;
    getUserNotifications(userId: number, limit?: number, unreadOnly?: boolean, category?: NotificationCategory): Promise<({
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
    })[]>;
    getUnreadCount(userId: number): Promise<number>;
    markAsRead(notificationId: number, userId: number): Promise<{
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
    markAllAsRead(userId: number): Promise<{
        success: boolean;
        count: number;
    }>;
    cleanupExpired(): Promise<{
        success: boolean;
        count: number;
    }>;
    getNotificationTypes(): Promise<{
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
    }[]>;
    getUserPreferences(userId: number): Promise<({
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
    })[]>;
    updatePreference(userId: number, typeId: number, preferences: any): Promise<{
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
    }>;
}
