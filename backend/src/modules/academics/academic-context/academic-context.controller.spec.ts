import 'reflect-metadata';
import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import type { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  REQUIRED_PERMISSIONS_KEY,
  REQUIRED_ROLES_KEY,
} from '../../../common/auth/auth.constants';
import { JwtAuthenticationGuard } from '../../../common/auth/jwt-authentication.guard';
import { PermissionGuard } from '../../../common/auth/permission.guard';
import type { PermissionService } from '../../identity-access/permissions/permission.service';
import { AcademicContextController } from './academic-context.controller';
import type { AcademicContextService } from './academic-context.service';

describe('AcademicContextController', () => {
  it('delegates the current context read and declares admin authorization', async () => {
    const getCurrentContext = jest.fn().mockResolvedValue({ success: true });
    const controller = new AcademicContextController({
      getCurrentContext,
    } as unknown as AcademicContextService);

    await expect(controller.getCurrent()).resolves.toEqual({ success: true });
    expect(getCurrentContext).toHaveBeenCalledTimes(1);

    const handler = Object.getOwnPropertyDescriptor(
      AcademicContextController.prototype,
      'getCurrent',
    )?.value as unknown;
    expect(Reflect.getMetadata(REQUIRED_PERMISSIONS_KEY, handler)).toEqual([
      'academics.context.read',
    ]);
    expect(
      Reflect.getMetadata(REQUIRED_ROLES_KEY, AcademicContextController),
    ).toEqual(['admin', 'super_admin']);
  });

  it('rejects an unauthenticated request before authorization', () => {
    const guard = new JwtAuthenticationGuard(new Reflector());
    expect(() => guard.handleRequest(null, false)).toThrow(
      UnauthorizedException,
    );
  });

  it('rejects an authenticated admin without the academic context permission', async () => {
    const permissionService: Pick<PermissionService, 'userHasPermission'> = {
      userHasPermission: jest.fn().mockResolvedValue(false),
    };
    const guard = new PermissionGuard(
      new Reflector(),
      permissionService as PermissionService,
    );
    const handler = Object.getOwnPropertyDescriptor(
      AcademicContextController.prototype,
      'getCurrent',
    )?.value as () => unknown;
    const context = {
      getClass: () => AcademicContextController,
      getHandler: () => handler,
      switchToHttp: () => ({
        getRequest: () => ({
          user: { id: 'admin-1', username: 'admin', role: 'admin' },
        }),
      }),
    } as unknown as ExecutionContext;

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });
});
