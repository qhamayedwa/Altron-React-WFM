import { Repository } from 'typeorm';
import { Department } from '../entities/department.entity';
import { LeaveApplication } from '../entities/leave-application.entity';
import { LeaveType } from '../entities/leave-type.entity';
import { Notification } from '../entities/notification.entity';
import { NotificationPreference } from '../entities/notification-preference.entity';
import { NotificationType } from '../entities/notification-type.entity';
import { User } from '../entities/user.entity';
import { CreateNotificationDto, NotificationCategory } from './dto';
export declare class NotificationsService {
    private departmentRepo;
    private leaveApplicationRepo;
    private leaveTypeRepo;
    private notificationRepo;
    private notificationPreferenceRepo;
    private notificationTypeRepo;
    private userRepo;
    constructor(departmentRepo: Repository<Department>, leaveApplicationRepo: Repository<LeaveApplication>, leaveTypeRepo: Repository<LeaveType>, notificationRepo: Repository<Notification>, notificationPreferenceRepo: Repository<NotificationPreference>, notificationTypeRepo: Repository<NotificationType>, userRepo: Repository<User>);
    createNotification(dto: CreateNotificationDto): Promise<{
        success: boolean;
        notification: Notification[];
    }>;
    createLeaveApprovalNotification(leaveApplicationId: number): Promise<{
        success: boolean;
    } | null>;
    createLeaveStatusNotification(leaveApplicationId: number, status: string): Promise<{
        success: boolean;
    } | null>;
    getUserNotifications(userId: number, limit?: number, unreadOnly?: boolean, category?: NotificationCategory): Promise<Notification[]>;
    getUnreadCount(userId: number): Promise<number>;
    markAsRead(notificationId: number, userId: number): Promise<{
        success: boolean;
        notification: Notification | null;
    }>;
    markAllAsRead(userId: number): Promise<{
        success: boolean;
        count: number;
    }>;
    cleanupExpired(): Promise<{
        success: boolean;
        count: number;
    }>;
    getNotificationTypes(): Promise<NotificationType[]>;
    getUserPreferences(userId: number): Promise<NotificationPreference[]>;
    updatePreference(userId: number, typeId: number, preferences: any): Promise<NotificationPreference | NotificationPreference[] | null>;
}
