import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { hash } from 'bcrypt';
import type { PrismaService } from '../../prisma/prisma.service';
import { AccountService } from './account.service';
import type { AuthenticatedUser } from '../../common/auth/authenticated-user';
import type { PermissionService } from './permissions/permission.service';
import type { AuthAccountDto } from './dto/auth.dto';

type PermissionGrant = { permissionKey: string };
type AccountRecord = {
  id: string;
  username: string;
  displayName: string;
  role: AuthAccountDto['role'];
  isActive: boolean;
  passwordHash: string;
  permissions: PermissionGrant[];
};
type FindAccountArgs = {
  where: { id: string; isActive: boolean };
  include: { permissions: { select: { permissionKey: true } } };
};
type UpdateAccountArgs = {
  where: { id: string };
  data: { passwordHash: string };
};
type FindAccount = (args: FindAccountArgs) => Promise<AccountRecord | null>;
type UpdateAccount = (args: UpdateAccountArgs) => Promise<AccountRecord>;
type RevokeRefreshSessionsArgs = {
  where: { accountId: string; revokedAt: null };
  data: { revokedAt: Date };
};
type RevokeRefreshSessions = (
  args: RevokeRefreshSessionsArgs,
) => Promise<{ count: number }>;

describe('AccountService', () => {
  it('returns the current authenticated account from the database', async () => {
    const { prisma } = prismaForAccount(accountRecord());
    const service = new AccountService(prisma);

    const result = await service.getCurrentActor(actor());

    expect(result.success).toBe(true);
    expect(result.data.account.id).toBe('account-1');
    expect(result.data.account.permissions).toEqual(['identity.me.read']);
  });

  it('exposes union of active dynamic role permissions and legacy direct permissions via PermissionService in getCurrentActor', async () => {
    const { prisma } = prismaForAccount(accountRecord());
    const mockPermissionService = {
      getAccountPermissions: jest
        .fn()
        .mockResolvedValue([
          'identity.me.read',
          'identity.roles.read',
          'communication.news.manage',
        ]),
    } as unknown as PermissionService;
    const service = new AccountService(prisma, mockPermissionService);

    const result = await service.getCurrentActor(actor());

    expect(result.success).toBe(true);
    /* eslint-disable @typescript-eslint/unbound-method */
    expect(mockPermissionService.getAccountPermissions).toHaveBeenCalledWith(
      'account-1',
    );
    /* eslint-enable @typescript-eslint/unbound-method */
    expect(result.data.account.permissions).toEqual([
      'identity.me.read',
      'identity.roles.read',
      'communication.news.manage',
    ]);
  });

  it('changes password only after verifying the current password and confirmation', async () => {
    const passwordHash = await hash('old-password', 4);
    const { prisma, updateAccount, revokeRefreshSessions } = prismaForAccount(
      accountRecord({ passwordHash }),
    );
    const service = new AccountService(prisma);

    const result = await service.changePassword(actor(), {
      old_password: 'old-password',
      new_password: 'new-password',
      confirm_password: 'new-password',
    });

    expect(result).toEqual({ success: true, data: { changed: true } });
    const updateArgs = updateAccount.mock.calls[0]?.[0];
    expect(updateArgs).toBeDefined();
    if (!updateArgs) {
      throw new Error('account update was not called');
    }
    expect(updateArgs.where.id).toBe('account-1');
    expect(updateArgs.data.passwordHash).toEqual(expect.any(String));
    const revokeArgs = revokeRefreshSessions.mock.calls[0]?.[0];
    expect(revokeArgs?.where).toEqual({
      accountId: 'account-1',
      revokedAt: null,
    });
    expect(revokeArgs?.data.revokedAt).toBeInstanceOf(Date);
  });

  it('rejects password change when confirmation does not match', async () => {
    const { prisma } = prismaForAccount(accountRecord());
    const service = new AccountService(prisma);

    await expect(
      service.changePassword(actor(), {
        old_password: 'old-password',
        new_password: 'new-password',
        confirm_password: 'different-password',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects missing authenticated users', async () => {
    const { prisma } = prismaForAccount(accountRecord());
    const service = new AccountService(prisma);

    await expect(service.getCurrentActor(undefined)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });
});

function actor(): AuthenticatedUser {
  return {
    id: 'account-1',
    username: 'admin',
    role: 'super_admin',
  };
}

function accountRecord(overrides: Partial<AccountRecord> = {}): AccountRecord {
  return {
    id: 'account-1',
    username: 'admin',
    displayName: 'System Admin',
    role: 'super_admin',
    isActive: true,
    passwordHash: 'unused',
    permissions: [{ permissionKey: 'identity.me.read' }],
    ...overrides,
  };
}

function prismaForAccount(account: AccountRecord) {
  const findAccount = jest
    .fn<ReturnType<FindAccount>, Parameters<FindAccount>>()
    .mockResolvedValue(account);
  const updateAccount = jest
    .fn<ReturnType<UpdateAccount>, Parameters<UpdateAccount>>()
    .mockResolvedValue(account);
  const revokeRefreshSessions = jest
    .fn<ReturnType<RevokeRefreshSessions>, Parameters<RevokeRefreshSessions>>()
    .mockResolvedValue({ count: 1 });

  const prisma = {
    account: {
      findFirst: findAccount,
      update: updateAccount,
    },
    refreshSession: { updateMany: revokeRefreshSessions },
  } as unknown as PrismaService;

  return { prisma, findAccount, updateAccount, revokeRefreshSessions };
}
