import { UnauthorizedException } from '@nestjs/common';
import { hash } from 'bcrypt';
import type { PrismaService } from '../../prisma/prisma.service';
import { AuthService } from './auth.service';
import type { AuthConfigService } from './config/auth-config.service';
import type { AuthTokenService } from './auth-token.service';
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
type RefreshSessionRecord = {
  id: string;
  accountId: string;
  revokedAt: Date | null;
  expiresAt: Date;
  account: AccountRecord;
};
type FindAccountArgs = {
  where: { username: string; isActive: boolean };
  include: { permissions: { select: { permissionKey: true } } };
};
type FindRefreshSessionArgs = {
  where: { tokenHash: string };
  include: {
    account: {
      include: { permissions: { select: { permissionKey: true } } };
    };
  };
};
type CreateRefreshSessionArgs = {
  data: {
    accountId: string;
    tokenHash: string;
    expiresAt: Date;
  };
};
type UpdateRefreshSessionArgs = {
  where: { id: string; revokedAt: null };
  data: { revokedAt: Date };
};
type FindAccount = (args: FindAccountArgs) => Promise<AccountRecord | null>;
type FindRefreshSession = (
  args: FindRefreshSessionArgs,
) => Promise<RefreshSessionRecord | null>;
type CreateRefreshSession = (
  args: CreateRefreshSessionArgs,
) => Promise<{ id: string }>;
type UpdateRefreshSession = (
  args: UpdateRefreshSessionArgs,
) => Promise<{ count: number }>;

const permissions: PermissionGrant[] = [
  { permissionKey: 'identity.me.read' },
  { permissionKey: 'identity.sessions.revoke' },
];

describe('AuthService', () => {
  it('logs in an active account with bcrypt and stores a hashed refresh session', async () => {
    const passwordHash = await hash('valid-password', 4);
    const { prisma, findAccount, createRefreshSession } = prismaForAuth({
      account: accountRecord({ passwordHash }),
    });
    const service = new AuthService(prisma, authConfig(), authTokenService());

    const result = await service.login({
      username: 'admin',
      password: 'valid-password',
    });

    expect(result.success).toBe(true);
    expect(result.data.access_token).toBe('access-token');
    expect(result.data.refresh_token).toEqual(expect.any(String));
    expect(result.data.refresh_token).not.toBe('access-token');
    expect(result.data.account.permissions).toEqual([
      'identity.me.read',
      'identity.sessions.revoke',
    ]);
    expect(findAccount).toHaveBeenCalledWith({
      where: { username: 'admin', isActive: true },
      include: { permissions: { select: { permissionKey: true } } },
    });

    const createArgs = createRefreshSession.mock.calls[0]?.[0];
    expect(createArgs).toBeDefined();
    if (!createArgs) {
      throw new Error('refresh session create was not called');
    }
    expect(createArgs.data.accountId).toBe('account-1');
    expect(createArgs.data.tokenHash).toMatch(/^[a-f0-9]{64}$/);
    expect(createArgs.data.expiresAt).toBeInstanceOf(Date);
  });

  it('rejects invalid credentials without issuing tokens', async () => {
    const passwordHash = await hash('expected-password', 4);
    const { prisma, createRefreshSession } = prismaForAuth({
      account: accountRecord({ passwordHash }),
    });
    const { tokenService, issueAccessToken } = authTokenServiceMock();
    const service = new AuthService(prisma, authConfig(), tokenService);

    await expect(
      service.login({ username: 'admin', password: 'wrong-password' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(issueAccessToken).not.toHaveBeenCalled();
    expect(createRefreshSession).not.toHaveBeenCalled();
  });

  it('rotates valid refresh tokens and revokes the used session', async () => {
    const {
      prisma,
      findRefreshSession,
      updateRefreshSession,
      createRefreshSession,
    } = prismaForAuth({
      refreshSession: {
        id: 'session-1',
        accountId: 'account-1',
        revokedAt: null,
        expiresAt: new Date(Date.now() + 60_000),
        account: accountRecord({ passwordHash: 'unused' }),
      },
    });
    const service = new AuthService(prisma, authConfig(), authTokenService());

    const result = await service.refreshToken({
      refresh_token: 'valid-refresh',
    });

    expect(result.success).toBe(true);
    expect(result.data.access_token).toBe('access-token');
    expect(result.data.refresh_token).toEqual(expect.any(String));

    const findArgs = findRefreshSession.mock.calls[0]?.[0];
    expect(findArgs).toBeDefined();
    if (!findArgs) {
      throw new Error('refresh session lookup was not called');
    }
    expect(findArgs.where.tokenHash).toMatch(/^[a-f0-9]{64}$/);

    const updateArgs = updateRefreshSession.mock.calls[0]?.[0];
    expect(updateArgs).toBeDefined();
    if (!updateArgs) {
      throw new Error('refresh session update was not called');
    }
    expect(updateArgs.where.id).toBe('session-1');
    expect(updateArgs.where.revokedAt).toBeNull();
    expect(updateArgs.data.revokedAt).toBeInstanceOf(Date);

    const createArgs = createRefreshSession.mock.calls[0]?.[0];
    expect(createArgs).toBeDefined();
    if (!createArgs) {
      throw new Error('refresh session create was not called');
    }
    expect(createArgs.data.accountId).toBe('account-1');
    expect(createArgs.data.tokenHash).toMatch(/^[a-f0-9]{64}$/);
    expect(createArgs.data.expiresAt).toBeInstanceOf(Date);
  });

  it('rejects replay when another request already claimed the refresh session', async () => {
    const { prisma, updateRefreshSession, createRefreshSession } =
      prismaForAuth({
        refreshSession: {
          id: 'session-1',
          accountId: 'account-1',
          revokedAt: null,
          expiresAt: new Date(Date.now() + 60_000),
          account: accountRecord({ passwordHash: 'unused' }),
        },
        refreshClaimCount: 0,
      });
    const service = new AuthService(prisma, authConfig(), authTokenService());

    await expect(
      service.refreshToken({ refresh_token: 'replayed-refresh' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(updateRefreshSession).toHaveBeenCalled();
    expect(createRefreshSession).not.toHaveBeenCalled();
  });
});

function accountRecord(overrides: Partial<AccountRecord> = {}): AccountRecord {
  return {
    id: 'account-1',
    username: 'admin',
    displayName: 'System Admin',
    role: 'super_admin',
    isActive: true,
    passwordHash: 'unused',
    permissions,
    ...overrides,
  };
}

function authConfig(): AuthConfigService {
  return {
    jwtSecret: 'unit-test-secret',
    jwtExpiresInSeconds: 3600,
    refreshTokenTtlDays: 30,
    bootstrapAdminUsername: 'admin',
    bootstrapAdminPassword: 'not-used',
  } as AuthConfigService;
}

function authTokenService(): AuthTokenService {
  return {
    issueAccessToken: jest.fn().mockResolvedValue('access-token'),
  } as unknown as AuthTokenService;
}

function authTokenServiceMock() {
  const issueAccessToken = jest.fn().mockResolvedValue('access-token');
  return {
    tokenService: { issueAccessToken } as unknown as AuthTokenService,
    issueAccessToken,
  };
}

function prismaForAuth(options: {
  account?: AccountRecord;
  refreshSession?: RefreshSessionRecord;
  refreshClaimCount?: number;
}) {
  const findAccount = jest
    .fn<ReturnType<FindAccount>, Parameters<FindAccount>>()
    .mockResolvedValue(options.account ?? null);
  const findRefreshSession = jest
    .fn<ReturnType<FindRefreshSession>, Parameters<FindRefreshSession>>()
    .mockResolvedValue(options.refreshSession ?? null);
  const createRefreshSession = jest
    .fn<ReturnType<CreateRefreshSession>, Parameters<CreateRefreshSession>>()
    .mockResolvedValue({ id: 'session-2' });
  const updateRefreshSession = jest
    .fn<ReturnType<UpdateRefreshSession>, Parameters<UpdateRefreshSession>>()
    .mockResolvedValue({ count: options.refreshClaimCount ?? 1 });

  const prisma = {
    account: {
      findFirst: findAccount,
    },
    refreshSession: {
      findUnique: findRefreshSession,
      create: createRefreshSession,
      updateMany: updateRefreshSession,
    },
  } as unknown as PrismaService;

  return {
    prisma,
    findAccount,
    findRefreshSession,
    createRefreshSession,
    updateRefreshSession,
  };
}
