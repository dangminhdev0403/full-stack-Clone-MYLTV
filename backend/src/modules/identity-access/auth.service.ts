import { Injectable, UnauthorizedException } from '@nestjs/common';
import { compare } from 'bcrypt';
import { createHash, randomBytes } from 'crypto';
import { ok } from '../../common/http/api-response';
import { PrismaService } from '../../prisma/prisma.service';
import type { AuthenticatedUser } from '../../common/auth/authenticated-user';
import type { ApiSuccessEnvelope } from '../../common/http/api-response';
import { AuthConfigService } from './config/auth-config.service';
import { AuthTokenService } from './auth-token.service';
import { isPermissionKey } from './permissions/permission.registry';
import { PermissionService } from './permissions/permission.service';
import type {
  AuthAccountDto,
  LoginRequestDto,
  LoginResponseDto,
  LogoutRequestDto,
  LogoutResponseDto,
  RefreshTokenRequestDto,
  RefreshTokenResponseDto,
} from './dto/auth.dto';

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
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authConfig: AuthConfigService,
    private readonly authTokenService: AuthTokenService,
    private readonly permissionService?: PermissionService,
  ) {}

  async login(
    payload: LoginRequestDto,
  ): Promise<ApiSuccessEnvelope<LoginResponseDto>> {
    const account = await this.prisma.account.findFirst({
      where: { username: payload.username, isActive: true },
      include: { permissions: { select: { permissionKey: true } } },
    });

    if (!account || !(await compare(payload.password, account.passwordHash))) {
      throw new UnauthorizedException('Invalid username or password');
    }

    const effectivePermissions = await this.getEffectivePermissions(account);
    const tokens = await this.issueTokens(account);

    return ok({
      ...tokens,
      account: {
        id: account.id,
        username: account.username,
        display_name: account.displayName,
        role: account.role,
        permissions: effectivePermissions.filter(isPermissionKey),
      },
    });
  }

  async refreshToken(
    payload: RefreshTokenRequestDto,
  ): Promise<ApiSuccessEnvelope<RefreshTokenResponseDto>> {
    const session = await this.prisma.refreshSession.findUnique({
      where: { tokenHash: this.hashToken(payload.refresh_token) },
      include: {
        account: {
          include: { permissions: { select: { permissionKey: true } } },
        },
      },
    });

    if (
      !session ||
      session.revokedAt ||
      session.expiresAt <= new Date() ||
      !session.account.isActive
    ) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const claim = await this.prisma.refreshSession.updateMany({
      where: { id: session.id, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    if (claim.count !== 1) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const tokens = await this.issueTokens(session.account);

    return ok(tokens);
  }

  async logout(
    user: AuthenticatedUser | undefined,
    payload: LogoutRequestDto,
  ): Promise<ApiSuccessEnvelope<LogoutResponseDto>> {
    void payload;

    if (!user) {
      throw new UnauthorizedException('Authentication required');
    }

    await this.prisma.refreshSession.updateMany({
      where: { accountId: user.id, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    return ok({ logged_out: true });
  }

  private async issueTokens(
    account: AccountWithPermissions,
  ): Promise<RefreshTokenResponseDto> {
    let activeStudentId: string | null = null;
    if (account.role === 'parent' || account.role === 'student') {
      const link = await this.prisma.studentAccountLink.findFirst({
        where: { accountId: account.id, isActive: true },
        select: { studentId: true },
      });
      activeStudentId = link?.studentId ?? null;
    }

    const access_token = await this.authTokenService.issueAccessToken({
      id: account.id,
      username: account.username,
      role: account.role,
      activeStudentId,
    });

    const refresh_token = randomBytes(32).toString('base64url');
    await this.prisma.refreshSession.create({
      data: {
        accountId: account.id,
        tokenHash: this.hashToken(refresh_token),
        expiresAt: this.refreshTokenExpiresAt(),
      },
    });

    return {
      access_token,
      refresh_token,
      expires_in: this.authConfig.jwtExpiresInSeconds,
    };
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

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private refreshTokenExpiresAt(): Date {
    return new Date(
      Date.now() + this.authConfig.refreshTokenTtlDays * 24 * 60 * 60 * 1000,
    );
  }
}
