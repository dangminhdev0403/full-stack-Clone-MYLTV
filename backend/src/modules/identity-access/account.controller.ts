import { Body, Controller, Get, Put } from '@nestjs/common';
import { CurrentUser } from '../../common/auth/current-user.decorator';
import { SkipAuthorization } from '../../common/auth/skip-authorization.decorator';
import type { AuthenticatedUser } from '../../common/auth/authenticated-user';
import { AccountService } from './account.service';
import type { ChangePasswordRequestDto } from './dto/account.dto';
import { validateChangePassword } from './identity-access.validation';

@SkipAuthorization()
@Controller('api/v1/me')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Get()
  getCurrentActor(@CurrentUser() user: AuthenticatedUser | undefined) {
    return this.accountService.getCurrentActor(user);
  }

  @Put('password')
  changePassword(
    @CurrentUser() user: AuthenticatedUser | undefined,
    @Body() payload: ChangePasswordRequestDto,
  ) {
    return this.accountService.changePassword(
      user,
      validateChangePassword(payload),
    );
  }
}
