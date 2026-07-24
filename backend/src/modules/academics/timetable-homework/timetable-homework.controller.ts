import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { RequireRole } from '../../../common/auth/require-role.decorator';
import {
  CreateHomeworkDto,
  SaveTimetableDto,
  SubmitHomeworkDto,
  TimetableHomeworkService,
} from './timetable-homework.service';

@Controller('api/v1/students')
export class AppTimetableHomeworkController {
  constructor(private readonly service: TimetableHomeworkService) {}

  @Get(':student_id/timetable')
  getTimetable(@Param('student_id') studentId: string, @Query('week_start') weekStart?: string) {
    return this.service.getTimetable(studentId, weekStart);
  }

  @Get(':student_id/homeworks')
  getHomeworks(
    @Param('student_id') studentId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
  ) {
    return this.service.getHomeworks(studentId, page ? Number(page) : 1, limit ? Number(limit) : 20, status);
  }

  @Post(':student_id/homeworks/:homework_id/submit')
  submitHomework(
    @Param('student_id') studentId: string,
    @Param('homework_id') homeworkId: string,
    @Body() body: SubmitHomeworkDto,
  ) {
    return this.service.submitHomework(studentId, homeworkId, body);
  }

  @Get(':student_id/online-study')
  getOnlineStudy(@Param('student_id') studentId: string) {
    return this.service.getOnlineStudy(studentId);
  }
}

@Controller('api/v1/admin')
@RequireRole('admin', 'super_admin')
export class AdminTimetableHomeworkController {
  constructor(private readonly service: TimetableHomeworkService) {}

  @Post('timetable')
  saveTimetable(@Body() body: SaveTimetableDto) {
    return this.service.saveTimetable(body);
  }

  @Post('homeworks')
  createHomework(@Body() body: CreateHomeworkDto) {
    return this.service.createHomework(body);
  }
}
