import 'reflect-metadata';
import {
  BadRequestException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
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
import {
  validateCreateAcademicYear,
  validateCreateSemester,
  validateUpdateAcademicYear,
  validateUpdateSemester,
} from './academic-context.validation';

describe('AcademicContextController', () => {
  let mockService: Record<string, jest.Mock>;
  let controller: AcademicContextController;

  const mockActor = {
    id: 'admin-1',
    username: 'admin',
    role: 'admin' as const,
  };

  beforeEach(() => {
    mockService = {
      getCurrentContext: jest.fn().mockResolvedValue({ success: true }),
      listYears: jest.fn().mockResolvedValue({ success: true }),
      createYear: jest.fn().mockResolvedValue({ success: true }),
      updateYear: jest.fn().mockResolvedValue({ success: true }),
      setYearCurrent: jest.fn().mockResolvedValue({ success: true }),
      listSemesters: jest.fn().mockResolvedValue({ success: true }),
      createSemester: jest.fn().mockResolvedValue({ success: true }),
      updateSemester: jest.fn().mockResolvedValue({ success: true }),
      setSemesterCurrent: jest.fn().mockResolvedValue({ success: true }),
    };
    controller = new AcademicContextController(
      mockService as unknown as AcademicContextService,
    );
  });

  it('delegates the current context read and declares admin authorization', async () => {
    await expect(controller.getCurrent()).resolves.toEqual({ success: true });
    expect(mockService.getCurrentContext).toHaveBeenCalledTimes(1);

    const handler = Object.getOwnPropertyDescriptor(
      AcademicContextController.prototype,
      'getCurrent',
    )?.value as object;
    expect(Reflect.getMetadata(REQUIRED_PERMISSIONS_KEY, handler)).toEqual([
      'academics.context.read',
    ]);
    expect(
      Reflect.getMetadata(REQUIRED_ROLES_KEY, AcademicContextController),
    ).toEqual(['admin', 'super_admin']);
  });

  it('delegates listYears with academics.context.read permission', async () => {
    await expect(controller.listYears()).resolves.toEqual({ success: true });
    expect(mockService.listYears).toHaveBeenCalledTimes(1);

    const handler = Object.getOwnPropertyDescriptor(
      AcademicContextController.prototype,
      'listYears',
    )?.value as object;
    expect(Reflect.getMetadata(REQUIRED_PERMISSIONS_KEY, handler)).toEqual([
      'academics.context.read',
    ]);
  });

  it('delegates createYear with academics.context.manage permission and validates DTO', async () => {
    const payload = {
      id: 'ay-2026-2027',
      code: '2026-2027',
      display_name: 'Năm học 2026-2027',
      starts_on: '2026-08-01',
      ends_on: '2027-07-31',
    };

    await expect(controller.createYear(payload, mockActor)).resolves.toEqual({
      success: true,
    });
    expect(mockService.createYear).toHaveBeenCalledWith(payload, mockActor);

    const handler = Object.getOwnPropertyDescriptor(
      AcademicContextController.prototype,
      'createYear',
    )?.value as object;
    expect(Reflect.getMetadata(REQUIRED_PERMISSIONS_KEY, handler)).toEqual([
      'academics.context.manage',
    ]);
  });

  it('delegates updateYear with academics.context.manage permission', async () => {
    const payload = { display_name: 'Updated Name' };
    await expect(
      controller.updateYear('ay-2025-2026', payload, mockActor),
    ).resolves.toEqual({ success: true });
    expect(mockService.updateYear).toHaveBeenCalledWith(
      'ay-2025-2026',
      payload,
      mockActor,
    );

    const handler = Object.getOwnPropertyDescriptor(
      AcademicContextController.prototype,
      'updateYear',
    )?.value as object;
    expect(Reflect.getMetadata(REQUIRED_PERMISSIONS_KEY, handler)).toEqual([
      'academics.context.manage',
    ]);
  });

  it('delegates setYearCurrent with academics.context.manage permission', async () => {
    await expect(
      controller.setYearCurrent('ay-2025-2026', mockActor),
    ).resolves.toEqual({ success: true });
    expect(mockService.setYearCurrent).toHaveBeenCalledWith(
      'ay-2025-2026',
      mockActor,
    );

    const handler = Object.getOwnPropertyDescriptor(
      AcademicContextController.prototype,
      'setYearCurrent',
    )?.value as object;
    expect(Reflect.getMetadata(REQUIRED_PERMISSIONS_KEY, handler)).toEqual([
      'academics.context.manage',
    ]);
  });

  it('delegates listSemesters with academics.context.read permission', async () => {
    await expect(controller.listSemesters('ay-2025-2026')).resolves.toEqual({
      success: true,
    });
    expect(mockService.listSemesters).toHaveBeenCalledWith('ay-2025-2026');

    const handler = Object.getOwnPropertyDescriptor(
      AcademicContextController.prototype,
      'listSemesters',
    )?.value as object;
    expect(Reflect.getMetadata(REQUIRED_PERMISSIONS_KEY, handler)).toEqual([
      'academics.context.read',
    ]);
  });

  it('delegates createSemester with academics.context.manage permission', async () => {
    const payload = {
      id: 'sem-1',
      academic_year_id: 'ay-2025-2026',
      code: 'sem-1',
      display_name: 'Học kỳ 1',
      starts_on: '2025-08-01',
      ends_on: '2025-12-31',
      sort_order: 1,
    };

    await expect(
      controller.createSemester(payload, mockActor),
    ).resolves.toEqual({ success: true });
    expect(mockService.createSemester).toHaveBeenCalledWith(payload, mockActor);

    const handler = Object.getOwnPropertyDescriptor(
      AcademicContextController.prototype,
      'createSemester',
    )?.value as object;
    expect(Reflect.getMetadata(REQUIRED_PERMISSIONS_KEY, handler)).toEqual([
      'academics.context.manage',
    ]);
  });

  it('delegates updateSemester with academics.context.manage permission', async () => {
    const payload = { display_name: 'Updated Term' };
    await expect(
      controller.updateSemester('sem-1', payload, mockActor),
    ).resolves.toEqual({ success: true });
    expect(mockService.updateSemester).toHaveBeenCalledWith(
      'sem-1',
      payload,
      mockActor,
    );

    const handler = Object.getOwnPropertyDescriptor(
      AcademicContextController.prototype,
      'updateSemester',
    )?.value as object;
    expect(Reflect.getMetadata(REQUIRED_PERMISSIONS_KEY, handler)).toEqual([
      'academics.context.manage',
    ]);
  });

  it('delegates setSemesterCurrent with academics.context.manage permission', async () => {
    await expect(
      controller.setSemesterCurrent('sem-1', mockActor),
    ).resolves.toEqual({ success: true });
    expect(mockService.setSemesterCurrent).toHaveBeenCalledWith(
      'sem-1',
      mockActor,
    );

    const handler = Object.getOwnPropertyDescriptor(
      AcademicContextController.prototype,
      'setSemesterCurrent',
    )?.value as object;
    expect(Reflect.getMetadata(REQUIRED_PERMISSIONS_KEY, handler)).toEqual([
      'academics.context.manage',
    ]);
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

  describe('validations', () => {
    it('throws BadRequestException for invalid createAcademicYear payload', () => {
      expect(() => validateCreateAcademicYear({})).toThrow(BadRequestException);
      expect(() =>
        validateCreateAcademicYear({
          id: 'y1',
          code: 'c1',
          display_name: 'd1',
          starts_on: '2025-08-01',
          ends_on: '2025-07-01',
        }),
      ).toThrow(BadRequestException);
    });

    it('throws BadRequestException for invalid updateAcademicYear payload', () => {
      expect(() => validateUpdateAcademicYear({})).toThrow(BadRequestException);
    });

    it('throws BadRequestException for invalid createSemester payload', () => {
      expect(() =>
        validateCreateSemester({
          id: 's1',
          academic_year_id: 'y1',
          code: 'c1',
          display_name: 'd1',
          starts_on: '2025-08-01',
          ends_on: '2025-12-31',
          sort_order: -1,
        }),
      ).toThrow(BadRequestException);
    });

    it('throws BadRequestException for invalid updateSemester payload', () => {
      expect(() => validateUpdateSemester({})).toThrow(BadRequestException);
    });
  });
});
