import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../../prisma/prisma.service';
import { AuthConfigService } from '../config/auth-config.service';
import type { AuthenticatedUser } from '../../../common/auth/authenticated-user';
import { isPermissionKey } from '../permissions/permission.registry';

type JwtPayload = {
  sub: string;
  username: string;
  role: AuthenticatedUser['role'];
  active_student_id?: string | null;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly prisma: PrismaService,
    authConfig: AuthConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: authConfig.jwtSecret,
    });
  }

  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    const account = await this.prisma.account.findFirst({
      where: {
        id: payload.sub,
        isActive: true,
      },
      include: {
        permissions: {
          select: {
            permissionKey: true,
          },
        },
      },
    });

    if (!account) {
      throw new UnauthorizedException('Invalid token subject');
    }

    return {
      id: account.id,
      username: account.username,
      role: account.role,
      activeStudentId: payload.active_student_id ?? null,
      permissions: account.permissions
        .map((item) => item.permissionKey)
        .filter(isPermissionKey),
    };
  }
}
