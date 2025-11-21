export declare enum NotificationPriority {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    URGENT = "urgent"
}
export declare enum NotificationCategory {
    LEAVE = "leave",
    TIMECARD = "timecard",
    SCHEDULE = "schedule",
    ATTENDANCE = "attendance",
    URGENT_APPROVAL = "urgent_approval",
    SYSTEM = "system"
}
export declare class CreateNotificationDto {
    user_id: number;
    type_name: string;
    title: string;
    message: string;
    action_url?: string;
    action_text?: string;
    priority?: NotificationPriority;
    category?: NotificationCategory;
    related_entity_type?: string;
    related_entity_id?: number;
    expires_hours?: number;
}
export declare class GetNotificationsDto {
    limit?: number;
    unread_only?: boolean;
    category?: NotificationCategory;
}
export declare class UpdateNotificationPreferenceDto {
    type_id: number;
    web_enabled: boolean;
    email_enabled: boolean;
    immediate: boolean;
    daily_digest: boolean;
}
