import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { ExecutionContext } from '@nestjs/common';
import { PermissionGuard } from './permission.guard';
import { Public } from './public.decorator';
import { RequirePermission } from './require-permission.decorator';
import { SkipAuthorization } from './skip-authorization.decorator';
import { RequireRole } from './require-role.decorator';
import type { AuthenticatedUser } from './authenticated-user';
import type { PermissionService } from '../../modules/identity-access/permissions/permission.service';

class OpenController {
  @Public()
  open() {
    return 'open';
  }
}

class SelfController {
  @SkipAuthorization()
  self() {
    return 'self';
  }
}

class SecureController {
  missingMetadata() {
    return 'missing';
  }

  @RequirePermission('identity.permissions.read')
  protected() {
    return 'protected';
  }
}

@RequireRole('admin', 'super_admin')
class AdminController {
  @RequirePermission('identity.permissions.read')
  protected() {
    return 'protected';
  }
}

describe('PermissionGuard', () => {
  const reflector = new Reflector();
  const permissionService: Pick<PermissionService, 'userHasPermission'> = {
    userHasPermission: jest.fn(),
  };
  const guard = new PermissionGuard(
    reflector,
    permissionService as PermissionService,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('allows public routes without checking permissions', async () => {
    await expect(
      guard.canActivate(contextFor(OpenController, 'open')),
    ).resolves.toBe(true);
    expect(permissionService.userHasPermission).not.toHaveBeenCalled();
  });

  it('allows authenticated self-service routes when authorization is skipped', async () => {
    await expect(
      guard.canActivate(contextFor(SelfController, 'self', actor())),
    ).resolves.toBe(true);
    expect(permissionService.userHasPermission).not.toHaveBeenCalled();
  });

  it('rejects protected routes without an authenticated user', async () => {
    await expect(
      guard.canActivate(contextFor(SecureController, 'protected')),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('fails closed when protected routes have no explicit permissions', async () => {
    await expect(
      guard.canActivate(
        contextFor(SecureController, 'missingMetadata', actor()),
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('allows users with every required business permission', async () => {
    jest.mocked(permissionService.userHasPermission).mockResolvedValue(true);

    await expect(
      guard.canActivate(contextFor(SecureController, 'protected', actor())),
    ).resolves.toBe(true);
    expect(permissionService.userHasPermission).toHaveBeenCalledWith(
      'user-1',
      'identity.permissions.read',
    );
  });

  it('denies users missing a required business permission', async () => {
    jest.mocked(permissionService.userHasPermission).mockResolvedValue(false);

    await expect(
      guard.canActivate(contextFor(SecureController, 'protected', actor())),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('denies a non-admin even when the account has the required permission', async () => {
    jest.mocked(permissionService.userHasPermission).mockResolvedValue(true);

    await expect(
      guard.canActivate(
        contextFor(AdminController, 'protected', actor({ role: 'teacher' })),
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});

function actor(overrides: Partial<AuthenticatedUser> = {}): AuthenticatedUser {
  return {
    id: 'user-1',
    username: 'admin',
    role: 'super_admin',
    ...overrides,
  };
}

function contextFor(
  ControllerClass: new () => object,
  methodName: string,
  user?: AuthenticatedUser,
): ExecutionContext {
  const instance = new ControllerClass();
  const handler = instance[
    methodName as keyof typeof instance
  ] as () => unknown;

  return {
    getClass: () => ControllerClass,
    getHandler: () => handler,
    switchToHttp: () => ({
      getRequest: () => ({ user }),
    }),
  } as ExecutionContext;
}
