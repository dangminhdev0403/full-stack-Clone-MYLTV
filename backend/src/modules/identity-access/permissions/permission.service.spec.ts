import type { PrismaService } from '../../../prisma/prisma.service';
import { PermissionService } from './permission.service';

describe('PermissionService', () => {
  it('returns true when the account has the requested business permission via direct permission', async () => {
    const { prisma, findUnique } = prismaWithDirectPermission({
      accountId: 'account-1',
    });
    const service = new PermissionService(prisma);

    await expect(
      service.userHasPermission('account-1', 'identity.permissions.read'),
    ).resolves.toBe(true);

    expect(findUnique).toHaveBeenCalledWith({
      where: {
        accountId_permissionKey: {
          accountId: 'account-1',
          permissionKey: 'identity.permissions.read',
        },
      },
      select: {
        accountId: true,
      },
    });
  });

  it('returns true when the account has the requested business permission via active dynamic role', async () => {
    const { prisma } = prismaWithRolePermission(true);
    const service = new PermissionService(prisma);

    await expect(
      service.userHasPermission('account-1', 'identity.permissions.read'),
    ).resolves.toBe(true);
  });

  it('returns false when the account dynamic role is inactive or not assigned', async () => {
    const { prisma } = prismaWithRolePermission(false);
    const service = new PermissionService(prisma);

    await expect(
      service.userHasPermission('account-1', 'identity.permissions.read'),
    ).resolves.toBe(false);
  });

  it('returns false when the account does not have the requested business permission', async () => {
    const { prisma } = prismaWithNoPermission();
    const service = new PermissionService(prisma);

    await expect(
      service.userHasPermission('account-1', 'identity.permissions.read'),
    ).resolves.toBe(false);
  });

  it('returns union of direct and active dynamic role permissions for getAccountPermissions', async () => {
    const prisma = {
      accountPermission: {
        findMany: jest
          .fn()
          .mockResolvedValue([
            { permissionKey: 'direct.perm.1' },
            { permissionKey: 'shared.perm' },
          ]),
      },
      accountRoleAssignment: {
        findMany: jest.fn().mockResolvedValue([
          {
            role: {
              rolePermissions: [
                { permissionKey: 'role.perm.1' },
                { permissionKey: 'shared.perm' },
              ],
            },
          },
        ]),
      },
    } as unknown as PrismaService;

    const service = new PermissionService(prisma);
    const permissions = await service.getAccountPermissions('account-1');

    expect(permissions).toEqual([
      'direct.perm.1',
      'role.perm.1',
      'shared.perm',
    ]);
  });
});

function prismaWithDirectPermission(permission: { accountId: string } | null) {
  const findUnique = jest.fn().mockResolvedValue(permission);
  const findFirst = jest.fn().mockResolvedValue(null);

  const prisma = {
    accountPermission: {
      findUnique,
    },
    accountRoleAssignment: {
      findFirst,
    },
  } as unknown as PrismaService;

  return { prisma, findUnique };
}

function prismaWithRolePermission(hasRole: boolean) {
  const findUnique = jest.fn().mockResolvedValue(null);
  const findFirst = jest
    .fn()
    .mockResolvedValue(hasRole ? { accountId: 'account-1' } : null);

  const prisma = {
    accountPermission: {
      findUnique,
    },
    accountRoleAssignment: {
      findFirst,
    },
  } as unknown as PrismaService;

  return { prisma, findFirst };
}

function prismaWithNoPermission() {
  const findUnique = jest.fn().mockResolvedValue(null);
  const findFirst = jest.fn().mockResolvedValue(null);

  const prisma = {
    accountPermission: {
      findUnique,
    },
    accountRoleAssignment: {
      findFirst,
    },
  } as unknown as PrismaService;

  return { prisma };
}
