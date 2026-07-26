import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
import type { AuthenticatedUser } from '../../../common/auth/authenticated-user';
import { CurrentUser } from '../../../common/auth/current-user.decorator';
import { RequirePermission } from '../../../common/auth/require-permission.decorator';
import { RequireRole } from '../../../common/auth/require-role.decorator';
import type {
  FeedbackListQueryDto,
  FeedbackStatusUpdateDto,
} from './dto/feedback.dto';
import { FeedbackService } from './feedback.service';
import {
  validateFeedbackList,
  validateFeedbackStatusUpdate,
} from './feedback.validation';

@Controller('api/v1/admin/feedback')
@RequireRole('admin', 'super_admin')
export class AdminFeedbackController {
  constructor(private readonly feedback: FeedbackService) {}

  @Get()
  @RequirePermission('communication.feedback.read')
  list(@Query() query: FeedbackListQueryDto) {
    return this.feedback.list(validateFeedbackList(query));
  }

  @Get(':id')
  @RequirePermission('communication.feedback.read')
  detail(@Param('id') id: string) {
    return this.feedback.detail(id);
  }

  @Patch(':id')
  @RequirePermission('communication.feedback.manage')
  updateStatus(
    @Param('id') id: string,
    @Body() body: FeedbackStatusUpdateDto,
    @CurrentUser() actor: AuthenticatedUser | undefined,
  ) {
    return this.feedback.updateStatus(
      id,
      validateFeedbackStatusUpdate(body),
      actor,
    );
  }
}
