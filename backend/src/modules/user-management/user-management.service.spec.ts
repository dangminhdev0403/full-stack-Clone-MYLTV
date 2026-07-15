import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { compare } from 'bcrypt';
import type { PrismaService } from '../../prisma/prisma.service';
import { UserManagementService } from './user-management.service';
type PermissionGrant = { permissionKey: string };
type AccountRecord = {
  id: string;
  username: string;
  passwordHash: string;
  displayName: string;
  role: 'admin' | 'super_admin';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  permissions: PermissionGrant[];
};
type TransactionCallback = (tx: ReturnType<typeof prismaMock>) => unknown;
type AccountUpdateArgs = {
  where: { id: string };
  data: Partial<AccountRecord>;
};

describe('UserManagementService', () => {
  it('lists users with filters and pagination without passwordHash', async () => {
    const account = accountRecord({ passwordHash: 'leaked-hash' });
    const prisma = prismaMock();
    prisma.account.findMany.mockResolvedValue([account]);
    prisma.account.count.mockResolvedValue(1);
    const service = new UserManagementService(
      prisma as unknown as PrismaService,
    );

    const result = await service.listUsers({
      q: 'adm',
      role: 'admin',
      is_active: 'true',
      page: '2',
      page_size: '10',
    });

    const listArgs = prisma.account.findMany.mock.calls[0]?.[0];
    expect(listArgs).toMatchObject({
      where: { role: 'admin', isActive: true },
      skip: 10,
      take: 10,
    });
    expect(listArgs).toHaveProperty('select');
    expect(JSON.stringify(listArgs?.select)).not.toContain('passwordHash');
    expect(result.data).toEqual(
      expect.objectContaining({ page: 2, page_size: 10, total: 1 }),
    );
    expect(JSON.stringify(result)).not.toContain('passwordHash');
  });

  it('returns user detail with permission keys and 404 for missing users', async () => {
    const prisma = prismaMock();
    prisma.account.findUnique.mockResolvedValueOnce(
      accountRecord({ permissions: [{ permissionKey: 'users.manage' }] }),
    );
    const service = new UserManagementService(
      prisma as unknown as PrismaService,
    );

    const result = await service.getUser('account-1');
    expect(result.data.permission_keys).toEqual(['users.manage']);
    const findArgs = prisma.account.findUnique.mock.calls[0]?.[0];
    expect(findArgs).toHaveProperty('select');
    expect(JSON.stringify(findArgs?.select)).not.toContain('passwordHash');

    prisma.account.findUnique.mockResolvedValueOnce(null);
    await expect(service.getUser('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('creates users with hashed passwords and transactionally assigned permissions', async () => {
    const prisma = prismaMock();
    prisma.permission.findMany.mockResolvedValue([{ key: 'users.manage' }]);
    prisma.$transaction.mockImplementation((callback: TransactionCallback) =>
      Promise.resolve(callback(prisma)),
    );
    prisma.account.create.mockResolvedValue(accountRecord());
    prisma.account.findUnique.mockResolvedValue(
      accountRecord({ permissions: [{ permissionKey: 'users.manage' }] }),
    );
    const service = new UserManagementService(
      prisma as unknown as PrismaService,
    );

    await service.createUser({
      username: 'admin',
      display_name: 'Admin',
      role: 'admin',
      password: 'plain-password',
      permission_keys: ['users.manage'],
    });

    expect(prisma.$transaction).toHaveBeenCalled();
    const createArgs = prisma.account.create.mock.calls[0]?.[0] as
      { data: { passwordHash: string } } | undefined;
    if (!createArgs) {
      throw new Error('account create was not called');
    }
    const createdPasswordHash = createArgs.data.passwordHash;
    expect(createdPasswordHash).not.toBe('plain-password');
    await expect(compare('plain-password', createdPasswordHash)).resolves.toBe(
      true,
    );
    expect(prisma.accountPermission.createMany).toHaveBeenCalledWith({
      data: [{ accountId: 'account-1', permissionKey: 'users.manage' }],
      skipDuplicates: true,
    });
  });

  it('prevents admins from creating or promoting super administrators', async () => {
    const prisma = prismaMock();
    prisma.account.findUnique.mockResolvedValue(accountRecord());
    const service = new UserManagementService(
      prisma as unknown as PrismaService,
    );
    const adminActor = {
      id: 'actor-1',
      username: 'admin',
      role: 'admin' as const,
    };

    await expect(
      service.createUser(
        {
          username: 'root',
          display_name: 'Root',
          role: 'super_admin',
          password: 'plain-password',
          permission_keys: ['users.manage'],
        },
        adminActor,
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
    await expect(
      service.updateUser('account-1', { role: 'super_admin' }, adminActor),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('rejects invalid permission keys and unique username conflicts', async () => {
    const prisma = prismaMock();
    prisma.permission.findMany.mockResolvedValue([]);
    const service = new UserManagementService(
      prisma as unknown as PrismaService,
    );

    await expect(
      service.createUser({
        username: 'bad',
        display_name: 'Bad',
        role: 'admin',
        password: 'plain-password',
        permission_keys: ['invalid.permission'],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);

    prisma.permission.findMany.mockResolvedValue([{ key: 'users.manage' }]);
    prisma.$transaction.mockRejectedValue({ code: 'P2002' });
    await expect(
      service.createUser({
        username: 'admin',
        display_name: 'Admin',
        role: 'admin',
        password: 'plain-password',
        permission_keys: ['users.manage'],
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('updates account fields and permission joins transactionally', async () => {
    const prisma = prismaMock();
    prisma.account.findUnique
      .mockResolvedValueOnce(accountRecord())
      .mockResolvedValueOnce(
        accountRecord({
          displayName: 'Updated',
          permissions: [{ permissionKey: 'users.manage' }],
        }),
      );
    prisma.permission.findMany.mockResolvedValue([{ key: 'users.manage' }]);
    prisma.$transaction.mockImplementation((callback: TransactionCallback) =>
      Promise.resolve(callback(prisma)),
    );
    prisma.account.update.mockResolvedValue(
      accountRecord({ displayName: 'Updated' }),
    );
    const service = new UserManagementService(
      prisma as unknown as PrismaService,
    );

    const result = await service.updateUser(
      'account-1',
      {
        display_name: 'Updated',
        permission_keys: ['users.manage'],
      },
      { id: 'actor-1', username: 'root', role: 'super_admin' },
    );

    expect(result.data.display_name).toBe('Updated');
    expect(prisma.accountPermission.deleteMany).toHaveBeenCalledWith({
      where: { accountId: 'account-1' },
    });
    expect(prisma.accountPermission.createMany).toHaveBeenCalled();
  });

  it('rejects removing users.manage from the last active super admin', async () => {
    const prisma = prismaMock();
    prisma.account.findUnique.mockResolvedValue(
      accountRecord({ role: 'super_admin', isActive: true }),
    );
    prisma.permission.findMany.mockResolvedValue([{ key: 'identity.me.read' }]);
    prisma.account.count.mockResolvedValue(0);
    const service = new UserManagementService(
      prisma as unknown as PrismaService,
    );

    await expect(
      service.updateUser(
        'account-1',
        { permission_keys: ['identity.me.read'] },
        { id: 'actor-1', username: 'root', role: 'super_admin' },
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('allows updating the last active super admin when users.manage remains', async () => {
    const prisma = prismaMock();
    prisma.account.findUnique
      .mockResolvedValueOnce(
        accountRecord({ role: 'super_admin', isActive: true }),
      )
      .mockResolvedValueOnce(
        accountRecord({
          role: 'super_admin',
          displayName: 'Root Admin',
          permissions: [{ permissionKey: 'users.manage' }],
        }),
      );
    prisma.permission.findMany.mockResolvedValue([{ key: 'users.manage' }]);
    prisma.account.count.mockResolvedValue(0);
    prisma.$transaction.mockImplementation((callback: TransactionCallback) =>
      Promise.resolve(callback(prisma)),
    );
    prisma.account.update.mockResolvedValue(
      accountRecord({ role: 'super_admin', displayName: 'Root Admin' }),
    );
    const service = new UserManagementService(
      prisma as unknown as PrismaService,
    );

    const result = await service.updateUser(
      'account-1',
      {
        display_name: 'Root Admin',
        role: 'super_admin',
        permission_keys: ['users.manage'],
      },
      { id: 'actor-1', username: 'root', role: 'super_admin' },
    );

    expect(result.data.display_name).toBe('Root Admin');
    expect(prisma.$transaction).toHaveBeenCalled();
  });

  it('protects disabling self and the last active super admin', async () => {
    const prisma = prismaMock();
    prisma.account.findUnique.mockResolvedValue(
      accountRecord({ role: 'super_admin' }),
    );
    const service = new UserManagementService(
      prisma as unknown as PrismaService,
    );

    await expect(
      service.disableUser('actor-1', {
        id: 'actor-1',
        username: 'root',
        role: 'super_admin',
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);

    prisma.account.count.mockResolvedValue(0);
    await expect(
      service.disableUser('account-1', {
        id: 'actor-1',
        username: 'root',
        role: 'super_admin',
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('disables users and revokes active refresh sessions', async () => {
    const prisma = prismaMock();
    prisma.account.findUnique.mockResolvedValue(
      accountRecord({ role: 'admin' }),
    );
    prisma.$transaction.mockImplementation((callback: TransactionCallback) =>
      Promise.resolve(callback(prisma)),
    );
    const service = new UserManagementService(
      prisma as unknown as PrismaService,
    );

    await service.disableUser('account-1', {
      id: 'actor-1',
      username: 'root',
      role: 'super_admin',
    });

    expect(prisma.account.update).toHaveBeenCalledWith({
      where: { id: 'account-1' },
      data: { isActive: false },
    });
    const revokeArgs = prisma.refreshSession.updateMany.mock.calls[0]?.[0];
    expect(revokeArgs?.where).toEqual({
      accountId: 'account-1',
      revokedAt: null,
    });
    expect(revokeArgs?.data.revokedAt).toBeInstanceOf(Date);
  });

  it('resets password with hashing and revokes active refresh sessions', async () => {
    const prisma = prismaMock();
    prisma.account.findUnique.mockResolvedValue(accountRecord());
    prisma.$transaction.mockImplementation((callback: TransactionCallback) =>
      Promise.resolve(callback(prisma)),
    );
    const service = new UserManagementService(
      prisma as unknown as PrismaService,
    );

    await service.resetPassword('account-1', { password: 'new-secret' });

    const updateArgs = prisma.account.update.mock.calls[0]?.[0];
    const updatedPasswordHash = updateArgs?.data.passwordHash;
    if (typeof updatedPasswordHash !== 'string') {
      throw new Error('password update was not called');
    }
    expect(updatedPasswordHash).not.toBe('new-secret');
    await expect(compare('new-secret', updatedPasswordHash)).resolves.toBe(
      true,
    );
    expect(prisma.refreshSession.updateMany).toHaveBeenCalled();
  });
});

function accountRecord(overrides: Partial<AccountRecord> = {}): AccountRecord {
  const now = new Date('2026-07-11T00:00:00.000Z');
  return {
    id: 'account-1',
    username: 'admin',
    passwordHash: 'old-password-hash',
    displayName: 'Admin',
    role: 'admin',
    isActive: true,
    createdAt: now,
    updatedAt: now,
    permissions: [],
    ...overrides,
  };
}

function prismaMock() {
  return {
    $transaction: jest.fn(),
    account: {
      findMany: jest.fn<Promise<AccountRecord[]>, [unknown]>(),
      count: jest.fn(),
      findUnique: jest.fn<Promise<AccountRecord | null>, [unknown]>(),
      create: jest.fn<Promise<AccountRecord>, [unknown]>(),
      update: jest.fn<Promise<AccountRecord>, [AccountUpdateArgs]>(),
    },
    permission: {
      findMany: jest.fn<Promise<Array<{ key: string }>>, [unknown]>(),
    },
    accountPermission: {
      deleteMany: jest.fn(),
      createMany: jest.fn(),
    },
    refreshSession: {
      updateMany: jest.fn<
        Promise<{ count: number }>,
        [
          {
            where: { accountId: string; revokedAt: null };
            data: { revokedAt: Date };
          },
        ]
      >(),
    },
  };
}
