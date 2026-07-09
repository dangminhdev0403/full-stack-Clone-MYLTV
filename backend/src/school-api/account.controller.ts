import { Body, Controller, Get, Headers, Post } from '@nestjs/common';
import { ok } from '../common/api-response';
import { AccountService } from './account.service';

@Controller('api/v1/me')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Get('student')
  async student(@Headers('x-account-id') accountId?: string) {
    return ok(await this.accountService.getCurrentStudent(accountId));
  }

  @Get('accounts')
  async accounts(@Headers('x-account-id') accountId?: string) {
    return ok(await this.accountService.getAccounts(accountId));
  }

  @Post('accounts/switch')
  async switchAccount(
    @Body() body: { account_id: string; student_id: string },
  ) {
    return ok(
      await this.accountService.switchAccount(body.account_id, body.student_id),
    );
  }
}
