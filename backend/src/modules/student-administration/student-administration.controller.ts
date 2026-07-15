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
import { CurrentUser } from '../../common/auth/current-user.decorator';
import { RequirePermission } from '../../common/auth/require-permission.decorator';
import type { AuthenticatedUser } from '../../common/auth/authenticated-user';
import type {
  ReplaceStudentAccountsRequestDto,
  StudentListQueryDto,
  StudentWriteRequestDto,
} from './dto/student-administration.dto';
import { StudentAdministrationService } from './student-administration.service';
import {
  validateCreateStudent,
  validateReplaceStudentAccounts,
  validateStudentListQuery,
  validateUpdateStudent,
} from './student-administration.validation';

@Controller('api/v1/admin/students')
export class StudentAdministrationController {
  constructor(
    private readonly studentAdministrationService: StudentAdministrationService,
  ) {}

  @Get()
  @RequirePermission('students.read')
  listStudents(
    @Query() query: StudentListQueryDto,
    @CurrentUser() actor: AuthenticatedUser | undefined,
  ) {
    return this.studentAdministrationService.listStudents(
      validateStudentListQuery(query),
      actor,
    );
  }

  @Post()
  @RequirePermission('students.manage')
  createStudent(
    @Body() payload: StudentWriteRequestDto,
    @CurrentUser() actor: AuthenticatedUser | undefined,
  ) {
    return this.studentAdministrationService.createStudent(
      validateCreateStudent(payload),
      actor,
    );
  }

  @Get(':id')
  @RequirePermission('students.read')
  getStudent(
    @Param('id') id: string,
    @CurrentUser() actor: AuthenticatedUser | undefined,
  ) {
    return this.studentAdministrationService.getStudent(id, actor);
  }

  @Patch(':id')
  @RequirePermission('students.manage')
  updateStudent(
    @Param('id') id: string,
    @Body() payload: StudentWriteRequestDto,
    @CurrentUser() actor: AuthenticatedUser | undefined,
  ) {
    return this.studentAdministrationService.updateStudent(
      id,
      validateUpdateStudent(payload),
      actor,
    );
  }

  @Put(':id/accounts')
  @RequirePermission('students.accounts.manage')
  replaceStudentAccounts(
    @Param('id') id: string,
    @Body() payload: ReplaceStudentAccountsRequestDto,
    @CurrentUser() actor: AuthenticatedUser | undefined,
  ) {
    return this.studentAdministrationService.replaceStudentAccounts(
      id,
      validateReplaceStudentAccounts(payload),
      actor,
    );
  }
}
