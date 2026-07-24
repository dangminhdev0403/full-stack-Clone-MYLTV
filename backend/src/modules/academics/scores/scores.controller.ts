import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { RequireRole } from '../../../common/auth/require-role.decorator';
import {
  SaveRewardDisciplineDto,
  SaveScoreDto,
  ScoresService,
} from './scores.service';

@Controller('api/v1/students')
export class AppScoresController {
  constructor(private readonly scoresService: ScoresService) {}

  @Get(':student_id/scores')
  getScores(
    @Param('student_id') studentId: string,
    @Query('school_year') schoolYear?: string,
    @Query('semester') semester?: string,
  ) {
    return this.scoresService.getStudentScores(studentId, schoolYear, semester);
  }

  @Get(':student_id/reward-discipline')
  getRewardDiscipline(
    @Param('student_id') studentId: string,
    @Query('school_year') schoolYear?: string,
    @Query('semester') semester?: string,
    @Query('type') type?: string,
  ) {
    return this.scoresService.getRewardDiscipline(
      studentId,
      schoolYear,
      semester,
      type,
    );
  }
}

@Controller('api/v1/admin')
@RequireRole('admin', 'super_admin')
export class AdminScoresController {
  constructor(private readonly scoresService: ScoresService) {}

  @Post('scores')
  saveScore(@Body() body: SaveScoreDto) {
    return this.scoresService.saveScoreRecord(body);
  }

  @Post('reward-discipline')
  saveRewardDiscipline(@Body() body: SaveRewardDisciplineDto) {
    return this.scoresService.saveRewardDisciplineRecord(body);
  }
}
