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
import { SkipAuthorization } from '../../../common/auth/skip-authorization.decorator';
import {
  SubmitHomeworkDto,
  TimetableHomeworkService,
} from './timetable-homework.service';
import {
  CreateHomeworkDto,
  ListAdminTimetableQueryDto,
  ListHomeworksQueryDto,
  SaveAdminTimetableDto,
  UpdateHomeworkDto,
  validateCreateHomework,
  validateListAdminTimetable,
  validateListHomeworks,
  validateSaveAdminTimetable,
  validateUpdateHomework,
} from './timetable-homework.validation';

@SkipAuthorization()
@Controller('api/v1/students')
export class AppTimetableHomeworkController {
  constructor(private readonly service: TimetableHomeworkService) {}
  @Get(':student_id/timetable') getTimetable(
    @Param('student_id') studentId: string,
    @Query('week_start') weekStart?: string,
  ) {
    return this.service.getTimetable(studentId, weekStart);
  }
  @Get(':student_id/homeworks') getHomeworks(
    @Param('student_id') studentId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
  ) {
    return this.service.getHomeworks(
      studentId,
      page ? Number(page) : 1,
      limit ? Number(limit) : 20,
      status,
    );
  }
  @Post(':student_id/homeworks/:homework_id/submit') submitHomework(
    @Param('student_id') studentId: string,
    @Param('homework_id') homeworkId: string,
    @Body() body: SubmitHomeworkDto,
  ) {
    return this.service.submitHomework(studentId, homeworkId, body);
  }
  @Get(':student_id/online-study') getOnlineStudy(
    @Param('student_id') studentId: string,
  ) {
    return this.service.getOnlineStudy(studentId);
  }
}

@Controller('api/v1/admin')
@RequireRole('admin', 'super_admin')
export class AdminTimetableHomeworkController {
  constructor(private readonly service: TimetableHomeworkService) {}

  @Get('timetable')
  @RequirePermission('academics.timetable.read')
  getTimetable(@Query() query: ListAdminTimetableQueryDto) {
    return this.service.getAdminTimetable(validateListAdminTimetable(query));
  }

  @Post('timetable')
  @RequirePermission('academics.timetable.manage')
  saveTimetable(
    @Body() body: SaveAdminTimetableDto,
    @CurrentUser() actor?: AuthenticatedUser,
  ) {
    return this.service.saveTimetable(validateSaveAdminTimetable(body), actor);
  }
  @Get('homeworks') @RequirePermission('academics.homework.read') listHomeworks(
    @Query() query: ListHomeworksQueryDto,
  ) {
    return this.service.listHomeworks(validateListHomeworks(query));
  }
  @Get('homeworks/:id')
  @RequirePermission('academics.homework.read')
  getHomework(@Param('id') id: string) {
    return this.service.getHomework(id);
  }
  @Post('homeworks')
  @RequirePermission('academics.homework.manage')
  createHomework(
    @Body() body: CreateHomeworkDto,
    @CurrentUser() actor?: AuthenticatedUser,
  ) {
    return this.service.createHomework(validateCreateHomework(body), actor);
  }
  @Patch('homeworks/:id')
  @RequirePermission('academics.homework.manage')
  updateHomework(
    @Param('id') id: string,
    @Body() body: UpdateHomeworkDto,
    @CurrentUser() actor?: AuthenticatedUser,
  ) {
    return this.service.updateHomework(id, validateUpdateHomework(body), actor);
  }
  @Post('homeworks/:id/archive')
  @RequirePermission('academics.homework.manage')
  archiveHomework(
    @Param('id') id: string,
    @CurrentUser() actor?: AuthenticatedUser,
  ) {
    return this.service.archiveHomework(id, actor);
  }
}
