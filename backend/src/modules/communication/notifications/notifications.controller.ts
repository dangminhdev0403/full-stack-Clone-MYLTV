import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import type { AuthenticatedUser } from '../../../common/auth/authenticated-user';
import { CurrentUser } from '../../../common/auth/current-user.decorator';
import { RequireRole } from '../../../common/auth/require-role.decorator';
import { NotificationsService } from './notifications.service';

@Controller('api/v1/notifications')
export class AppNotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  list(@Query() query: any, @CurrentUser() actor: AuthenticatedUser | undefined) {
    return this.notificationsService.listNotifications(query, actor?.id);
  }

  @Get(':id')
  detail(@Param('id') id: string, @CurrentUser() actor: AuthenticatedUser | undefined) {
    return this.notificationsService.getNotificationDetail(id, actor?.id);
  }

  @Patch(':id/read')
  markRead(
    @Param('id') id: string,
    @Query('student_id') studentId: string | undefined,
    @CurrentUser() actor: AuthenticatedUser | undefined,
  ) {
    return this.notificationsService.markAsRead(id, actor?.id, studentId);
  }
}

@Controller('api/v1/admin/notifications')
@RequireRole('admin', 'super_admin')
export class AdminNotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  list(@Query() query: any, @CurrentUser() actor: AuthenticatedUser | undefined) {
    return this.notificationsService.listNotifications(query, actor?.id);
  }

  @Post()
  create(@Body() body: { title: string; sender: string; content: string; tag?: string }, @CurrentUser() actor: AuthenticatedUser | undefined) {
    return this.notificationsService.createNotification(body, actor?.id);
  }
}
