import { Test, TestingModule } from '@nestjs/testing';
import { IdentityAccessModule } from './identity-access.module';
import { AuthController } from './auth.controller';
import { AccountController } from './account.controller';

describe('IdentityAccessModule', () => {
  it('registers auth and account controllers', async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [IdentityAccessModule],
    }).compile();

    expect(module.get(AuthController)).toBeInstanceOf(AuthController);
    expect(module.get(AccountController)).toBeInstanceOf(AccountController);
  });
});
