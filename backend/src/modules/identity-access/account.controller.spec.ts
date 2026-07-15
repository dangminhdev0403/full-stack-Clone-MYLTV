import { Test, TestingModule } from '@nestjs/testing';
import { ok } from '../../common/http/api-response';
import type { ApiSuccessEnvelope } from '../../common/http/api-response';
import type { AuthenticatedUser } from '../../common/auth/authenticated-user';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';
import type {
  ChangePasswordRequestDto,
  ChangePasswordResponseDto,
  CurrentActorResponseDto,
} from './dto/account.dto';

type GetCurrentActorFn = (
  user: AuthenticatedUser | undefined,
) => Promise<ApiSuccessEnvelope<CurrentActorResponseDto>>;
type ChangePasswordFn = (
  user: AuthenticatedUser | undefined,
  payload: ChangePasswordRequestDto,
) => Promise<ApiSuccessEnvelope<ChangePasswordResponseDto>>;

describe('AccountController', () => {
  let controller: AccountController;
  let getCurrentActor: jest.MockedFunction<GetCurrentActorFn>;
  let changePassword: jest.MockedFunction<ChangePasswordFn>;

  beforeEach(async () => {
    getCurrentActor = jest
      .fn<ReturnType<GetCurrentActorFn>, Parameters<GetCurrentActorFn>>()
      .mockResolvedValue(
        ok({
          account: {
            id: 'account-1',
            username: 'admin',
            display_name: 'System Admin',
            role: 'super_admin',
            permissions: ['identity.me.read'],
          },
          active_student_id: null,
        }),
      );
    changePassword = jest
      .fn<ReturnType<ChangePasswordFn>, Parameters<ChangePasswordFn>>()
      .mockResolvedValue(ok({ changed: true }));

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccountController],
      providers: [
        {
          provide: AccountService,
          useValue: {
            getCurrentActor,
            changePassword,
          },
        },
      ],
    }).compile();

    controller = module.get(AccountController);
  });

  it('rejects invalid password-change payloads before calling AccountService', () => {
    expect(() =>
      controller.changePassword(actor(), {
        old_password: '',
        new_password: 'short',
        confirm_password: 'different',
      }),
    ).toThrow('Invalid request payload');
    expect(changePassword.mock.calls).toHaveLength(0);
  });

  it('returns the current actor envelope from AccountService', async () => {
    const user = actor();
    const result = await controller.getCurrentActor(user);

    expect(result.success).toBe(true);
    expect(result.data.active_student_id).toBeNull();
    expect(getCurrentActor).toHaveBeenCalledWith(user);
  });

  it('delegates password change requests to AccountService', async () => {
    const user = actor();
    const payload = {
      old_password: 'old-password',
      new_password: 'new-password',
      confirm_password: 'new-password',
    };

    const result = await controller.changePassword(user, payload);

    expect(result.success).toBe(true);
    expect(result.data.changed).toBe(true);
    expect(changePassword).toHaveBeenCalledWith(user, payload);
  });
});

function actor(): AuthenticatedUser {
  return {
    id: 'account-1',
    username: 'admin',
    role: 'super_admin',
  };
}
