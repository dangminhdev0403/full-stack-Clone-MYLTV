import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import type { AuthenticatedUser } from '../../../common/auth/authenticated-user';
import { CurrentUser } from '../../../common/auth/current-user.decorator';
import { RequirePermission } from '../../../common/auth/require-permission.decorator';
import { RequireRole } from '../../../common/auth/require-role.decorator';
import { SkipAuthorization } from '../../../common/auth/skip-authorization.decorator';
import { ScoresService } from './scores.service';
import {
  ListScoresQueryDto,
  SaveRewardDisciplineDto,
  SaveScoreDto,
  validateListScores,
  validateSaveRewardDiscipline,
  validateSaveScore,
} from './scores.validation';

@SkipAuthorization()
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

  @Get('scores')
  @RequirePermission('academics.scores.read')
  listScores(@Query() query: ListScoresQueryDto) {
    return this.scoresService.listScores(validateListScores(query));
  }

  @Get('students/:student_id/scores')
  @RequirePermission('academics.scores.read')
  getScores(
    @Param('student_id') studentId: string,
    @Query('school_year') schoolYear?: string,
    @Query('semester') semester?: string,
  ) {
    return this.scoresService.getStudentScores(studentId, schoolYear, semester);
  }

  @Get('students/:student_id/reward-discipline')
  @RequirePermission('academics.scores.read')
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

  @Post('scores')
  @RequirePermission('academics.scores.manage')
  saveScore(
    @Body() body: SaveScoreDto,
    @CurrentUser() actor?: AuthenticatedUser,
  ) {
    return this.scoresService.saveScoreRecord(validateSaveScore(body), actor);
  }

  @Post('reward-discipline')
  @RequirePermission('academics.scores.manage')
  saveRewardDiscipline(
    @Body() body: SaveRewardDisciplineDto,
    @CurrentUser() actor?: AuthenticatedUser,
  ) {
    return this.scoresService.saveRewardDisciplineRecord(
      validateSaveRewardDiscipline(body),
      actor,
    );
  }
}
