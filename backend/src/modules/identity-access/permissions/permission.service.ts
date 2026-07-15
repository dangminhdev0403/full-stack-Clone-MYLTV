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
    const permission = await this.prisma.accountPermission.findUnique({
      where: {
        accountId_permissionKey: {
          accountId,
          permissionKey,
        },
      },
      select: {
        accountId: true,
      },
    });

    return permission !== null;
  }
}
