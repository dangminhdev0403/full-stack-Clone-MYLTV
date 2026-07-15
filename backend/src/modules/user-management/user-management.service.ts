import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { hash } from 'bcrypt';
import type { AccountRole, Prisma } from '@prisma/client';
import { ok } from '../../common/http/api-response';
import type { AuthenticatedUser } from '../../common/auth/authenticated-user';
import { PrismaService } from '../../prisma/prisma.service';
import { isPermissionKey } from '../identity-access/permissions/permission.registry';
import type { PermissionKey } from '../identity-access/permissions/permission.registry';
import type {
  CreateUserRequestDto,
  DisableUserResponseDto,
  ResetPasswordRequestDto,
  ResetPasswordResponseDto,
  UpdateUserRequestDto,
  UserDetailDto,
  UserListQueryDto,
  UserListResponseDto,
  UserSummaryDto,
} from './dto/user-management.dto';

type AccountWithPermissions = {
  id: string;
  username: string;
  displayName: string;
  role: AccountRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  permissions: Array<{ permissionKey: string }>;
};

const userSummarySelect = {
  id: true,
  username: true,
  displayName: true,
  role: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.AccountSelect;

const userDetailSelect = {
  ...userSummarySelect,
  permissions: { select: { permissionKey: true } },
} satisfies Prisma.AccountSelect;

@Injectable()
export class UserManagementService {
  constructor(private readonly prisma: PrismaService) {}

  async listUsers(query: UserListQueryDto) {
    const page = this.positiveInt(query.page, 1);
    const pageSize = Math.min(this.positiveInt(query.page_size, 20), 100);
    const where: Prisma.AccountWhereInput = {};

    if (query.q) {
      where.OR = [
        { username: { contains: query.q, mode: 'insensitive' } },
        { displayName: { contains: query.q, mode: 'insensitive' } },
      ];
    }
    if (query.role) {
      where.role = query.role;
    }
    if (query.is_active !== undefined) {
      where.isActive = this.booleanQuery(query.is_active);
    }

    const [items, total] = await Promise.all([
      this.prisma.account.findMany({
        where,
        select: userSummarySelect,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.account.count({ where }),
    ]);

    return ok<UserListResponseDto>({
      items: items.map((account) => this.toSummaryDto(account)),
      page,
      page_size: pageSize,
      total,
    });
  }

  async getUser(id: string) {
    const account = await this.findAccountOrThrow(id);
    return ok(this.toDetailDto(account));
  }

  async createUser(payload: CreateUserRequestDto, actor?: AuthenticatedUser) {
    this.assertCanManageRole(actor, payload.role);
    const permissionKeys = await this.validPermissionKeys(
      payload.permission_keys,
    );

    try {
      const account = await this.prisma.$transaction(async (tx) => {
        const created = await tx.account.create({
          data: {
            username: payload.username,
            displayName: payload.display_name,
            role: payload.role,
            passwordHash: await hash(payload.password, 12),
          },
          select: { id: true },
        });

        await tx.accountPermission.createMany({
          data: permissionKeys.map((permissionKey) => ({
            accountId: created.id,
            permissionKey,
          })),
          skipDuplicates: true,
        });

        return tx.account.findUnique({
          where: { id: created.id },
          select: userDetailSelect,
        });
      });

      if (!account) {
        throw new NotFoundException('User was not created');
      }

      return ok(this.toDetailDto(account));
    } catch (error) {
      this.mapPrismaWriteError(error);
    }
  }

  async updateUser(
    id: string,
    payload: UpdateUserRequestDto,
    actor: AuthenticatedUser | undefined,
  ) {
    const existing = await this.findAccountOrThrow(id);
    this.assertCanManageRole(actor, existing.role);
    if (payload.role !== undefined) {
      this.assertCanManageRole(actor, payload.role);
    }
    const permissionKeys =
      payload.permission_keys === undefined
        ? undefined
        : await this.validPermissionKeys(payload.permission_keys);

    if (
      existing.role === 'super_admin' &&
      existing.isActive &&
      ((payload.role !== undefined && payload.role !== 'super_admin') ||
        payload.is_active === false ||
        (permissionKeys !== undefined &&
          !permissionKeys.includes('users.manage')))
    ) {
      await this.assertNotLastActiveSuperAdmin(id);
    }

    const account = await this.prisma.$transaction(async (tx) => {
      if (permissionKeys !== undefined) {
        await tx.accountPermission.deleteMany({ where: { accountId: id } });
        await tx.accountPermission.createMany({
          data: permissionKeys.map((permissionKey) => ({
            accountId: id,
            permissionKey,
          })),
          skipDuplicates: true,
        });
      }

      await tx.account.update({
        where: { id },
        data: {
          ...(payload.display_name !== undefined
            ? { displayName: payload.display_name }
            : {}),
          ...(payload.role !== undefined ? { role: payload.role } : {}),
          ...(payload.is_active !== undefined
            ? { isActive: payload.is_active }
            : {}),
        },
      });

      return tx.account.findUnique({
        where: { id },
        select: userDetailSelect,
      });
    });

    if (!account) {
      throw new NotFoundException('User not found');
    }

    return ok(this.toDetailDto(account));
  }

  async disableUser(id: string, actor: AuthenticatedUser | undefined) {
    if (actor?.id === id) {
      throw new ForbiddenException('Users cannot disable their own account');
    }

    const account = await this.findAccountOrThrow(id);
    this.assertCanManageRole(actor, account.role);
    if (account.role === 'super_admin') {
      await this.assertNotLastActiveSuperAdmin(id);
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.account.update({ where: { id }, data: { isActive: false } });
      await tx.refreshSession.updateMany({
        where: { accountId: id, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    });

    return ok<DisableUserResponseDto>({ disabled: true });
  }

  async resetPassword(
    id: string,
    payload: ResetPasswordRequestDto,
    actor?: AuthenticatedUser,
  ) {
    const account = await this.findAccountOrThrow(id);
    this.assertCanManageRole(actor, account.role);
    const passwordHash = await hash(payload.password, 12);

    await this.prisma.$transaction(async (tx) => {
      await tx.account.update({
        where: { id },
        data: { passwordHash },
      });
      await tx.refreshSession.updateMany({
        where: { accountId: id, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    });

    return ok<ResetPasswordResponseDto>({ reset: true });
  }

  private async validPermissionKeys(keys: string[]): Promise<PermissionKey[]> {
    const permissionKeys = keys.filter(isPermissionKey);
    if (permissionKeys.length !== keys.length) {
      throw new BadRequestException('One or more permission keys are invalid');
    }

    const permissions = await this.prisma.permission.findMany({
      where: { key: { in: permissionKeys } },
      select: { key: true },
    });
    const persistedKeys = new Set(
      permissions.map((permission) => permission.key),
    );

    if (permissionKeys.some((key) => !persistedKeys.has(key))) {
      throw new BadRequestException('One or more permission keys are invalid');
    }

    return permissionKeys;
  }

  private assertCanManageRole(
    actor: AuthenticatedUser | undefined,
    targetRole: AccountRole,
  ): void {
    if (targetRole === 'super_admin' && actor?.role !== 'super_admin') {
      throw new ForbiddenException(
        'Only super administrators can manage super administrators',
      );
    }
  }

  private async findAccountOrThrow(
    id: string,
  ): Promise<AccountWithPermissions> {
    const account = await this.prisma.account.findUnique({
      where: { id },
      select: userDetailSelect,
    });

    if (!account) {
      throw new NotFoundException('User not found');
    }

    return account;
  }

  private async assertNotLastActiveSuperAdmin(id: string): Promise<void> {
    const activeSuperAdmins = await this.prisma.account.count({
      where: { role: 'super_admin', isActive: true, NOT: { id } },
    });
    if (activeSuperAdmins === 0) {
      throw new ForbiddenException('Cannot remove the last active super admin');
    }
  }

  private toSummaryDto(
    account: Omit<AccountWithPermissions, 'permissions'>,
  ): UserSummaryDto {
    return {
      id: account.id,
      username: account.username,
      display_name: account.displayName,
      role: account.role,
      is_active: account.isActive,
      created_at: account.createdAt.toISOString(),
      updated_at: account.updatedAt.toISOString(),
    };
  }

  private toDetailDto(account: AccountWithPermissions): UserDetailDto {
    return {
      ...this.toSummaryDto(account),
      permission_keys: account.permissions
        .map((permission) => permission.permissionKey)
        .filter(isPermissionKey),
    };
  }

  private positiveInt(
    value: string | number | undefined,
    fallback: number,
  ): number {
    const parsed = Number(value ?? fallback);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
  }

  private booleanQuery(value: string | boolean): boolean {
    return value === true || value === 'true';
  }

  private mapPrismaWriteError(error: unknown): never {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 'P2002'
    ) {
      throw new ConflictException('Username already exists');
    }
    throw error;
  }
}
