import { IsString, IsOptional, IsInt, IsEnum, IsBoolean } from 'class-validator';

export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum NotificationCategory {
  LEAVE = 'leave',
  TIMECARD = 'timecard',
  SCHEDULE = 'schedule',
  ATTENDANCE = 'attendance',
  URGENT_APPROVAL = 'urgent_approval',
  SYSTEM = 'system',
}

export class CreateNotificationDto {
  @IsInt()
  user_id: number;

  @IsString()
  type_name: string;

  @IsString()
  title: string;

  @IsString()
  message: string;

  @IsOptional()
  @IsString()
  action_url?: string;

  @IsOptional()
  @IsString()
  action_text?: string;

  @IsOptional()
  @IsEnum(NotificationPriority)
  priority?: NotificationPriority;

  @IsOptional()
  @IsEnum(NotificationCategory)
  category?: NotificationCategory;

  @IsOptional()
  @IsString()
  related_entity_type?: string;

  @IsOptional()
  @IsInt()
  related_entity_id?: number;

  @IsOptional()
  @IsInt()
  expires_hours?: number;
}

export class GetNotificationsDto {
  @IsOptional()
  @IsInt()
  limit?: number;

  @IsOptional()
  @IsBoolean()
  unread_only?: boolean;

  @IsOptional()
  @IsEnum(NotificationCategory)
  category?: NotificationCategory;
}

export class UpdateNotificationPreferenceDto {
  @IsInt()
  type_id: number;

  @IsBoolean()
  web_enabled: boolean;

  @IsBoolean()
  email_enabled: boolean;

  @IsBoolean()
  immediate: boolean;

  @IsBoolean()
  daily_digest: boolean;
}
