import { Body, Controller, Get, Post } from '@nestjs/common';
import { CurrentUser } from '../../common/auth/current-user.decorator';
import { SkipAuthorization } from '../../common/auth/skip-authorization.decorator';
import type { AuthenticatedUser } from '../../common/auth/authenticated-user';
import type { SwitchStudentRequestDto } from './dto/student-administration.dto';
import { StudentContextService } from './student-context.service';
import { validateSwitchStudent } from './student-administration.validation';

@SkipAuthorization()
@Controller('api/v1/me')
export class StudentContextController {
  constructor(private readonly studentContextService: StudentContextService) {}

  @Get('accounts')
  listSwitchableAccounts(@CurrentUser() user: AuthenticatedUser | undefined) {
    return this.studentContextService.listLinkedStudentsForCurrentAccount(user);
  }

  @Post('accounts/switch')
  switchAccount(
    @CurrentUser() user: AuthenticatedUser | undefined,
    @Body() payload: SwitchStudentRequestDto,
  ) {
    return this.studentContextService.switchActiveStudent(
      user,
      validateSwitchStudent(payload),
    );
  }

  @Get('student')
  getCurrentStudent(@CurrentUser() user: AuthenticatedUser | undefined) {
    return this.studentContextService.getCurrentStudent(user);
  }
}
