import { Body, Controller, Post } from '@nestjs/common';
import { CurrentUser } from '../../common/auth/current-user.decorator';
import { Public } from '../../common/auth/public.decorator';
import { SkipAuthorization } from '../../common/auth/skip-authorization.decorator';
import type { AuthenticatedUser } from '../../common/auth/authenticated-user';
import { AuthService } from './auth.service';
import type {
  LoginRequestDto,
  LogoutRequestDto,
  RefreshTokenRequestDto,
} from './dto/auth.dto';
import {
  validateLogin,
  validateLogout,
  validateRefreshToken,
} from './identity-access.validation';

@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  login(@Body() payload: LoginRequestDto) {
    return this.authService.login(validateLogin(payload));
  }

  @Public()
  @Post('refresh-token')
  refreshToken(@Body() payload: RefreshTokenRequestDto) {
    return this.authService.refreshToken(validateRefreshToken(payload));
  }

  @SkipAuthorization()
  @Post('logout')
  logout(
    @CurrentUser() user: AuthenticatedUser | undefined,
    @Body() payload: LogoutRequestDto,
  ) {
    return this.authService.logout(user, validateLogout(payload));
  }
}
