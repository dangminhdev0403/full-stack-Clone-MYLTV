import type { PrismaService } from '../../../prisma/prisma.service';
import { PermissionService } from './permission.service';

type FindUniquePermissionArgs = {
  where: {
    accountId_permissionKey: {
      accountId: string;
      permissionKey: string;
    };
  };
  select: {
    accountId: true;
  };
};

type FindUniquePermission = (
  args: FindUniquePermissionArgs,
) => Promise<{ accountId: string } | null>;

describe('PermissionService', () => {
  it('returns true when the account has the requested business permission', async () => {
    const { prisma, findUnique } = prismaWithPermission({
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

  it('returns false when the account does not have the requested business permission', async () => {
    const { prisma } = prismaWithPermission(null);
    const service = new PermissionService(prisma);

    await expect(
      service.userHasPermission('account-1', 'identity.permissions.read'),
    ).resolves.toBe(false);
  });
});

function prismaWithPermission(permission: { accountId: string } | null) {
  const findUnique = jest
    .fn<ReturnType<FindUniquePermission>, Parameters<FindUniquePermission>>()
    .mockResolvedValue(permission);

  const prisma = {
    accountPermission: {
      findUnique,
    },
  } as unknown as PrismaService;

  return { prisma, findUnique };
}
