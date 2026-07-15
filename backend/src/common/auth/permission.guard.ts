import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import type { AccountRole } from '@prisma/client';
import { PermissionService } from '../../modules/identity-access/permissions/permission.service';
import type { PermissionKey } from '../../modules/identity-access/permissions/permission.registry';
import type { AuthenticatedUser } from './authenticated-user';
import {
  IS_PUBLIC_KEY,
  REQUIRED_PERMISSIONS_KEY,
  REQUIRED_ROLES_KEY,
  SKIP_AUTHORIZATION_KEY,
} from './auth.constants';

type AuthenticatedRequest = Request & { user?: AuthenticatedUser };

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly permissionService: PermissionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (this.getMetadata<boolean>(context, IS_PUBLIC_KEY)) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('Authentication required');
    }

    if (this.getMetadata<boolean>(context, SKIP_AUTHORIZATION_KEY)) {
      return true;
    }

    const requiredRoles = this.getMetadata<AccountRole[]>(
      context,
      REQUIRED_ROLES_KEY,
    );
    if (requiredRoles?.length && !requiredRoles.includes(user.role)) {
      throw new ForbiddenException('Insufficient role');
    }

    const requiredPermissions = this.getMetadata<PermissionKey[]>(
      context,
      REQUIRED_PERMISSIONS_KEY,
    );

    if (!requiredPermissions?.length) {
      throw new ForbiddenException('Permission metadata is required');
    }

    for (const permission of requiredPermissions) {
      const allowed = await this.permissionService.userHasPermission(
        user.id,
        permission,
      );

      if (!allowed) {
        throw new ForbiddenException('Insufficient permissions');
      }
    }

    return true;
  }

  private getMetadata<T>(
    context: ExecutionContext,
    key: string,
  ): T | undefined {
    return this.reflector.getAllAndOverride<T>(key, [
      context.getHandler(),
      context.getClass(),
    ]);
  }
}
