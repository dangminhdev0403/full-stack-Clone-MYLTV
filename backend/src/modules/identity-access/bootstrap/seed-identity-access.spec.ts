import { seedIdentityAccess } from './seed-identity-access';

describe('seedIdentityAccess', () => {
  it('fails closed when the bootstrap username belongs to an existing account', async () => {
    const permissionUpsert = jest.fn().mockResolvedValue(undefined);
    const accountFindUnique = jest.fn().mockResolvedValue({ id: 'admin-1' });
    const accountCreate = jest.fn();
    const accountPermissionUpsert = jest.fn().mockResolvedValue(undefined);
    const prisma = {
      permission: { upsert: permissionUpsert },
      account: { findUnique: accountFindUnique, create: accountCreate },
      accountPermission: { upsert: accountPermissionUpsert },
    };

    await expect(
      seedIdentityAccess(prisma as never, {
        username: 'admin',
        password: 'bootstrap-password',
      }),
    ).rejects.toThrow('Bootstrap administrator username already exists');
    expect(accountCreate).not.toHaveBeenCalled();
    expect(accountPermissionUpsert).not.toHaveBeenCalled();
  });

  it('does not grant permissions to an existing super administrator by username', async () => {
    const accountPermissionUpsert = jest.fn();
    const prisma = {
      permission: { upsert: jest.fn().mockResolvedValue(undefined) },
      account: {
        findUnique: jest
          .fn()
          .mockResolvedValue({ id: 'admin-1', role: 'super_admin' }),
        create: jest.fn(),
      },
      accountPermission: { upsert: accountPermissionUpsert },
    };

    await seedIdentityAccess(prisma as never, {
      username: 'admin',
      password: 'bootstrap-password',
    });

    expect(accountPermissionUpsert).not.toHaveBeenCalled();
  });
});
