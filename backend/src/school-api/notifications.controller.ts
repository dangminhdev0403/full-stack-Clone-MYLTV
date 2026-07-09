import { Controller, Get, Headers, Param, Patch, Query } from '@nestjs/common';
import { ok } from '../common/api-response';
import { NotificationsService } from './notifications.service';

@Controller('api/v1/notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async list(@Query() query: Record<string, unknown>) {
    return ok(await this.notificationsService.list(query));
  }

  @Get(':notificationId')
  async detail(
    @Param('notificationId') notificationId: string,
    @Headers('x-student-id') studentId?: string,
  ) {
    return ok(
      await this.notificationsService.detail(notificationId, studentId),
    );
  }

  @Patch(':notificationId/read')
  async markRead(
    @Param('notificationId') notificationId: string,
    @Headers('x-student-id') studentId?: string,
  ) {
    return ok(
      await this.notificationsService.markRead(notificationId, studentId),
    );
  }
}
