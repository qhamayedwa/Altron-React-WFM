import { Controller, Get, Post, Body, Param, ParseIntPipe, Query, Request, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto, GetNotificationsDto, UpdateNotificationPreferenceDto, NotificationCategory } from './dto';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('notifications')
@UseGuards(AuthenticatedGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  @Roles('Super User', 'Admin', 'system_super_admin')
  async createNotification(@Body() dto: CreateNotificationDto) {
    return this.notificationsService.createNotification(dto);
  }

  @Get()
  async getMyNotifications(
    @Request() req: any,
    @Query('limit') limit?: string,
    @Query('unread_only') unreadOnly?: string,
    @Query('category') category?: NotificationCategory,
  ) {
    const userId = req.user.id;
    const parsedLimit = limit ? parseInt(limit, 10) : 50;
    const parsedUnreadOnly = unreadOnly === 'true';

    const notifications = await this.notificationsService.getUserNotifications(
      userId,
      parsedLimit,
      parsedUnreadOnly,
      category,
    );

    return { success: true, notifications };
  }

  @Get('unread-count')
  async getUnreadCount(@Request() req: any) {
    const count = await this.notificationsService.getUnreadCount(req.user.id);
    return { success: true, count };
  }

  @Get('recent')
  async getRecentNotifications(@Request() req: any, @Query('limit') limit?: string) {
    const userId = req.user.id;
    const parsedLimit = limit ? parseInt(limit, 10) : 5;

    const notifications = await this.notificationsService.getUserNotifications(userId, parsedLimit, false);

    return { success: true, notifications };
  }

  @Post(':id/mark-read')
  async markAsRead(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.notificationsService.markAsRead(id, req.user.id);
  }

  @Post('mark-all-read')
  async markAllAsRead(@Request() req: any) {
    return this.notificationsService.markAllAsRead(req.user.id);
  }

  @Get('types')
  async getNotificationTypes() {
    const types = await this.notificationsService.getNotificationTypes();
    return { success: true, types };
  }

  @Get('preferences')
  async getUserPreferences(@Request() req: any) {
    const preferences = await this.notificationsService.getUserPreferences(req.user.id);
    return { success: true, preferences };
  }

  @Post('preferences/:typeId')
  async updatePreference(
    @Param('typeId', ParseIntPipe) typeId: number,
    @Request() req: any,
    @Body() dto: UpdateNotificationPreferenceDto,
  ) {
    const preference = await this.notificationsService.updatePreference(req.user.id, typeId, dto);
    return { success: true, preference };
  }

  @Post('cleanup-expired')
  @Roles('Super User', 'Admin', 'system_super_admin')
  async cleanupExpired() {
    return this.notificationsService.cleanupExpired();
  }

  @Post('leave-approval/:id')
  @Roles('Super User', 'Admin', 'HR', 'Manager', 'system_super_admin')
  async createLeaveApprovalNotification(@Param('id', ParseIntPipe) id: number) {
    return this.notificationsService.createLeaveApprovalNotification(id);
  }

  @Post('leave-status/:id')
  @Roles('Super User', 'Admin', 'HR', 'Manager', 'system_super_admin')
  async createLeaveStatusNotification(
    @Param('id', ParseIntPipe) id: number,
    @Query('status') status: string,
  ) {
    return this.notificationsService.createLeaveStatusNotification(id, status);
  }
}
