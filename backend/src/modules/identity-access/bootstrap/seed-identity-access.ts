import { hash } from 'bcrypt';
import type { PrismaClient } from '@prisma/client';
import { PERMISSIONS } from '../permissions/permission.registry';

export type SeedIdentityAccessOptions = {
  username: string;
  password: string;
};

export async function seedIdentityAccess(
  prisma: PrismaClient,
  options: SeedIdentityAccessOptions,
) {
  for (const permission of PERMISSIONS) {
    await prisma.permission.upsert({
      where: { key: permission.key },
      update: {
        label: permission.label,
        description: permission.description,
        boundedContext: permission.boundedContext,
        risk: permission.risk,
      },
      create: {
        key: permission.key,
        label: permission.label,
        description: permission.description,
        boundedContext: permission.boundedContext,
        risk: permission.risk,
      },
    });
  }

  const existing = await prisma.account.findUnique({
    where: { username: options.username },
    select: { id: true, role: true },
  });
  if (existing && existing.role !== 'super_admin') {
    throw new Error('Bootstrap administrator username already exists');
  }

  if (existing) {
    for (const permission of PERMISSIONS) {
      await prisma.accountPermission.upsert({
        where: {
          accountId_permissionKey: {
            accountId: existing.id,
            permissionKey: permission.key,
          },
        },
        update: {},
        create: {
          accountId: existing.id,
          permissionKey: permission.key,
        },
      });
    }
    return { adminId: existing.id, permissionCount: PERMISSIONS.length };
  }

  const admin = await prisma.account.create({
    data: {
      username: options.username,
      passwordHash: await hash(options.password, 12),
      displayName: 'System Admin',
      role: 'super_admin',
      isActive: true,
    },
    select: { id: true },
  });

  for (const permission of PERMISSIONS) {
    await prisma.accountPermission.upsert({
      where: {
        accountId_permissionKey: {
          accountId: admin.id,
          permissionKey: permission.key,
        },
      },
      update: {},
      create: {
        accountId: admin.id,
        permissionKey: permission.key,
      },
    });
  }

  return { adminId: admin.id, permissionCount: PERMISSIONS.length };
}
