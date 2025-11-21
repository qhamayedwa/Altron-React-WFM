import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
      notificationType = await this.notificationTypeRepo.save(this.notificationTypeRepo.create({
          name: dto.type_name,
          display_name: dto.type_name.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
          icon: 'bell',
          color: 'primary',
          is_active: true,
        },
      });
    }

    const expiresAt = dto.expires_hours
      ? new Date(Date.now() + dto.expires_hours * 60 * 60 * 1000)
      : null;

    const notification = await this.notificationRepo.save(this.notificationRepo.create({
        user_id: dto.user_id,
        type_id: notificationType.id,
        title: dto.title,
        message: dto.message,
        action_url: dto.action_url,
        action_text: dto.action_text,
        priority: dto.priority || NotificationPriority.MEDIUM,
        category: dto.category,
        related_entity_type: dto.related_entity_type,
        related_entity_id: dto.related_entity_id,
        expires_at: expiresAt,
        is_read: false,
      },
    });

    return { success: true, notification };
  }

  async createLeaveApprovalNotification(leaveApplicationId: number) {
    const leaveApp = await this.leaveApplicationRepo.findOne({
      where: { id: leaveApplicationId },
      relations: {
        users_leave_applications_user_idTousers: true,
        leave_types: true,
      },
    });

    if (!leaveApp || !leaveApp.users_leave_applications_user_idTousers.department_id) {
      return null;
    }

    const department = await this.departmentRepo.findOne({
      where: { id: leaveApp.users_leave_applications_user_idTousers.department_id },
    });

    if (!department) {
      return null;
    }

    const managerIds = [department.manager_id, department.deputy_manager_id].filter((id): id is number => id !== null);

    const startDate = new Date(leaveApp.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const endDate = new Date(leaveApp.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    const totalDays = Math.ceil((leaveApp.end_date.getTime() - leaveApp.start_date.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const employeeName = `${leaveApp.users_leave_applications_user_idTousers.first_name || ''} ${leaveApp.users_leave_applications_user_idTousers.last_name || ''}`.trim() || leaveApp.users_leave_applications_user_idTousers.username;

    for (const managerId of managerIds) {
      await this.createNotification({
        user_id: managerId,
        type_name: 'leave_approval_required',
        title: 'Leave Approval Required',
        message: `${employeeName} has requested ${totalDays} days of ${leaveApp.leave_types?.name || 'leave'} from ${startDate} to ${endDate}`,
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
        users_leave_applications_user_idTousers: true,
        leave_types: true,
      },
    });

    if (!leaveApp) {
      return null;
    }

    const startDate = new Date(leaveApp.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const endDate = new Date(leaveApp.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

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
      user_id: leaveApp.user_id,
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
      relations: { user_roles: { relations: { roles: true } } },
    });

    if (!user) {
      return [];
    }

    const isManager = user.user_roles.some((ur: any) => ur.roles.name === 'Manager');

    const whereConditions: any = {
      OR: [{ user_id: userId }],
      expires_at: {
        OR: [{ equals: null }, { gt: new Date() }],
      },
    };

    if (isManager && user.department_id) {
      const departmentEmployees = await this.userRepo.find({
        where: {
          department_id: user.department_id,
          is_active: true,
        },
        select: { id: true },
      });

      const employeeIds = departmentEmployees.map((emp) => emp.id);

      if (employeeIds.length > 0) {
        whereConditions.OR.push({
          AND: [
            { user_id: { in: employeeIds } },
            { category: { in: ['leave', 'timecard', 'attendance', 'urgent_approval'] } },
          ],
        });
      }
    }

    if (unreadOnly) {
      whereConditions.is_read = false;
    }

    if (category) {
      whereConditions.category = category;
    }

    const notifications = await this.notificationRepo.find({
      where: whereConditions,
      relations: {
        notification_types: true,
        users: {
          select: {
            id: true,
            username: true,
            first_name: true,
            last_name: true,
          },
        },
      },
      order: { created_at: 'desc' },
      take: limit,
    });

    return notifications;
  }

  async getUnreadCount(userId: number) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: { user_roles: { relations: { roles: true } } },
    });

    if (!user) {
      return 0;
    }

    const isManager = user.user_roles.some((ur: any) => ur.roles.name === 'Manager');

    const whereConditions: any = {
      OR: [{ user_id: userId }],
      is_read: false,
      expires_at: {
        OR: [{ equals: null }, { gt: new Date() }],
      },
    };

    if (isManager && user.department_id) {
      const departmentEmployees = await this.userRepo.find({
        where: {
          department_id: user.department_id,
          is_active: true,
        },
        select: { id: true },
      });

      const employeeIds = departmentEmployees.map((emp) => emp.id);

      if (employeeIds.length > 0) {
        whereConditions.OR.push({
          AND: [
            { user_id: { in: employeeIds } },
            { category: { in: ['leave', 'timecard', 'attendance', 'urgent_approval'] } },
          ],
        });
      }
    }

    const count = await this.notificationRepo.count({
      where: whereConditions,
    });

    return count;
  }

  async markAsRead(notificationId: number, userId: number) {
    const notification = await this.notificationRepo.findOne({
      where: {
        id: notificationId,
        user_id: userId,
      },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    const updated = await this.notificationRepo.update({
      where: { id: notificationId },
      data: {
        is_read: true,
        read_at: new Date(),
      },
    });

    return { success: true, notification: updated };
  }

  async markAllAsRead(userId: number) {
    const result = await this.prisma.notifications.updateMany({
      where: {
        user_id: userId,
        is_read: false,
      },
      data: {
        is_read: true,
        read_at: new Date(),
      },
    });

    return { success: true, count: result.count };
  }

  async cleanupExpired() {
    const result = await this.prisma.notifications.deleteMany({
      where: {
        expires_at: {
          lt: new Date(),
        },
      },
    });

    return { success: true, count: result.count };
  }

  async getNotificationTypes() {
    return this.notificationTypeRepo.find({
      where: { is_active: true },
    });
  }

  async getUserPreferences(userId: number) {
    return this.notificationPreferenceRepo.find({
      where: { user_id: userId },
      relations: { notification_types: true },
    });
  }

  async updatePreference(userId: number, typeId: number, preferences: any) {
    const existing = await this.notificationPreferenceRepo.findOne({
      where: {
        user_id: userId,
        type_id: typeId,
      },
    });

    if (existing) {
      return this.notificationPreferenceRepo.update({
        where: { id: existing.id },
        data: preferences,
      });
    } else {
      return this.notificationPreferenceRepo.save(this.notificationPreferenceRepo.create({
          user_id: userId,
          type_id: typeId,
          ...preferences,
        },
      });
    }
  }
}
