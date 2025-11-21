import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, IsNull, MoreThan, LessThan } from 'typeorm';
import { Department } from '../entities/department.entity';
import { LeaveApplication } from '../entities/leave-application.entity';
import { LeaveType } from '../entities/leave-type.entity';
import { Notification } from '../entities/notification.entity';
import { NotificationPreference } from '../entities/notification-preference.entity';
import { NotificationType } from '../entities/notification-type.entity';
import { User } from '../entities/user.entity';
import { CreateNotificationDto, NotificationPriority, NotificationCategory } from './dto';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Department)
    private departmentRepo: Repository<Department>,
    @InjectRepository(LeaveApplication)
    private leaveApplicationRepo: Repository<LeaveApplication>,
    @InjectRepository(LeaveType)
    private leaveTypeRepo: Repository<LeaveType>,
    @InjectRepository(Notification)
    private notificationRepo: Repository<Notification>,
    @InjectRepository(NotificationPreference)
    private notificationPreferenceRepo: Repository<NotificationPreference>,
    @InjectRepository(NotificationType)
    private notificationTypeRepo: Repository<NotificationType>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async createNotification(dto: CreateNotificationDto) {
    let notificationType = await this.notificationTypeRepo.findOne({
      where: { name: dto.type_name },
    });

    if (!notificationType) {
      notificationType = await this.notificationTypeRepo.save(
        this.notificationTypeRepo.create({
          name: dto.type_name,
          displayName: dto.type_name.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
          icon: 'bell',
          color: 'primary',
          isActive: true,
        }),
      );
    }

    const notificationData: any = {
      userId: dto.user_id,
      typeId: notificationType.id,
      title: dto.title,
      message: dto.message,
      priority: dto.priority || NotificationPriority.MEDIUM,
      isRead: false,
    };

    if (dto.action_url) {
      notificationData.actionUrl = dto.action_url;
    }

    if (dto.action_text) {
      notificationData.actionText = dto.action_text;
    }

    if (dto.category) {
      notificationData.category = dto.category;
    }

    if (dto.related_entity_type) {
      notificationData.relatedEntityType = dto.related_entity_type;
    }

    if (dto.related_entity_id) {
      notificationData.relatedEntityId = dto.related_entity_id;
    }

    if (dto.expires_hours) {
      notificationData.expiresAt = new Date(Date.now() + dto.expires_hours * 60 * 60 * 1000);
    }

    const notification = await this.notificationRepo.save(
      this.notificationRepo.create(notificationData),
    );

    return { success: true, notification };
  }

  async createLeaveApprovalNotification(leaveApplicationId: number) {
    const leaveApp = await this.leaveApplicationRepo.findOne({
      where: { id: leaveApplicationId },
      relations: {
        user: true,
        leaveType: true,
      },
    });

    if (!leaveApp || !leaveApp.user.departmentId) {
      return null;
    }

    const department = await this.departmentRepo.findOne({
      where: { id: leaveApp.user.departmentId },
    });

    if (!department) {
      return null;
    }

    const managerIds = [department.managerId, department.deputyManagerId].filter((id): id is number => id !== null);

    const startDate = new Date(leaveApp.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const endDate = new Date(leaveApp.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    const totalDays = Math.ceil((leaveApp.endDate.getTime() - leaveApp.startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const employeeName = `${leaveApp.user.firstName || ''} ${leaveApp.user.lastName || ''}`.trim() || leaveApp.user.username;

    for (const managerId of managerIds) {
      await this.createNotification({
        user_id: managerId,
        type_name: 'leave_approval_required',
        title: 'Leave Approval Required',
        message: `${employeeName} has requested ${totalDays} days of ${leaveApp.leaveType?.name || 'leave'} from ${startDate} to ${endDate}`,
        action_url: '/leave/approvals',
        action_text: 'Review Request',
        priority: NotificationPriority.HIGH,
        category: NotificationCategory.LEAVE,
        related_entity_type: 'LeaveApplication',
        related_entity_id: leaveApplicationId,
        expires_hours: 168,
      });
    }

    return { success: true };
  }

  async createLeaveStatusNotification(leaveApplicationId: number, status: string) {
    const leaveApp = await this.leaveApplicationRepo.findOne({
      where: { id: leaveApplicationId },
      relations: {
        user: true,
        leaveType: true,
      },
    });

    if (!leaveApp) {
      return null;
    }

    const startDate = new Date(leaveApp.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const endDate = new Date(leaveApp.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    const statusMessages: Record<string, string> = {
      Approved: `Your leave request from ${startDate} to ${endDate} has been approved.`,
      Rejected: `Your leave request from ${startDate} to ${endDate} has been rejected.`,
      Cancelled: `Your leave request from ${startDate} to ${endDate} has been cancelled.`,
    };

    const priorityMap: Record<string, NotificationPriority> = {
      Approved: NotificationPriority.MEDIUM,
      Rejected: NotificationPriority.HIGH,
      Cancelled: NotificationPriority.LOW,
    };

    await this.createNotification({
      user_id: leaveApp.userId,
      type_name: 'leave_status_update',
      title: `Leave Request ${status}`,
      message: statusMessages[status] || `Your leave request status has been updated to ${status}.`,
      action_url: '/leave/applications',
      action_text: 'View Details',
      priority: priorityMap[status] || NotificationPriority.MEDIUM,
      category: NotificationCategory.LEAVE,
      related_entity_type: 'LeaveApplication',
      related_entity_id: leaveApplicationId,
      expires_hours: 72,
    });

    return { success: true };
  }

  async getUserNotifications(userId: number, limit = 50, unreadOnly = false, category?: NotificationCategory) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: {
        userRoles: {
          role: true,
        },
      },
    });

    if (!user) {
      return [];
    }

    const isManager = user.userRoles?.some((ur: any) => ur.role?.name === 'Manager');

    const queryBuilder = this.notificationRepo.createQueryBuilder('notification')
      .leftJoinAndSelect('notification.notificationType', 'notificationType')
      .leftJoinAndSelect('notification.user', 'user')
      .where('notification.userId = :userId', { userId });

    if (isManager && user.departmentId) {
      const departmentEmployees = await this.userRepo.find({
        where: {
          departmentId: user.departmentId,
          isActive: true,
        },
        select: ['id'],
      });

      const employeeIds = departmentEmployees.map((emp) => emp.id);

      if (employeeIds.length > 0) {
        queryBuilder.orWhere(
          '(notification.userId IN (:...employeeIds) AND notification.category IN (:...categories))',
          {
            employeeIds,
            categories: ['leave', 'timecard', 'attendance', 'urgent_approval'],
          },
        );
      }
    }

    queryBuilder.andWhere(
      '(notification.expiresAt IS NULL OR notification.expiresAt > :now)',
      { now: new Date() },
    );

    if (unreadOnly) {
      queryBuilder.andWhere('notification.isRead = :isRead', { isRead: false });
    }

    if (category) {
      queryBuilder.andWhere('notification.category = :category', { category });
    }

    queryBuilder
      .orderBy('notification.createdAt', 'DESC')
      .take(limit);

    const notifications = await queryBuilder.getMany();

    return notifications;
  }

  async getUnreadCount(userId: number) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: {
        userRoles: {
          role: true,
        },
      },
    });

    if (!user) {
      return 0;
    }

    const isManager = user.userRoles?.some((ur: any) => ur.role?.name === 'Manager');

    const queryBuilder = this.notificationRepo.createQueryBuilder('notification')
      .where('notification.userId = :userId', { userId })
      .andWhere('notification.isRead = :isRead', { isRead: false });

    if (isManager && user.departmentId) {
      const departmentEmployees = await this.userRepo.find({
        where: {
          departmentId: user.departmentId,
          isActive: true,
        },
        select: ['id'],
      });

      const employeeIds = departmentEmployees.map((emp) => emp.id);

      if (employeeIds.length > 0) {
        queryBuilder.orWhere(
          '(notification.userId IN (:...employeeIds) AND notification.category IN (:...categories) AND notification.isRead = :isRead)',
          {
            employeeIds,
            categories: ['leave', 'timecard', 'attendance', 'urgent_approval'],
            isRead: false,
          },
        );
      }
    }

    queryBuilder.andWhere(
      '(notification.expiresAt IS NULL OR notification.expiresAt > :now)',
      { now: new Date() },
    );

    const count = await queryBuilder.getCount();

    return count;
  }

  async markAsRead(notificationId: number, userId: number) {
    const notification = await this.notificationRepo.findOne({
      where: {
        id: notificationId,
        userId: userId,
      },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    await this.notificationRepo.update(
      { id: notificationId },
      {
        isRead: true,
        readAt: new Date(),
      },
    );

    const updated = await this.notificationRepo.findOne({
      where: { id: notificationId },
    });

    return { success: true, notification: updated };
  }

  async markAllAsRead(userId: number) {
    const result = await this.notificationRepo.update(
      {
        userId: userId,
        isRead: false,
      },
      {
        isRead: true,
        readAt: new Date(),
      },
    );

    return { success: true, count: result.affected || 0 };
  }

  async cleanupExpired() {
    const result = await this.notificationRepo.delete({
      expiresAt: LessThan(new Date()),
    });

    return { success: true, count: result.affected || 0 };
  }

  async getNotificationTypes() {
    return this.notificationTypeRepo.find({
      where: { isActive: true },
    });
  }

  async getUserPreferences(userId: number) {
    return this.notificationPreferenceRepo.find({
      where: { userId: userId },
      relations: { notificationType: true },
    });
  }

  async updatePreference(userId: number, typeId: number, preferences: any) {
    const existing = await this.notificationPreferenceRepo.findOne({
      where: {
        userId: userId,
        typeId: typeId,
      },
    });

    if (existing) {
      await this.notificationPreferenceRepo.update(
        { id: existing.id },
        preferences,
      );

      return this.notificationPreferenceRepo.findOne({
        where: { id: existing.id },
      });
    } else {
      return this.notificationPreferenceRepo.save(
        this.notificationPreferenceRepo.create({
          userId: userId,
          typeId: typeId,
          ...preferences,
        }),
      );
    }
  }
}
