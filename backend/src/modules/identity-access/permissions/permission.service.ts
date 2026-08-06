import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import type { PermissionKey } from './permission.registry';

@Injectable()
export class PermissionService {
  constructor(private readonly prisma: PrismaService) {}

  async userHasPermission(
    accountId: string,
    permissionKey: PermissionKey,
  ): Promise<boolean> {
    const [directPermission, roleAssignment] = await Promise.all([
      this.prisma.accountPermission.findUnique({
        where: {
          accountId_permissionKey: {
            accountId,
            permissionKey,
          },
        },
        select: {
          accountId: true,
        },
      }),
      this.prisma.accountRoleAssignment.findFirst({
        where: {
          accountId,
          role: {
            isActive: true,
            rolePermissions: {
              some: {
                permissionKey,
              },
            },
          },
        },
        select: {
          accountId: true,
        },
      }),
    ]);

    return directPermission !== null || roleAssignment !== null;
  }

  async getAccountPermissions(accountId: string): Promise<string[]> {
    const [directPermissions, roleAssignments] = await Promise.all([
      this.prisma.accountPermission.findMany({
        where: { accountId },
        select: { permissionKey: true },
      }),
      this.prisma.accountRoleAssignment.findMany({
        where: {
          accountId,
          role: { isActive: true },
        },
        select: {
          role: {
            select: {
              rolePermissions: {
                select: { permissionKey: true },
              },
            },
          },
        },
      }),
    ]);

    const set = new Set<string>();

    for (const dp of directPermissions) {
      set.add(dp.permissionKey);
    }

    for (const ra of roleAssignments) {
      if (ra.role?.rolePermissions) {
        for (const rp of ra.role.rolePermissions) {
          set.add(rp.permissionKey);
        }
      }
    }

    return Array.from(set).sort();
  }
}
