import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ok } from '../common/api-response';
import { StudentsService } from './students.service';

@Controller('api/v1/students/:studentId')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Get('scores')
  async scores(
    @Param('studentId') studentId: string,
    @Query() query: Record<string, unknown>,
  ) {
    return ok(await this.studentsService.scores(studentId, query));
  }

  @Get('reward-discipline')
  async rewardDiscipline(
    @Param('studentId') studentId: string,
    @Query() query: Record<string, unknown>,
  ) {
    return ok(await this.studentsService.rewardDiscipline(studentId, query));
  }

  @Get('timetable')
  async timetable(
    @Param('studentId') studentId: string,
    @Query() query: Record<string, unknown>,
  ) {
    return ok(await this.studentsService.timetable(studentId, query));
  }

  @Get('online-study')
  async onlineStudy(
    @Param('studentId') studentId: string,
    @Query() query: Record<string, unknown>,
  ) {
    return ok(await this.studentsService.onlineStudy(studentId, query));
  }

  @Get('bus-route')
  async busRoute(@Param('studentId') studentId: string) {
    return ok(await this.studentsService.busRoute(studentId));
  }

  @Get('attendance')
  async attendance(
    @Param('studentId') studentId: string,
    @Query() query: Record<string, unknown>,
  ) {
    return ok(await this.studentsService.attendance(studentId, query));
  }

  @Get('homeworks')
  async homeworks(
    @Param('studentId') studentId: string,
    @Query() query: Record<string, unknown>,
  ) {
    return ok(await this.studentsService.homeworks(studentId, query));
  }

  @Post('homeworks/:homeworkId/submit')
  async submitHomework(
    @Param('studentId') studentId: string,
    @Param('homeworkId') homeworkId: string,
    @Body() body: { content?: string | null; attachments?: string[] },
  ) {
    return ok(
      await this.studentsService.submitHomework(studentId, homeworkId, body),
    );
  }
}
