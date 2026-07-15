import { Test, TestingModule } from '@nestjs/testing';
import { ok } from '../../common/http/api-response';
import type { ApiSuccessEnvelope } from '../../common/http/api-response';
import type { AuthenticatedUser } from '../../common/auth/authenticated-user';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import type {
  LoginRequestDto,
  LoginResponseDto,
  LogoutRequestDto,
  LogoutResponseDto,
  RefreshTokenRequestDto,
  RefreshTokenResponseDto,
} from './dto/auth.dto';

type LoginFn = (
  payload: LoginRequestDto,
) => Promise<ApiSuccessEnvelope<LoginResponseDto>>;
type RefreshFn = (
  payload: RefreshTokenRequestDto,
) => Promise<ApiSuccessEnvelope<RefreshTokenResponseDto>>;
type LogoutFn = (
  user: AuthenticatedUser | undefined,
  payload: LogoutRequestDto,
) => Promise<ApiSuccessEnvelope<LogoutResponseDto>>;

describe('AuthController', () => {
  let controller: AuthController;
  let login: jest.MockedFunction<LoginFn>;
  let refreshToken: jest.MockedFunction<RefreshFn>;
  let logout: jest.MockedFunction<LogoutFn>;

  beforeEach(async () => {
    login = jest
      .fn<ReturnType<LoginFn>, Parameters<LoginFn>>()
      .mockResolvedValue(
        ok({
          access_token: 'access-token',
          refresh_token: 'refresh-token',
          expires_in: 3600,
          account: {
            id: 'account-1',
            username: 'admin',
            display_name: 'System Admin',
            role: 'super_admin',
            permissions: ['identity.me.read'],
          },
        }),
      );
    refreshToken = jest
      .fn<ReturnType<RefreshFn>, Parameters<RefreshFn>>()
      .mockResolvedValue(
        ok({
          access_token: 'new-access-token',
          refresh_token: 'new-refresh-token',
          expires_in: 3600,
        }),
      );
    logout = jest
      .fn<ReturnType<LogoutFn>, Parameters<LogoutFn>>()
      .mockResolvedValue(ok({ logged_out: true }));

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: { login, refreshToken, logout },
        },
      ],
    }).compile();

    controller = module.get(AuthController);
  });

  it('rejects invalid authentication payloads before calling AuthService', () => {
    expect(() => controller.login({ username: '', password: '' })).toThrow(
      'Invalid request payload',
    );
    expect(() => controller.refreshToken({ refresh_token: '' })).toThrow(
      'Invalid request payload',
    );

    expect(login.mock.calls).toHaveLength(0);
    expect(refreshToken.mock.calls).toHaveLength(0);
  });

  it('delegates login to AuthService and returns the shared envelope', async () => {
    const result = await controller.login({
      username: 'admin',
      password: 'secret',
    });

    expect(result.success).toBe(true);
    expect(result.data.access_token).toBe('access-token');
    expect(login).toHaveBeenCalledWith({
      username: 'admin',
      password: 'secret',
    });
  });

  it('delegates refresh-token requests to AuthService', async () => {
    const result = await controller.refreshToken({
      refresh_token: 'refresh-token',
    });

    expect(result.success).toBe(true);
    expect(result.data.access_token).toBe('new-access-token');
    expect(refreshToken).toHaveBeenCalledWith({
      refresh_token: 'refresh-token',
    });
  });

  it('delegates logout requests to AuthService with the current user', async () => {
    const user = actor();
    const result = await controller.logout(user, { device_id: null });

    expect(result).toEqual({ success: true, data: { logged_out: true } });
    expect(logout).toHaveBeenCalledWith(user, { device_id: null });
  });
});

function actor(): AuthenticatedUser {
  return {
    id: 'account-1',
    username: 'admin',
    role: 'super_admin',
  };
}
