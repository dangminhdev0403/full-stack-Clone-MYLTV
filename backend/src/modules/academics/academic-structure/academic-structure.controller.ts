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
import { AcademicStructureService } from './academic-structure.service';
import {
  validateAssignStudentEnrollment,
  validateCreateGradeLevel,
  validateCreateSchoolClass,
  validateListClassesQuery,
  validateUpdateGradeLevel,
  validateUpdateSchoolClass,
} from './academic-structure.validation';

@Controller('api/v1/admin/academic-structure')
@RequireRole('admin', 'super_admin')
export class AcademicStructureController {
  constructor(private readonly academicStructure: AcademicStructureService) {}

  @Get('grade-levels')
  @RequirePermission('academics.structure.read')
  listGradeLevels() {
    return this.academicStructure.listGradeLevels();
  }

  @Post('grade-levels')
  @RequirePermission('academics.structure.manage')
  createGradeLevel(
    @Body() payload: unknown,
    @CurrentUser() actor: AuthenticatedUser | undefined,
  ) {
    return this.academicStructure.createGradeLevel(
      validateCreateGradeLevel(payload),
      actor,
    );
  }

  @Put('grade-levels/:id')
  @Patch('grade-levels/:id')
  @RequirePermission('academics.structure.manage')
  updateGradeLevel(
    @Param('id') id: string,
    @Body() payload: unknown,
    @CurrentUser() actor: AuthenticatedUser | undefined,
  ) {
    return this.academicStructure.updateGradeLevel(
      id,
      validateUpdateGradeLevel(payload),
      actor,
    );
  }

  @Get('classes')
  @RequirePermission('academics.structure.read')
  listClasses(
    @Query('academic_year_id') academicYearId?: string,
    @Query('grade_level_id') gradeLevelId?: string,
    @Query('is_active') isActive?: string,
  ) {
    const query = validateListClassesQuery({
      academic_year_id: academicYearId,
      grade_level_id: gradeLevelId,
      is_active: isActive,
    });
    return this.academicStructure.listClasses(query);
  }

  @Post('classes')
  @RequirePermission('academics.structure.manage')
  createClass(
    @Body() payload: unknown,
    @CurrentUser() actor: AuthenticatedUser | undefined,
  ) {
    return this.academicStructure.createClass(
      validateCreateSchoolClass(payload),
      actor,
    );
  }

  @Put('classes/:id')
  @Patch('classes/:id')
  @RequirePermission('academics.structure.manage')
  updateClass(
    @Param('id') id: string,
    @Body() payload: unknown,
    @CurrentUser() actor: AuthenticatedUser | undefined,
  ) {
    return this.academicStructure.updateClass(
      id,
      validateUpdateSchoolClass(payload),
      actor,
    );
  }

  @Get('classes/:id/roster')
  @RequirePermission('academics.structure.read')
  getClassRoster(
    @Param('id') id: string,
    @Query('is_active') isActive?: string,
  ) {
    const isActiveFilter =
      isActive === undefined ? undefined : isActive.toLowerCase() === 'true';
    return this.academicStructure.getClassRoster(id, isActiveFilter);
  }

  @Post('classes/:id/enrollments')
  @RequirePermission('academics.structure.manage')
  assignStudentEnrollment(
    @Param('id') id: string,
    @Body() payload: unknown,
    @CurrentUser() actor: AuthenticatedUser | undefined,
  ) {
    return this.academicStructure.assignStudentEnrollment(
      id,
      validateAssignStudentEnrollment(payload),
      actor,
    );
  }

  @Post('classes/:id/enrollments/:student_id/deactivate')
  @RequirePermission('academics.structure.manage')
  deactivateStudentEnrollment(
    @Param('id') id: string,
    @Param('student_id') studentId: string,
    @CurrentUser() actor: AuthenticatedUser | undefined,
  ) {
    return this.academicStructure.deactivateStudentEnrollment(
      id,
      studentId,
      actor,
    );
  }
}
