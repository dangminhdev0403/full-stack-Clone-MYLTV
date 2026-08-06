import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { compare, hash } from 'bcrypt';
import { ok } from '../../common/http/api-response';
import { PrismaService } from '../../prisma/prisma.service';
import type { AuthenticatedUser } from '../../common/auth/authenticated-user';
import type { ApiSuccessEnvelope } from '../../common/http/api-response';
import { isPermissionKey } from './permissions/permission.registry';
import { PermissionService } from './permissions/permission.service';
import type { AuthAccountDto } from './dto/auth.dto';
import type {
  ChangePasswordRequestDto,
  ChangePasswordResponseDto,
  CurrentActorResponseDto,
} from './dto/account.dto';

type AccountWithPermissions = {
  id: string;
  username: string;
  passwordHash: string;
  displayName: string;
  role: AuthAccountDto['role'];
  isActive: boolean;
  permissions?: Array<{ permissionKey: string }>;
};

@Injectable()
export class AccountService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly permissionService?: PermissionService,
  ) {}

  async getCurrentActor(
    user: AuthenticatedUser | undefined,
  ): Promise<ApiSuccessEnvelope<CurrentActorResponseDto>> {
    const account = await this.findAuthenticatedAccount(user);
    const effectivePermissions = await this.getEffectivePermissions(account);

    return ok({
      account: {
        id: account.id,
        username: account.username,
        display_name: account.displayName,
        role: account.role,
        permissions: effectivePermissions.filter(isPermissionKey),
      },
      active_student_id: user?.activeStudentId ?? null,
    });
  }

  async changePassword(
    user: AuthenticatedUser | undefined,
    payload: ChangePasswordRequestDto,
  ): Promise<ApiSuccessEnvelope<ChangePasswordResponseDto>> {
    if (payload.new_password !== payload.confirm_password) {
      throw new BadRequestException('Password confirmation does not match');
    }

    const account = await this.findAuthenticatedAccount(user);
    const currentPasswordMatches = await compare(
      payload.old_password,
      account.passwordHash,
    );

    if (!currentPasswordMatches) {
      throw new UnauthorizedException('Current password is invalid');
    }

    await this.prisma.account.update({
      where: { id: account.id },
      data: { passwordHash: await hash(payload.new_password, 12) },
    });
    await this.prisma.refreshSession.updateMany({
      where: { accountId: account.id, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    return ok({ changed: true });
  }

  private async findAuthenticatedAccount(
    user: AuthenticatedUser | undefined,
  ): Promise<AccountWithPermissions> {
    if (!user) {
      throw new UnauthorizedException('Authentication required');
    }

    const account = await this.prisma.account.findFirst({
      where: { id: user.id, isActive: true },
      include: { permissions: { select: { permissionKey: true } } },
    });

    if (!account) {
      throw new UnauthorizedException('Authenticated account is inactive');
    }

    return account;
  }

  private async getEffectivePermissions(account: {
    id: string;
    permissions?: Array<{ permissionKey: string }>;
  }): Promise<string[]> {
    if (this.permissionService) {
      return this.permissionService.getAccountPermissions(account.id);
    }

    const [directPermissions, roleAssignments] = await Promise.all([
      account.permissions
        ? Promise.resolve(account.permissions)
        : this.prisma.accountPermission?.findMany
          ? this.prisma.accountPermission.findMany({
              where: { accountId: account.id },
              select: { permissionKey: true },
            })
          : Promise.resolve([]),
      this.prisma.accountRoleAssignment?.findMany
        ? this.prisma.accountRoleAssignment.findMany({
            where: { accountId: account.id, role: { isActive: true } },
            select: {
              role: {
                select: {
                  rolePermissions: { select: { permissionKey: true } },
                },
              },
            },
          })
        : Promise.resolve([]),
    ]);

    const set = new Set<string>();
    for (const dp of directPermissions) {
      set.add(dp.permissionKey);
    }
    for (const ra of roleAssignments) {
      for (const rp of ra.role?.rolePermissions ?? []) {
        set.add(rp.permissionKey);
      }
    }
    return Array.from(set).sort();
  }
}
