import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import type { AuthenticatedUser } from '../../../common/auth/authenticated-user';
import { CurrentUser } from '../../../common/auth/current-user.decorator';
import { RequirePermission } from '../../../common/auth/require-permission.decorator';
import { RequireRole } from '../../../common/auth/require-role.decorator';
import type {
  NotificationListQueryDto,
  NotificationWriteRequestDto,
} from './dto/notifications.dto';
import { NotificationsService } from './notifications.service';
import {
  validateCreateNotification,
  validateNotificationList,
  validateUpdateNotification,
} from './notifications.validation';

@Controller('api/v1/notifications')
export class AppNotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @RequirePermission('communication.notifications.read')
  list(
    @Query() query: NotificationListQueryDto,
    @CurrentUser() actor: AuthenticatedUser | undefined,
  ) {
    return this.notificationsService.listNotifications(
      validateNotificationList(query),
      actor,
    );
  }

  @Get(':id')
  @RequirePermission('communication.notifications.read')
  detail(
    @Param('id') id: string,
    @CurrentUser() actor: AuthenticatedUser | undefined,
  ) {
    return this.notificationsService.getNotificationDetail(id, actor);
  }

  @Patch(':id/read')
  @RequirePermission('communication.notifications.read')
  markRead(
    @Param('id') id: string,
    @CurrentUser() actor: AuthenticatedUser | undefined,
  ) {
    return this.notificationsService.markAsRead(id, actor);
  }
}

@Controller('api/v1/admin/notifications')
@RequireRole('admin', 'super_admin')
export class AdminNotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @RequirePermission('communication.notifications.read')
  list(@Query() query: NotificationListQueryDto) {
    return this.notificationsService.listAdminNotifications(
      validateNotificationList(query),
    );
  }

  @Post()
  @RequirePermission('communication.notifications.manage')
  create(
    @Body() body: NotificationWriteRequestDto,
    @CurrentUser() actor: AuthenticatedUser | undefined,
  ) {
    return this.notificationsService.createNotification(
      validateCreateNotification(body),
      actor,
    );
  }

  @Get(':id')
  @RequirePermission('communication.notifications.read')
  detail(@Param('id') id: string) {
    return this.notificationsService.getAdminNotification(id);
  }

  @Patch(':id')
  @RequirePermission('communication.notifications.manage')
  update(
    @Param('id') id: string,
    @Body() body: NotificationWriteRequestDto,
    @CurrentUser() actor: AuthenticatedUser | undefined,
  ) {
    return this.notificationsService.updateAdminNotification(
      id,
      validateUpdateNotification(body),
      actor,
    );
  }
}
