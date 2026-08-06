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
  AttendanceListQueryDto,
  AttendanceSessionWriteDto,
} from './dto/attendance.dto';
import { AttendanceService } from './attendance.service';
import {
  validateAttendanceCreate,
  validateAttendanceList,
  validateAttendanceUpdate,
} from './attendance.validation';

@Controller('api/v1/admin')
@RequireRole('admin', 'super_admin')
export class AttendanceController {
  constructor(private readonly attendance: AttendanceService) {}

  @Get('attendance')
  @RequirePermission('academics.attendance.read')
  list(@Query() query: AttendanceListQueryDto) {
    return this.attendance.listSessions(validateAttendanceList(query));
  }

  @Post('attendance')
  @RequirePermission('academics.attendance.manage')
  create(
    @Body() payload: AttendanceSessionWriteDto,
    @CurrentUser() actor: AuthenticatedUser | undefined,
  ) {
    return this.attendance.createSession(
      validateAttendanceCreate(payload),
      actor,
    );
  }

  @Get('attendance/:id')
  @RequirePermission('academics.attendance.read')
  get(@Param('id') id: string) {
    return this.attendance.getSession(id);
  }

  @Patch('attendance/:id')
  @RequirePermission('academics.attendance.manage')
  update(
    @Param('id') id: string,
    @Body() payload: AttendanceSessionWriteDto,
    @CurrentUser() actor: AuthenticatedUser | undefined,
  ) {
    return this.attendance.updateSession(
      id,
      validateAttendanceUpdate(payload),
      actor,
    );
  }

  @Get('students/:student_id/attendance')
  @RequirePermission('academics.attendance.read')
  getStudentAttendance(@Param('student_id') studentId: string) {
    return this.attendance.getStudentAttendanceHistory(studentId);
  }
}

import { SkipAuthorization } from '../../../common/auth/skip-authorization.decorator';

@SkipAuthorization()
@Controller('api/v1/home/attendance')
export class AppAttendanceController {
  constructor(private readonly attendance: AttendanceService) {}

  @Get('today')
  getToday(@CurrentUser() actor: AuthenticatedUser | undefined) {
    return this.attendance.getTodayAttendance(
      actor?.activeStudentId ?? undefined,
    );
  }
}

@SkipAuthorization()
@Controller('api/v1/students')
export class StudentAttendanceController {
  constructor(private readonly attendance: AttendanceService) {}

  @Get(':id/attendance')
  getHistory(@Param('id') studentId: string) {
    return this.attendance.getStudentAttendanceHistory(studentId);
  }
}
