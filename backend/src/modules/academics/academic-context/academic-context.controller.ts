import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import type { AuthenticatedUser } from '../../../common/auth/authenticated-user';
import { CurrentUser } from '../../../common/auth/current-user.decorator';
import { RequirePermission } from '../../../common/auth/require-permission.decorator';
import { RequireRole } from '../../../common/auth/require-role.decorator';
import { AcademicContextService } from './academic-context.service';
import {
  validateCreateAcademicYear,
  validateCreateSemester,
  validateUpdateAcademicYear,
  validateUpdateSemester,
} from './academic-context.validation';

@Controller('api/v1/admin/academic-context')
@RequireRole('admin', 'super_admin')
export class AcademicContextController {
  constructor(private readonly academicContext: AcademicContextService) {}

  @Get('current')
  @RequirePermission('academics.context.read')
  getCurrent() {
    return this.academicContext.getCurrentContext();
  }

  @Get('years')
  @RequirePermission('academics.context.read')
  listYears() {
    return this.academicContext.listYears();
  }

  @Post('years')
  @RequirePermission('academics.context.manage')
  createYear(
    @Body() payload: unknown,
    @CurrentUser() actor: AuthenticatedUser | undefined,
  ) {
    return this.academicContext.createYear(
      validateCreateAcademicYear(payload),
      actor,
    );
  }

  @Put('years/:id')
  @Patch('years/:id')
  @RequirePermission('academics.context.manage')
  updateYear(
    @Param('id') id: string,
    @Body() payload: unknown,
    @CurrentUser() actor: AuthenticatedUser | undefined,
  ) {
    return this.academicContext.updateYear(
      id,
      validateUpdateAcademicYear(payload),
      actor,
    );
  }

  @Post('years/:id/set-current')
  @Put('years/:id/set-current')
  @RequirePermission('academics.context.manage')
  setYearCurrent(
    @Param('id') id: string,
    @CurrentUser() actor: AuthenticatedUser | undefined,
  ) {
    return this.academicContext.setYearCurrent(id, actor);
  }

  @Get('semesters')
  @RequirePermission('academics.context.read')
  listSemesters(@Query('academic_year_id') academicYearId?: string) {
    return this.academicContext.listSemesters(academicYearId);
  }

  @Post('semesters')
  @RequirePermission('academics.context.manage')
  createSemester(
    @Body() payload: unknown,
    @CurrentUser() actor: AuthenticatedUser | undefined,
  ) {
    return this.academicContext.createSemester(
      validateCreateSemester(payload),
      actor,
    );
  }

  @Put('semesters/:id')
  @Patch('semesters/:id')
  @RequirePermission('academics.context.manage')
  updateSemester(
    @Param('id') id: string,
    @Body() payload: unknown,
    @CurrentUser() actor: AuthenticatedUser | undefined,
  ) {
    return this.academicContext.updateSemester(
      id,
      validateUpdateSemester(payload),
      actor,
    );
  }

  @Post('semesters/:id/set-current')
  @Put('semesters/:id/set-current')
  @RequirePermission('academics.context.manage')
  setSemesterCurrent(
    @Param('id') id: string,
    @CurrentUser() actor: AuthenticatedUser | undefined,
  ) {
    return this.academicContext.setSemesterCurrent(id, actor);
  }
}
